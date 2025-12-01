// mobile/src/screens/IssuesScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { colors, cardShadow } from '../theme';

const BACKEND_URL = 'http://localhost:4000';

export default function IssuesScreen() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    fetchIssues();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.mutedText}>Loading issues…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchIssues}>
          <Text style={styles.refreshButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!issues.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>No issues detected for this store.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchIssues}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderIssue = ({ item }) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const dateLabel = createdAt ? createdAt.toLocaleString() : '';

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.rating}>
              {item.rating != null ? item.rating.toFixed(1) : '–'} ★
            </Text>
            {item.source && (
              <Text style={styles.source}>Source: {item.source}</Text>
            )}
          </View>
          {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
        </View>
        <Text style={styles.text}>
          {item.text || 'No description available.'}
        </Text>

        {Array.isArray(item.themes) && item.themes.length > 0 && (
          <View style={styles.themeRow}>
            {item.themes.map((theme) => (
              <View key={theme} style={styles.themePill}>
                <Text style={styles.themePillText}>{theme}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
      <View style={styles.container}>
        <View style={styles.headerRowTop}>
          <View>
            <Text style={styles.title}>Issues</Text>
            <Text style={styles.subtitle}>Focus on what needs attention first.</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshChip, loading && { opacity: 0.6 }]}
            onPress={fetchIssues}
            disabled={loading}
          >
            <Text style={styles.refreshChipText}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.danger,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
  },
  list: {
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff8f8',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
    ...cardShadow,
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
    color: colors.muted,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#111',
  },
  mutedText: {
    color: colors.muted,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  themePillText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  refreshButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  headerRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  refreshChipText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
});
