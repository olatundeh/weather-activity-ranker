import { scoreToRating } from './index.js';

/**
 * Outdoor Sightseeing scoring strategy.
 *
 * Positive signals: clear skies, mild temps (15-25°C), low precipitation, good visibility
 * Negative signals: rain, extreme temps, poor visibility, high winds
 *
 * Scoring breakdown (0-100):
 * - Weather/sky conditions (0-30): Clear > partly cloudy > overcast > rain
 * - Temperature component (0-25): Mild temps ideal for walking around
 * - Visibility component (0-20): Need to see landmarks and scenery
 * - Precipitation component (0-15): Dry is essential
 * - Wind component (0-10): Light breeze ideal, strong wind unpleasant
 */
export function scoreOutdoorSightseeing(weather) {
  let score = 0;
  const reasons = [];

  // Weather/sky conditions (0-30)
  const code = weather.weatherCode;
  if (code === 0) {
    score += 30;
    reasons.push('Clear sky — perfect for sightseeing');
  } else if (code === 1) {
    score += 28;
    reasons.push('Mainly clear skies');
  } else if (code === 2) {
    score += 22;
    reasons.push('Partly cloudy — still pleasant');
  } else if (code === 3) {
    score += 15;
    reasons.push('Overcast but dry');
  } else if ([45, 48].includes(code)) {
    score += 8;
    reasons.push('Foggy — atmospheric but limited views');
  } else if ([51, 53, 55].includes(code)) {
    score += 10;
    reasons.push('Drizzle — bring an umbrella');
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    score += 3;
    reasons.push('Rain — not ideal for outdoor exploration');
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    score += 8;
    reasons.push('Snow — scenic but cold and slippery');
  } else if ([95, 96, 99].includes(code)) {
    score += 0;
    reasons.push('Thunderstorms — stay indoors');
  } else {
    score += 12;
  }

  // Temperature component (0-25)
  const temp = weather.temperatureMean;
  if (temp >= 15 && temp <= 25) {
    score += 25;
    reasons.push('Ideal temperature for walking and exploring');
  } else if (temp >= 10 && temp <= 30) {
    score += 20;
    reasons.push('Comfortable temperature for outdoor activities');
  } else if (temp >= 5 && temp <= 35) {
    score += 12;
    reasons.push(temp < 15 ? 'Cool — dress warmly' : 'Warm — stay hydrated');
  } else if (temp >= 0) {
    score += 6;
    reasons.push('Cold conditions for extended outdoor time');
  } else {
    score += 2;
    reasons.push('Very cold — limit outdoor exposure');
  }

  // Visibility component (0-20)
  const visibility = weather.visibilityMean;
  if (visibility >= 20000) {
    score += 20;
    reasons.push('Excellent visibility for panoramic views');
  } else if (visibility >= 10000) {
    score += 16;
    reasons.push('Good visibility');
  } else if (visibility >= 5000) {
    score += 10;
    reasons.push('Moderate visibility');
  } else if (visibility >= 1000) {
    score += 5;
    reasons.push('Poor visibility — limited distant views');
  } else {
    score += 1;
    reasons.push('Very poor visibility');
  }

  // Precipitation component (0-15)
  const precip = weather.precipitationSum;
  if (precip === 0) {
    score += 15;
    reasons.push('No precipitation expected');
  } else if (precip < 2) {
    score += 10;
    reasons.push('Minimal precipitation');
  } else if (precip < 5) {
    score += 5;
    reasons.push(`Moderate precipitation (${precip}mm)`);
  } else {
    score += 0;
    reasons.push(`Heavy precipitation (${precip}mm)`);
  }

  // Wind component (0-10)
  const wind = weather.windSpeedMean;
  if (wind <= 15) {
    score += 10;
    reasons.push('Light breeze — pleasant');
  } else if (wind <= 25) {
    score += 7;
    reasons.push('Breezy');
  } else if (wind <= 40) {
    score += 3;
    reasons.push('Windy — may be uncomfortable');
  } else {
    score += 0;
    reasons.push('Very windy — unpleasant for walking');
  }

  const rating = scoreToRating(score);
  return { score, rating, reasoning: reasons.join('. ') };
}
