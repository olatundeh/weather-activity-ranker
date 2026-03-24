const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * Weather variables we need for activity scoring.
 * Using hourly data for finer-grained aggregation.
 */
const HOURLY_VARIABLES = [
  'temperature_2m',
  'precipitation',
  'snowfall',
  'cloud_cover',
  'wind_speed_10m',
  'weather_code',
  'visibility',
  'snow_depth',
].join(',');

const DAILY_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'snowfall_sum',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
].join(',');

/**
 * WMO Weather interpretation codes → human-readable descriptions
 */
const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

/**
 * Fetch 7-day hourly weather data from Open-Meteo and aggregate into daily summaries.
 * Returns an array of daily weather objects suitable for activity scoring.
 */
export async function fetchWeatherData(latitude, longitude) {
  const url = `${FORECAST_API}?latitude=${latitude}&longitude=${longitude}&hourly=${HOURLY_VARIABLES}&daily=${DAILY_VARIABLES}&timezone=auto&forecast_days=7`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.reason || `Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return aggregateHourlyToDaily(data);
  } catch (error) {
    console.error('Weather fetch failed:', error.message);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/**
 * Aggregate hourly weather data into daily summaries.
 * Groups 24-hour blocks and computes averages, sums, and extremes.
 */
function aggregateHourlyToDaily(data) {
  const { hourly, daily } = data;

  if (!hourly || !hourly.time) {
    throw new Error('Invalid weather data: missing hourly time series');
  }

  // Group hourly data by date
  const dayMap = new Map();

  hourly.time.forEach((timestamp, i) => {
    const date = timestamp.split('T')[0];

    if (!dayMap.has(date)) {
      dayMap.set(date, {
        temperatures: [],
        precipitation: [],
        snowfall: [],
        cloudCover: [],
        windSpeed: [],
        weatherCodes: [],
        visibility: [],
        snowDepth: [],
      });
    }

    const day = dayMap.get(date);
    day.temperatures.push(hourly.temperature_2m[i] ?? 0);
    day.precipitation.push(hourly.precipitation[i] ?? 0);
    day.snowfall.push(hourly.snowfall[i] ?? 0);
    day.cloudCover.push(hourly.cloud_cover[i] ?? 0);
    day.windSpeed.push(hourly.wind_speed_10m[i] ?? 0);
    day.weatherCodes.push(hourly.weather_code[i] ?? 0);
    day.visibility.push(hourly.visibility[i] ?? 10000);
    day.snowDepth.push(hourly.snow_depth[i] ?? 0);
  });

  // Convert grouped data into daily summaries
  const dailySummaries = [];
  let dayIndex = 0;

  for (const [date, hours] of dayMap) {
    const weatherCode = daily?.weather_code?.[dayIndex] ?? mostFrequent(hours.weatherCodes);

    dailySummaries.push({
      date,
      temperatureMax: daily?.temperature_2m_max?.[dayIndex] ?? Math.max(...hours.temperatures),
      temperatureMin: daily?.temperature_2m_min?.[dayIndex] ?? Math.min(...hours.temperatures),
      temperatureMean: round(average(hours.temperatures)),
      precipitationSum: round(daily?.precipitation_sum?.[dayIndex] ?? sum(hours.precipitation)),
      snowfallSum: round(daily?.snowfall_sum?.[dayIndex] ?? sum(hours.snowfall)),
      cloudCoverMean: round(average(hours.cloudCover)),
      windSpeedMax: round(daily?.wind_speed_10m_max?.[dayIndex] ?? Math.max(...hours.windSpeed)),
      windSpeedMean: round(average(hours.windSpeed)),
      visibilityMean: round(average(hours.visibility)),
      weatherCode,
      weatherDescription: WEATHER_CODES[weatherCode] || 'Unknown',
      // Extra fields for scoring (not in GraphQL schema but used internally)
      snowDepthMean: round(average(hours.snowDepth)),
    });

    dayIndex++;
  }

  return dailySummaries;
}

function average(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function mostFrequent(arr) {
  const freq = {};
  let maxCount = 0;
  let maxVal = 0;
  for (const val of arr) {
    freq[val] = (freq[val] || 0) + 1;
    if (freq[val] > maxCount) {
      maxCount = freq[val];
      maxVal = val;
    }
  }
  return maxVal;
}
