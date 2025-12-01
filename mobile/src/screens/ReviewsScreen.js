// mobile/src/screens/ReviewsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, cardShadow } from '../theme';

const BACKEND_URL = 'http://localhost:4000'; // same as OverviewScreen

export default function ReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/stores/1/reviews`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : data.reviews || [];
      setReviews(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Helper: pick a color based on sentiment
  const getSentimentInfo = (review) => {
    const label = review.sentimentLabel;
    const scoreRaw =
      typeof review.sentimentScore === 'number'
        ? review.sentimentScore
        : typeof review.sentiment === 'number'
        ? review.sentiment
        : null;

    let sentimentLabel = label;
    let color = '#999';

    // If no label, derive one from score
    if (!sentimentLabel && scoreRaw != null) {
      if (scoreRaw >= 0.6) sentimentLabel = 'Positive';
      else if (scoreRaw <= 0.4) sentimentLabel = 'Negative';
      else sentimentLabel = 'Neutral';
    }

    const lower = (sentimentLabel || '').toLowerCase();

    if (lower.includes('positive')) color = '#22c55e'; // green
    else if (lower.includes('negative')) color = '#ef4444'; // red
    else if (lower.includes('neutral')) color = '#eab308'; // amber

    return {
      label: sentimentLabel || 'N/A',
      color,
    };
  };

  const renderReview = ({ item }) => {
    const { label, color } = getSentimentInfo(item);
    const scoreRaw =
      typeof item.sentimentScore === 'number'
        ? item.sentimentScore
        : typeof item.sentiment === 'number'
        ? item.sentiment
        : null;
    const sentimentPercent =
      scoreRaw != null ? `${Math.round(scoreRaw * 100)}%` : null;

    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const dateLabel = createdAt
      ? createdAt.toLocaleString()
      : item.date || null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.ratingText}>
              {item.rating != null ? item.rating.toFixed(1) : '–'} ★
            </Text>
            {dateLabel && <Text style={styles.metaText}>{dateLabel}</Text>}
            {item.source && (
              <Text style={styles.metaText}>Source: {item.source}</Text>
            )}
          </View>

          <View style={[styles.sentimentPill, { backgroundColor: color }]}>
            <Text style={styles.sentimentText}>
              {label}
              {sentimentPercent ? ` · ${sentimentPercent}` : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.reviewText}>{item.text || item.comment}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading reviews…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchReviews}>
          <Text style={styles.refreshButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reviews.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No reviews found for this store.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchReviews}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Optional: simple summary at the top
  const avgRating =
    reviews.reduce(
      (sum, r) => (typeof r.rating === 'number' ? sum + r.rating : sum),
      0
    ) / reviews.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.summaryTitle}>Reviews</Text>
          <Text style={styles.summarySubtitle}>See every review in one place.</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshChip, loading && { opacity: 0.6 }]}
          onPress={fetchReviews}
          disabled={loading}
        >
          <Text style={styles.refreshChipText}>{loading ? 'Refreshing…' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLine}>
          Total reviews:{' '}
          <Text style={styles.summaryValue}>{reviews.length}</Text>
        </Text>
        {avgRating ? (
          <Text style={styles.summaryLine}>
            Average rating:{' '}
            <Text style={styles.summaryValue}>{avgRating.toFixed(1)} ★</Text>
          </Text>
        ) : null}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item, index) =>
          item.id?.toString() || item.reviewId?.toString() || String(index)
        }
        renderItem={renderReview}
        scrollEnabled={false} // FlatList inside ScrollView: let ScrollView handle scrolling
        contentContainerStyle={styles.list}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
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
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryLine: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#111827',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: colors.muted,
  },
  sentimentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sentimentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: '#111',
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  refreshButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
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
