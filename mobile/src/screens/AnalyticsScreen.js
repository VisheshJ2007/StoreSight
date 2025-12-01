// mobile/src/screens/AnalyticsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { colors, cardShadow } from '../theme';

const BACKEND_URL = 'http://localhost:4000';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('7d'); // '7d' | '30d' | '90d'

  const fetchMetrics = async (selectedRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/stores/1/metrics?range=${selectedRange}`);
      const data = await res.json();
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics');
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(range);
  }, [range]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Loading analytics…</Text>
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
        <Text style={styles.mutedText}>No analytics data for this range.</Text>
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
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} days</Text>
        </View>
        <View style={styles.rangeToggle}>
          {['7d', '30d', '90d'].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.rangeButton, range === value && styles.rangeButtonActive]}
              onPress={() => setRange(value)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  range === value && styles.rangeButtonTextActive,
                ]}
              >
                {value.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
  },
  rangeToggle: {
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  rangeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rangeButtonActive: {
    backgroundColor: colors.primary,
  },
  rangeButtonText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  summaryLine: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#111',
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLine: {
    fontSize: 14,
    color: colors.muted,
  },
  dayValue: {
    fontWeight: '600',
    color: '#111',
  },
  mutedText: {
    color: colors.muted,
  },
});
