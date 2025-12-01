// backend/src/services/summaryService.js
// Combines overview, metrics, and issues into a concise summary object.

import { metricsService } from './metricsService.js';

function computeTrend(recentAvg, overallAvg) {
  if (recentAvg == null || overallAvg == null) return 'flat';

  const diff = recentAvg - overallAvg;
  const pct = overallAvg !== 0 ? diff / overallAvg : 0;

  if (pct > 0.05) return 'up';
  if (pct < -0.05) return 'down';
  return 'flat';
}

function buildSummaryText({ overview, recentAvgRating, trend, topThemes }) {
  const total = overview.totalReviews;
  const avg = overview.avgRating;

  const parts = [];

  if (total > 0 && avg != null) {
    parts.push(
      `You have ${total} total reviews with an average rating of ${avg.toFixed(
        1
      )} ★.`,
    );
  }

  if (recentAvgRating != null && trend !== 'flat') {
    const direction = trend === 'up' ? 'up' : 'down';
    parts.push(
      `In the selected period your average rating is ${recentAvgRating.toFixed(
        1
      )} ★, trending ${direction} versus your overall average.`,
    );
  }

  if (topThemes.length) {
    const themeStr = topThemes.join(', ');
    parts.push(`Guests are most often mentioning: ${themeStr}.`);
  }

  if (!parts.length) {
    return 'Not enough data yet to build a summary.';
  }

  return parts.join(' ');
}

export async function getStoreSummary(storeId, range = '7d') {
  const numericStoreId = Number(storeId);
  if (!Number.isFinite(numericStoreId)) {
    throw new Error('Invalid storeId');
  }

  const [overview, metrics, issues] = await Promise.all([
    metricsService.getStoreOverview(numericStoreId),
    metricsService.getStoreMetrics(numericStoreId, range),
    metricsService.getStoreIssues(numericStoreId, 50),
  ]);

  let recentAvgRating = null;
  if (metrics.length) {
    const sum = metrics.reduce(
      (acc, m) => (m.avgRating != null ? acc + m.avgRating : acc),
      0,
    );
    const count = metrics.filter((m) => m.avgRating != null).length;
    if (count > 0) {
      recentAvgRating = sum / count;
    }
  }

  const trend = computeTrend(recentAvgRating, overview.avgRating);

  const themeCounts = new Map();
  for (const issue of issues) {
    if (!Array.isArray(issue.themes)) continue;
    for (const theme of issue.themes) {
      const key = String(theme).toLowerCase();
      themeCounts.set(key, (themeCounts.get(key) || 0) + 1);
    }
  }

  const topThemes = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const summaryText = buildSummaryText({
    overview,
    recentAvgRating,
    trend,
    topThemes,
  });

  const highlights = [];

  if (trend === 'up') {
    highlights.push('Rating trend: Up vs overall average.');
  } else if (trend === 'down') {
    highlights.push('Rating trend: Down vs overall average.');
  } else {
    highlights.push('Rating trend: Flat vs overall average.');
  }

  if (topThemes.length) {
    highlights.push(`Top themes: ${topThemes.join(', ')}.`);
  }

  if (overview.negativeReviews > 0) {
    highlights.push(
      `${overview.negativeReviews} negative reviews so far; focus on resolving these quickly.`,
    );
  }

  return {
    storeId: numericStoreId,
    range,
    summaryText,
    highlights,
    stats: {
      totalReviews: overview.totalReviews,
      avgRating: overview.avgRating,
      recentAvgRating,
      positiveReviews: overview.positiveReviews,
      negativeReviews: overview.negativeReviews,
      topThemes,
      firstReviewAt: overview.firstReviewAt,
      lastReviewAt: overview.lastReviewAt,
    },
  };
}
