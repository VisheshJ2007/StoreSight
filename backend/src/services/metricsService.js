// This file is like the "business logic brain" for StoreSight.
// Routes call these functions to get data for the UI.

import { aiService } from './aiService.js';

export const metricsService = {
  // Overview card on the home screen
  getStoreOverview: async (storeId) => {
    const briefing = await aiService.generateDailyBriefing(storeId);

    return {
      storeId,
      storeName: 'Demo Store – Alpharetta',
      rating: 4.3,
      sentimentScore: 0.78,
      reviewCountToday: 5,
      reviewCount7d: 42,
      trend: 'improving', // could be 'declining' or 'flat'
      topIssue: 'wait_time',
      dailyBriefing: briefing
    };
  },

  // Reviews tab list
  getStoreReviews: async (storeId) => {
    const mockReviews = [
      {
        reviewId: 'r1',
        storeId,
        source: 'GOOGLE',
        rating: 5,
        text: 'Staff was super friendly and my order was perfect!',
        date: '2025-11-25T14:30:00Z',
        sentimentLabel: 'POSITIVE'
      },
      {
        reviewId: 'r2',
        storeId,
        source: 'UBER_EATS',
        rating: 2,
        text: 'Food was good but it took 50 minutes to arrive.',
        date: '2025-11-24T18:10:00Z',
        sentimentLabel: 'NEGATIVE'
      }
    ];

    const enriched = await Promise.all(
      mockReviews.map(async (r) => ({
        ...r,
        summary: await aiService.summarizeReview(r.text),
        suggestedResponse: await aiService.suggestResponse(r.text)
      }))
    );

    return enriched;
  },

  // Issues list tab
  getStoreIssues: async (storeId) => {
    return [
      {
        issueKey: 'wait_time',
        displayName: 'Wait Time',
        severity: 'HIGH',
        mentionsCount7d: 12,
        trend: 'increasing'
      },
      {
        issueKey: 'staff_friendliness',
        displayName: 'Staff Friendliness',
        severity: 'LOW',
        mentionsCount7d: 3,
        trend: 'stable'
      }
    ];
  },

  // Analytics tab: time-series metrics
  getStoreMetrics: async (storeId, range = '30d') => {
    const days = 7;
    const today = new Date();

    const data = Array.from({ length: days }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - idx));
      return {
        date: d.toISOString().slice(0, 10),
        avgRating: 4 + Math.random() * 0.3,
        sentimentScore: 0.7 + Math.random() * 0.1,
        reviewCount: Math.floor(3 + Math.random() * 5)
      };
    });

    return { range, data };
  }
};