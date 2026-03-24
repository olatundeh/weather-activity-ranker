const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search for locations by city/town name using Open-Meteo Geocoding API.
 * Returns up to 10 matching locations with coordinates and metadata.
 */
export async function searchLocations(name) {
  if (!name || name.trim().length < 2) {
    return [];
  }

  const url = `${GEOCODING_API}?name=${encodeURIComponent(name.trim())}&count=10&language=en&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((result) => ({
      name: result.name,
      country: result.country || null,
      admin1: result.admin1 || null,
      latitude: result.latitude,
      longitude: result.longitude,
      elevation: result.elevation || null,
      timezone: result.timezone || null,
    }));
  } catch (error) {
    console.error('Geocoding search failed:', error.message);
    throw new Error(`Failed to search locations: ${error.message}`);
  }
}
