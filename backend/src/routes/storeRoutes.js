import { Router } from 'express';
import { metricsService } from '../services/metricsService.js';

const router = Router();

// GET /stores/:id/overview
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

// GET /stores/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await metricsService.getStoreReviews(id);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /stores/:id/issues
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

// GET /stores/:id/metrics
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