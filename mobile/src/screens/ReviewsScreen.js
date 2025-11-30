// mobile/src/screens/ReviewsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';

const BACKEND_URL = 'http://localhost:4000'; // same as OverviewScreen

export default function ReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/stores/1/reviews`);
        const data = await res.json();

        // Support either: [ ... ] or { reviews: [ ... ] }
        const list = Array.isArray(data) ? data : data.reviews || [];
        setReviews(list);
      } catch (err) {
        console.error(err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

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
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading reviews…</Text>
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

  if (!reviews.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No reviews found for this store.</Text>
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
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Reviews</Text>
        <Text style={styles.summaryLine}>
          Total: <Text style={styles.summaryValue}>{reviews.length}</Text>
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
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  emptyText: {
    fontSize: 14,
    color: '#555',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#111',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
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
    color: '#777',
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
});
