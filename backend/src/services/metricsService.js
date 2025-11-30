// backend/src/services/metricsService.js
import { execute } from './snowflakeClient.js';

/**
 * High-level summary for a store
 * Used by: GET /stores/:id/overview
 */
async function getStoreOverview(storeId) {
  const sql = `
    SELECT
      COUNT(*) AS TOTAL_REVIEWS,
      AVG(RATING) AS AVG_RATING,
      SUM(IFF(SENTIMENT_LABEL = 'Positive', 1, 0)) AS POSITIVE_REVIEWS,
      SUM(IFF(SENTIMENT_LABEL = 'Negative', 1, 0)) AS NEGATIVE_REVIEWS,
      MIN(CREATED_AT) AS FIRST_REVIEW_AT,
      MAX(CREATED_AT) AS LAST_REVIEW_AT
    FROM REVIEWS
    WHERE STORE_ID = ?
  `;

  const [row] = await execute(sql, [storeId]) || [{}];

  return {
    storeId: Number(storeId),
    totalReviews: Number(row.TOTAL_REVIEWS || 0),
    avgRating: row.AVG_RATING != null ? Number(row.AVG_RATING) : null,
    positiveReviews: Number(row.POSITIVE_REVIEWS || 0),
    negativeReviews: Number(row.NEGATIVE_REVIEWS || 0),
    firstReviewAt: row.FIRST_REVIEW_AT || null,
    lastReviewAt: row.LAST_REVIEW_AT || null,
  };
}

/**
 * Timeseries metrics for charts
 * Used by: GET /stores/:id/metrics?range=7d|30d|90d
 */
async function getStoreMetrics(storeId, range = '30d') {
  let daysBack;
  switch (range) {
    case '7d':
      daysBack = 7;
      break;
    case '90d':
      daysBack = 90;
      break;
    case '30d':
    default:
      daysBack = 30;
  }

  const sql = `
    SELECT
      DATE_TRUNC('day', CREATED_AT) AS DAY,
      COUNT(*) AS REVIEW_COUNT,
      AVG(RATING) AS AVG_RATING,
      AVG(SENTIMENT_SCORE) AS AVG_SENTIMENT
    FROM REVIEWS
    WHERE STORE_ID = ?
      AND CREATED_AT >= DATEADD('day', -${daysBack}, CURRENT_TIMESTAMP())
    GROUP BY DAY
    ORDER BY DAY
  `;

  const rows = await execute(sql, [storeId]);

  return rows.map((row) => ({
    date: row.DAY,  // Snowflake timestamp/date; frontend can format
    reviewCount: Number(row.REVIEW_COUNT || 0),
    avgRating: row.AVG_RATING != null ? Number(row.AVG_RATING) : null,
    avgSentiment: row.AVG_SENTIMENT != null ? Number(row.AVG_SENTIMENT) : null,
  }));
}

/**
 * “Issues” = recent negative / low-rating reviews
 * Used by: GET /stores/:id/issues
 */
async function getStoreIssues(storeId, limit = 20) {
  const sql = `
    SELECT
      ID,
      STORE_ID,
      RATING,
      SOURCE,
      SENTIMENT_SCORE,
      SENTIMENT_LABEL,
      REVIEW_TEXT,
      CREATED_AT
    FROM REVIEWS
    WHERE STORE_ID = ?
      AND (RATING <= 3 OR SENTIMENT_LABEL = 'Negative')
    ORDER BY CREATED_AT DESC
    LIMIT ?
  `;

  const rows = await execute(sql, [storeId, limit]);

  return rows.map((row) => ({
    id: row.ID,
    storeId: row.STORE_ID,
    rating: row.RATING,
    source: row.SOURCE,
    sentimentScore: row.SENTIMENT_SCORE,
    sentimentLabel: row.SENTIMENT_LABEL,
    text: row.REVIEW_TEXT,
    createdAt: row.CREATED_AT,
  }));
}

export const metricsService = {
  getStoreOverview,
  getStoreMetrics,
  getStoreIssues,
};
