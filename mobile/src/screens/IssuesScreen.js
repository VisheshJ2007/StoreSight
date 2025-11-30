// mobile/src/screens/IssuesScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';

const BACKEND_URL = 'http://localhost:4000';

export default function IssuesScreen() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/issues`);
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading issues…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!issues.length) {
    return (
      <View style={styles.center}>
        <Text>No issues detected for this store.</Text>
      </View>
    );
  }

  const renderIssue = ({ item }) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const dateLabel = createdAt ? createdAt.toLocaleString() : '';

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.rating}>
            {item.rating != null ? item.rating.toFixed(1) : '–'} ★
          </Text>
          {item.source && (
            <Text style={styles.source}>Source: {item.source}</Text>
          )}
        </View>
        {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
        <Text style={styles.text}>
          {item.text || 'No description available.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issues (Low-Rating Reviews)</Text>
      <FlatList
        data={issues}
        keyExtractor={(item, index) => item.id?.toString() || String(index)}
        renderItem={renderIssue}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  source: {
    fontSize: 12,
    color: '#555',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#111',
  },
});
