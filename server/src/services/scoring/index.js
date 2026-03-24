import { scoreSkiing } from './skiing.js';
import { scoreSurfing } from './surfing.js';
import { scoreOutdoorSightseeing } from './outdoorSightseeing.js';
import { scoreIndoorSightseeing } from './indoorSightseeing.js';

/**
 * Registry of activity scoring strategies.
 * Each strategy implements: (dailyWeather) => { score: 0-100, rating: string, reasoning: string }
 *
 * To add a new activity:
 * 1. Create a new scoring module in this directory
 * 2. Add it to this registry
 * No other changes needed — the GraphQL schema auto-includes all registered activities.
 */
const ACTIVITY_STRATEGIES = [
  { name: 'Skiing', score: scoreSkiing },
  { name: 'Surfing', score: scoreSurfing },
  { name: 'Outdoor Sightseeing', score: scoreOutdoorSightseeing },
  { name: 'Indoor Sightseeing', score: scoreIndoorSightseeing },
];

/**
 * Score all registered activities for a given day's weather.
 * Returns an array sorted by score descending (best activity first).
 */
export function scoreAllActivities(dailyWeather) {
  const results = ACTIVITY_STRATEGIES.map((strategy) => {
    const result = strategy.score(dailyWeather);
    return {
      activity: strategy.name,
      score: clamp(Math.round(result.score), 0, 100),
      rating: result.rating,
      reasoning: result.reasoning,
    };
  });

  // Sort by score descending so best activities appear first
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Convert a numeric score (0-100) to a human-readable rating.
 */
export function scoreToRating(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Not Recommended';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
