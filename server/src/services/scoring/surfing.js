import { scoreToRating } from './index.js';

/**
 * Surfing scoring strategy.
 *
 * Positive signals: moderate-strong wind, mild temperatures, no thunderstorms
 * Negative signals: extreme cold, no wind, thunderstorms, freezing conditions
 *
 * Scoring breakdown (0-100):
 * - Wind component (0-35): Moderate wind creates swells; too much is dangerous
 * - Temperature component (0-25): Mild temps (12-25°C) are ideal
 * - Precipitation/storms (0-20): Rain ok, but thunderstorms dangerous
 * - General conditions (0-20): Clear > overcast > fog
 */
export function scoreSurfing(weather) {
  let score = 0;
  const reasons = [];

  // Wind component (0-35)
  // Ideal: 15-30 km/h for wave generation. Too calm = flat. Too high = dangerous.
  const wind = weather.windSpeedMean;
  const gustMax = weather.windSpeedMax;
  if (wind >= 15 && wind <= 30) {
    score += 35;
    reasons.push(`Ideal wind speed (${wind} km/h) for wave generation`);
  } else if (wind >= 10 && wind <= 40) {
    score += 25;
    reasons.push(`Decent wind (${wind} km/h) for surfing`);
  } else if (wind >= 5 && wind <= 50) {
    score += 15;
    reasons.push(wind < 15 ? 'Light winds — waves may be small' : 'Strong winds — challenging conditions');
  } else if (wind < 5) {
    score += 5;
    reasons.push('Very calm — likely flat conditions');
  } else {
    score += 0;
    reasons.push('Dangerously high winds');
  }

  // Bonus for good gusts (indicates swell potential)
  if (gustMax >= 20 && gustMax <= 50) {
    score += 5;
    reasons.push('Good gust activity for swell');
  }

  // Temperature component (0-25)
  // Water surfing is best in mild conditions
  const temp = weather.temperatureMean;
  if (temp >= 15 && temp <= 25) {
    score += 25;
    reasons.push('Comfortable air temperature for surfing');
  } else if (temp >= 10 && temp <= 30) {
    score += 18;
    reasons.push('Manageable temperature with a wetsuit');
  } else if (temp >= 5) {
    score += 10;
    reasons.push('Cold — thick wetsuit required');
  } else {
    score += 2;
    reasons.push('Very cold — extreme conditions for surfing');
  }

  // Precipitation/storms component (0-20)
  const code = weather.weatherCode;
  if ([95, 96, 99].includes(code)) {
    score += 0;
    reasons.push('Thunderstorms — dangerous for water activities');
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    score += 12; // Rain is fine for surfers
    reasons.push('Rainy but safe for surfing');
  } else if (weather.precipitationSum <= 1) {
    score += 20;
    reasons.push('Dry conditions');
  } else {
    score += 15;
    reasons.push('Light precipitation');
  }

  // General conditions (0-15)
  if ([0, 1, 2].includes(code)) {
    score += 15;
    reasons.push('Clear skies — great visibility at sea');
  } else if (code === 3) {
    score += 12;
    reasons.push('Overcast but good visibility');
  } else if ([45, 48].includes(code)) {
    score += 5;
    reasons.push('Foggy — reduced visibility at sea');
  } else {
    score += 8;
  }

  const rating = scoreToRating(score);
  return { score, rating, reasoning: reasons.join('. ') };
}
