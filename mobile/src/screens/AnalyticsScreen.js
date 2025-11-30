// mobile/src/screens/AnalyticsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

const BACKEND_URL = 'http://localhost:4000';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/metrics?range=7d`);
        const data = await res.json();
        setMetrics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading analytics…</Text>
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

  if (!metrics.length) {
    return (
      <View style={styles.center}>
        <Text>No analytics data for this range.</Text>
      </View>
    );
  }

  // Simple summary
  const totalReviews = metrics.reduce((sum, m) => sum + (m.reviewCount || 0), 0);
  const avgRatingAll =
    totalReviews > 0
      ? metrics.reduce((sum, m) => sum + (m.avgRating || 0) * (m.reviewCount || 0), 0) /
        totalReviews
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analytics (Last 7 Days)</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLine}>
          Total reviews:{' '}
          <Text style={styles.summaryValue}>{totalReviews}</Text>
        </Text>
        {avgRatingAll != null && (
          <Text style={styles.summaryLine}>
            Overall avg rating:{' '}
            <Text style={styles.summaryValue}>{avgRatingAll.toFixed(2)} ★</Text>
          </Text>
        )}
      </View>

      {metrics.map((m, idx) => {
        const date = m.date ? new Date(m.date) : null;
        const dateLabel = date ? date.toLocaleDateString() : 'Unknown';
        return (
          <View key={idx} style={styles.dayCard}>
            <Text style={styles.dayDate}>{dateLabel}</Text>
            <Text style={styles.dayLine}>
              Reviews:{' '}
              <Text style={styles.dayValue}>{m.reviewCount}</Text>
            </Text>
            <Text style={styles.dayLine}>
              Avg rating:{' '}
              <Text style={styles.dayValue}>
                {m.avgRating != null ? m.avgRating.toFixed(2) : '—'} ★
              </Text>
            </Text>
            <Text style={styles.dayLine}>
              Avg sentiment:{' '}
              <Text style={styles.dayValue}>
                {typeof m.avgSentiment === 'number'
                  ? `${Math.round(m.avgSentiment * 100)}%`
                  : '—'}
              </Text>
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
  },
  summaryCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  summaryLine: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#111',
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLine: {
    fontSize: 14,
    color: '#555',
  },
  dayValue: {
    fontWeight: '600',
    color: '#111',
  },
});
