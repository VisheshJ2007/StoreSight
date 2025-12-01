// mobile/src/screens/OverviewScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { colors, cardShadow } from '../theme';

const BACKEND_URL = 'http://localhost:4000'; // Node/Express backend

export default function OverviewScreen() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [topThemes, setTopThemes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

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

    const fetchSummary = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/summary?range=7d`);
        if (!res.ok) {
          throw new Error('Failed to load summary');
        }
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load summary:', err);
        setSummaryError('Summary unavailable');
      }
    };

    const fetchIssues = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/issues?limit=50`);
        const data = await res.json();
        const issues = Array.isArray(data) ? data : [];

        const counts = new Map();
        for (const issue of issues) {
          if (!Array.isArray(issue.themes)) continue;
          for (const theme of issue.themes) {
            const key = String(theme).toLowerCase();
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }

        const sorted = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);

        setTopThemes(sorted);
      } catch (err) {
        console.error('Failed to load top themes:', err);
      }
    };

    fetchOverview();
    fetchIssues();
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Loading overview…</Text>
      </View>
    );
  }

  if (error || !overview) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>{error || 'No data'}</Text>
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

  const lastUpdatedLabel = lastDate
    ? `Last updated ${lastDate.toLocaleString()}`
    : 'No recent reviews yet';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.storeName}>Store {storeId}</Text>
        <Text style={styles.subtitle}>At-a-glance performance and sentiment</Text>
        <Text style={styles.lastUpdated}>{lastUpdatedLabel}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Reviews</Text>
          <Text style={styles.value}>{totalReviews}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Avg Rating</Text>
          <Text style={styles.value}>
            {avgRating?.toFixed(2) ?? 'N/A'} ★
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

      {summary && (
        <View style={[styles.card, styles.primaryCard]}>
          <Text style={styles.label}>Summary (Last 7 days)</Text>
          <Text style={styles.summaryText}>{summary.summaryText}</Text>

          {Array.isArray(summary.highlights) && summary.highlights.length > 0 && (
            <View style={styles.highlightList}>
              {summary.highlights.map((h, idx) => (
                <Text key={idx} style={styles.highlightItem}>
                  • {h}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {!summary && summaryError && (
        <View style={styles.card}>
          <Text style={styles.label}>Summary</Text>
          <Text style={styles.summaryFallback}>{summaryError}</Text>
        </View>
      )}

      {topThemes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>Top Themes</Text>
          <View style={styles.themeRow}>
            {topThemes.map((theme) => (
              <View key={theme} style={styles.themePill}>
                <Text style={styles.themePillText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
    paddingBottom: 32,
    gap: 16,
    backgroundColor: colors.background,
  },
  headerBlock: {
    marginBottom: 4,
  },
  storeName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
  },
  lastUpdated: {
    marginTop: 4,
    fontSize: 11,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  primaryCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
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
  mutedText: {
    color: colors.muted,
  },
  summaryText: {
    marginTop: 6,
    fontSize: 14,
    color: '#111827',
  },
  highlightList: {
    marginTop: 8,
    gap: 4,
  },
  highlightItem: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryFallback: {
    marginTop: 6,
    fontSize: 13,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  themePillText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
