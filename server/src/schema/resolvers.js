import { searchLocations } from '../services/geocode.js';
import { fetchWeatherData } from '../services/weather.js';
import { scoreAllActivities } from '../services/scoring/index.js';

export const resolvers = {
  Query: {
    searchLocations: async (_, { name }) => {
      return searchLocations(name);
    },

    getActivityRankings: async (_, { latitude, longitude, name, country }) => {
      const dailyWeather = await fetchWeatherData(latitude, longitude);

      const days = dailyWeather.map((day) => ({
        date: day.date,
        weather: day,
        scores: scoreAllActivities(day),
      }));

      return {
        location: {
          name: name || 'Unknown',
          country: country || null,
          admin1: null,
          latitude,
          longitude,
          elevation: null,
          timezone: null,
        },
        days,
      };
    },
  },
};
