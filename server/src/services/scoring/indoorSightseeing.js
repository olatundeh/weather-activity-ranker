import { scoreToRating } from './index.js';

/**
 * Indoor Sightseeing scoring strategy.
 *
 * This is intentionally the inverse of outdoor sightseeing —
 * bad outdoor weather makes indoor activities more desirable.
 *
 * Positive signals: rain, poor visibility, extreme temps, storms
 * Negative signals: clear skies, mild temps (you should be outside!)
 *
 * Scoring breakdown (0-100):
 * - Weather/sky conditions (0-35): Rain/storms boost indoor appeal
 * - Temperature extremes (0-25): Too hot or cold = stay inside
 * - Precipitation component (0-20): More rain = more reason to be indoors
 * - Visibility component (0-20): Poor visibility = nothing to see outside
 */
export function scoreIndoorSightseeing(weather) {
  let score = 0;
  const reasons = [];

  // Weather/sky conditions (0-35) — inverse of outdoor
  const code = weather.weatherCode;
  if ([95, 96, 99].includes(code)) {
    score += 35;
    reasons.push('Thunderstorms — perfect day for museums and galleries');
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    score += 30;
    reasons.push('Rainy day — ideal for indoor exploration');
  } else if ([66, 67].includes(code)) {
    score += 32;
    reasons.push('Freezing rain — stay indoors and enjoy cultural venues');
  } else if ([45, 48].includes(code)) {
    score += 25;
    reasons.push('Foggy — nothing to see outside, explore indoors');
  } else if ([51, 53, 55].includes(code)) {
    score += 22;
    reasons.push('Drizzly — good excuse to visit indoor attractions');
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    score += 20;
    reasons.push('Snowy — warm up inside with indoor activities');
  } else if (code === 3) {
    score += 15;
    reasons.push('Overcast — indoor activities are appealing');
  } else if (code === 2) {
    score += 10;
    reasons.push('Partly cloudy — outdoor may be better');
  } else if (code === 1) {
    score += 5;
    reasons.push('Mainly clear — consider going outside instead');
  } else if (code === 0) {
    score += 3;
    reasons.push('Clear sky — you might prefer being outdoors');
  } else {
    score += 15;
  }

  // Temperature extremes (0-25) — extreme temps drive people indoors
  const temp = weather.temperatureMean;
  if (temp < -5 || temp > 35) {
    score += 25;
    reasons.push('Extreme temperatures — indoor activities strongly recommended');
  } else if (temp < 0 || temp > 32) {
    score += 20;
    reasons.push('Uncomfortable outdoor temperatures');
  } else if (temp < 5 || temp > 30) {
    score += 15;
    reasons.push(temp < 5 ? 'Cold outside — indoor warmth is appealing' : 'Hot outside — enjoy air-conditioned venues');
  } else if (temp >= 15 && temp <= 25) {
    score += 5;
    reasons.push('Mild temperatures — outdoor activities may be preferable');
  } else {
    score += 10;
  }

  // Precipitation component (0-20)
  const precip = weather.precipitationSum;
  if (precip >= 10) {
    score += 20;
    reasons.push(`Heavy precipitation (${precip}mm) — stay dry indoors`);
  } else if (precip >= 5) {
    score += 15;
    reasons.push(`Moderate precipitation (${precip}mm)`);
  } else if (precip >= 2) {
    score += 10;
    reasons.push('Light precipitation');
  } else if (precip > 0) {
    score += 5;
    reasons.push('Trace precipitation');
  } else {
    score += 2;
    reasons.push('Dry conditions — outdoors may be more appealing');
  }

  // Visibility component (0-20) — poor visibility favors indoor
  const visibility = weather.visibilityMean;
  if (visibility < 1000) {
    score += 20;
    reasons.push('Very poor visibility — nothing to see outside');
  } else if (visibility < 5000) {
    score += 15;
    reasons.push('Low visibility — indoor attractions offer more');
  } else if (visibility < 10000) {
    score += 10;
    reasons.push('Moderate visibility');
  } else if (visibility < 20000) {
    score += 5;
    reasons.push('Good visibility — outdoor sightseeing is an option');
  } else {
    score += 2;
    reasons.push('Excellent visibility — outdoor views are stunning');
  }

  const rating = scoreToRating(score);
  return { score, rating, reasoning: reasons.join('. ') };
}
