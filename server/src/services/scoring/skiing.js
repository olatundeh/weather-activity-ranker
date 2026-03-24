import { scoreToRating } from './index.js';

/**
 * Skiing scoring strategy.
 *
 * Positive signals: snowfall, cold temperatures, existing snow depth
 * Negative signals: rain, warm temperatures, no snow at all
 *
 * Scoring breakdown (0-100):
 * - Temperature component (0-30): Best below -2°C, penalized above 5°C
 * - Snowfall component (0-30): More fresh snow = better
 * - Snow depth component (0-20): Existing base is important
 * - Weather conditions (0-20): Penalize rain, reward snow/clear
 */
export function scoreSkiing(weather) {
  let score = 0;
  const reasons = [];

  // Temperature component (0-30)
  // Ideal: -5°C to 0°C. Bad: above 5°C
  const temp = weather.temperatureMean;
  if (temp <= -5) {
    score += 25; // Very cold — good but can be harsh
    reasons.push('Very cold temperatures ideal for snow preservation');
  } else if (temp <= 0) {
    score += 30; // Perfect skiing temperature
    reasons.push('Perfect skiing temperatures');
  } else if (temp <= 3) {
    score += 20;
    reasons.push('Cool temperatures, snow may soften');
  } else if (temp <= 5) {
    score += 10;
    reasons.push('Warm — snow may be slushy');
  } else {
    score += 0;
    reasons.push('Too warm for good skiing conditions');
  }

  // Snowfall component (0-30)
  const snowfall = weather.snowfallSum;
  if (snowfall >= 20) {
    score += 30;
    reasons.push(`Heavy fresh snowfall (${snowfall}cm) — powder day!`);
  } else if (snowfall >= 10) {
    score += 25;
    reasons.push(`Good snowfall (${snowfall}cm)`);
  } else if (snowfall >= 5) {
    score += 20;
    reasons.push(`Moderate snowfall (${snowfall}cm)`);
  } else if (snowfall > 0) {
    score += 15;
    reasons.push(`Light snowfall (${snowfall}cm)`);
  } else {
    score += 0;
    reasons.push('No fresh snowfall expected');
  }

  // Snow depth component (0-20)
  const snowDepth = weather.snowDepthMean || 0;
  if (snowDepth >= 1.0) {
    score += 20;
    reasons.push('Excellent snow base');
  } else if (snowDepth >= 0.5) {
    score += 15;
    reasons.push('Good snow base');
  } else if (snowDepth >= 0.1) {
    score += 10;
    reasons.push('Thin snow base');
  } else if (snowfall > 0) {
    score += 5;
    reasons.push('No existing snow base but fresh snow expected');
  }

  // Weather conditions component (0-20)
  const code = weather.weatherCode;
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    score += 20; // Snowing
    reasons.push('Snowy conditions');
  } else if ([0, 1, 2].includes(code)) {
    score += 18; // Clear/partly cloudy — great visibility on slopes
    reasons.push('Clear skies for great visibility');
  } else if (code === 3) {
    score += 12; // Overcast but dry
    reasons.push('Overcast but dry conditions');
  } else if ([45, 48].includes(code)) {
    score += 5; // Fog — poor visibility
    reasons.push('Foggy — limited visibility on slopes');
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    score += 0; // Rain — terrible for skiing
    reasons.push('Rain will degrade snow conditions');
  } else {
    score += 8;
  }

  const rating = scoreToRating(score);
  return { score, rating, reasoning: reasons.join('. ') };
}
