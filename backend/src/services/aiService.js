// Central place for all AI-related behavior.
// Later: call OpenAI or Azure OpenAI here.

export const aiService = {
  generateDailyBriefing: async (storeId) => {
    return [
      `Store ${storeId}: Overall sentiment is stable compared to yesterday.`,
      'Top positive theme: friendly staff.',
      'Top negative theme: long wait times during lunch.',
      'Recommendation: add one extra cashier from 12–2 PM.'
    ];
  },

  summarizeReview: async (reviewText) => {
    return `Summary: Guest mentioned "${reviewText.slice(0, 60)}..."`;
  },

  suggestResponse: async (reviewText) => {
    return 'Thank you for your feedback! We’re sorry for your experience and are working with our team to improve.';
  }
};