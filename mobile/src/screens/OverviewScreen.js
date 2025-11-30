// mobile/src/screens/OverviewScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';

const BACKEND_URL = 'http://localhost:4000'; // Node/Express backend

export default function OverviewScreen() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/overview`);
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading overview…</Text>
      </View>
    );
  }

  if (error || !overview) {
    return (
      <View style={styles.center}>
        <Text>{error || 'No data'}</Text>
      </View>
    );
  }

  const {
    storeId,
    totalReviews,
    avgRating,
    positiveReviews,
    negativeReviews,
    firstReviewAt,
    lastReviewAt,
  } = overview;

  const positivePct =
    totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;
  const negativePct =
    totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0;

  const firstDate = firstReviewAt ? new Date(firstReviewAt) : null;
  const lastDate = lastReviewAt ? new Date(lastReviewAt) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.storeName}>Store #{storeId}</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Reviews</Text>
          <Text style={styles.value}>{totalReviews}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Avg Rating</Text>
          <Text style={styles.value}>
            {avgRating != null ? avgRating.toFixed(1) : '—'} ★
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>Positive</Text>
          <Text style={styles.value}>
            {positiveReviews} ({positivePct}%)
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Negative</Text>
          <Text style={styles.value}>
            {negativeReviews} ({negativePct}%)
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Review Window</Text>
        <Text style={styles.value}>
          {firstDate
            ? firstDate.toLocaleString()
            : '—'}{' '}
          →{' '}
          {lastDate ? lastDate.toLocaleString() : '—'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Quick Insight</Text>
        <Text style={styles.briefingLine}>
          • {totalReviews} total reviews with an average rating of{' '}
          {avgRating != null ? avgRating.toFixed(1) : '—'} ★.
        </Text>
        <Text style={styles.briefingLine}>
          • {positiveReviews} positive vs {negativeReviews} negative reviews
          ({positivePct}% / {negativePct}%).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  storeName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  briefingLine: {
    marginTop: 4,
    fontSize: 14,
  },
});
