// backend/src/routes/storeRoutes.js

import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

import { metricsService } from '../services/metricsService.js';
import {
  getReviewsForStore,
  insertReview,
  insertReviewsBulk,
} from '../services/reviewsService.js';

const router = Router();

// Simple disk storage for uploads (uploads/ at project root)
const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
});

// ----------------------
// GET /stores/:id/overview
// ----------------------
router.get('/:id/overview', async (req, res) => {
  try {
    const { id } = req.params;
    const overview = await metricsService.getStoreOverview(id);
    res.json(overview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch store overview' });
  }
});

// ----------------------
// GET /stores/:id/reviews
// Optional query: ?limit=50
// ----------------------
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const reviews = await getReviewsForStore(id, limit);
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// ----------------------
// POST /stores/:id/reviews
// Insert a single review JSON body:
// { rating, source, sentimentScore, sentimentLabel, text, createdAt? }
// ----------------------
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating,
      source,
      sentimentScore,
      sentimentLabel,
      text,
      createdAt,
    } = req.body;

    await insertReview({
      storeId: parseInt(id, 10),
      rating: rating != null ? Number(rating) : null,
      source: source || 'Unknown',
      sentimentScore:
        sentimentScore != null ? Number(sentimentScore) : null,
      sentimentLabel: sentimentLabel || null,
      text: text || '',
      createdAt: createdAt || null,
    });

    res.status(201).json({ message: 'Review inserted' });
  } catch (err) {
    console.error('Error inserting review:', err);
    res.status(500).json({ error: 'Failed to insert review' });
  }
});

// ----------------------
// POST /stores/:id/reviews/upload-csv
// form-data: key = "file", type = File
// CSV headers supported (any of these):
// - rating / RATING
// - source / SOURCE
// - sentimentScore / sentiment_score / SENTIMENT_SCORE
// - sentimentLabel / sentiment_label / SENTIMENT_LABEL
// - text / reviewText / REVIEW_TEXT
// - createdAt / CREATED_AT
// ----------------------
router.post(
  '/:id/reviews/upload-csv',
  upload.single('file'),
  async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'CSV file is required (field "file")' });
    }

    const filePath = req.file.path;
    const storeId = parseInt(id, 10);
    const reviews = [];

    try {
      // Read CSV into memory
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Flexible header support
            const ratingRaw = row.rating ?? row.RATING;
            const source =
              row.source ?? row.SOURCE ?? 'Unknown';

            const sentimentScoreRaw =
              row.sentimentScore ??
              row.sentiment_score ??
              row.SENTIMENT_SCORE;

            const sentimentLabel =
              row.sentimentLabel ??
              row.sentiment_label ??
              row.SENTIMENT_LABEL ??
              null;

            // Support both "text" and "reviewText"
            const text =
              row.text ??
              row.reviewText ??
              row.REVIEW_TEXT ??
              '';

            const createdAtRaw =
              row.createdAt ??
              row.CREATED_AT ??
              null;

            const rating =
              ratingRaw !== undefined && ratingRaw !== ''
                ? Number(ratingRaw)
                : null;

            const sentimentScore =
              sentimentScoreRaw !== undefined &&
              sentimentScoreRaw !== ''
                ? Number(sentimentScoreRaw)
                : null;

            reviews.push({
              storeId,
              rating,
              source,
              sentimentScore,
              sentimentLabel,
              text,
              createdAt: createdAtRaw,
            });
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      // Bulk insert (can be implemented as Promise.all(insertReview(...)))
      await insertReviewsBulk(reviews);

      // Clean up temp file
      fs.unlink(filePath, () => {});

      res.status(201).json({
        message: 'CSV imported',
        rowsInserted: reviews.length,
      });
    } catch (err) {
      console.error('Error importing CSV:', err);
      fs.unlink(filePath, () => {});
      res.status(500).json({ error: 'Failed to import CSV' });
    }
  }
);

// ----------------------
// GET /stores/:id/issues
// ----------------------
router.get('/:id/issues', async (req, res) => {
  try {
    const { id } = req.params;
    const issues = await metricsService.getStoreIssues(id);
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// ----------------------
// GET /stores/:id/metrics?range=7d
// ----------------------
router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const { range } = req.query;
    const metrics = await metricsService.getStoreMetrics(id, range);
    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
