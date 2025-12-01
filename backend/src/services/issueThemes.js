// backend/src/services/issueThemes.js
// Simple keyword-based theme tagging for negative reviews.

const THEME_KEYWORDS = {
  service: [
    'service',
    'staff',
    'waiter',
    'waitress',
    'server',
    'rude',
    'attitude',
    'host',
  ],
  speed: ['slow', 'delay', 'waited', 'waiting', 'long wait'],
  food: [
    'food',
    'meal',
    'dish',
    'cold',
    'bland',
    'salty',
    'undercooked',
    'overcooked',
    'portion',
  ],
  cleanliness: ['dirty', 'cleanliness', 'sticky', 'smell', 'gross'],
  price: ['price', 'expensive', 'overpriced', 'cheap'],
  ambiance: ['loud', 'noise', 'music', 'crowded', 'atmosphere'],
};

export function tagThemesForReviewText(text) {
  if (!text) return [];

  const lower = text.toLowerCase();
  const themes = new Set();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        themes.add(theme);
        break;
      }
    }
  }

  return Array.from(themes);
}
