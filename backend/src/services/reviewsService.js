// backend/src/services/reviewsService.js
import { execute } from './snowflakeClient.js';

// ---------- Helper: derive sentiment from rating ----------
function deriveSentimentFromRating(rating) {
  if (rating == null) {
    return { score: null, label: null };
  }

  const r = Number(rating);

  if (r >= 4.5) {
    return { score: 0.9, label: 'Positive' };
  } else if (r >= 4.0) {
    return { score: 0.5, label: 'Positive' };
  } else if (r <= 2.5) {
    return { score: -0.6, label: 'Negative' };
  } else {
    return { score: 0.0, label: 'Neutral' };
  }
}

// ---------- Get reviews for a store ----------
export async function getReviewsForStore(storeId, limit = 50) {
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

// ---------- Insert single review ----------
export async function insertReview({
  storeId,
  rating,
  source,
  sentimentScore,
  sentimentLabel,
  text,
  createdAt,
}) {
  // Make sure we never pass undefined into Snowflake binds
  const safeStoreId = storeId != null ? Number(storeId) : null;
  const safeRating =
    rating != null && rating !== '' ? Number(rating) : null;
  const safeSource = source || 'Unknown';
  const safeText = text || '';

  let score = sentimentScore != null ? Number(sentimentScore) : null;
  let label = sentimentLabel ?? null;

  // If no sentiment provided, derive it from rating
  if (score == null && label == null && safeRating != null) {
    const derived = deriveSentimentFromRating(safeRating);
    score = derived.score;
    label = derived.label;
  }

  const sql = `
    INSERT INTO REVIEWS (
      STORE_ID,
      RATING,
      SOURCE,
      SENTIMENT_SCORE,
      SENTIMENT_LABEL,
      REVIEW_TEXT,
      CREATED_AT
    )
    VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP()))
  `;

  const binds = [
    safeStoreId,
    safeRating,
    safeSource,
    score,
    label,
    safeText,
    createdAt ?? null,
  ];

  await execute(sql, binds);
}

// ---------- Bulk insert (used by CSV upload) ----------
export async function insertReviewsBulk(reviews) {
  // simplest: just insert sequentially; fine for small CSVs
  for (const review of reviews) {
    await insertReview(review);
  }
}
