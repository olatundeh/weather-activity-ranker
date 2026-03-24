import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_ACTIVITY_RANKINGS } from './graphql/queries.js';
import CitySearch from './components/CitySearch.jsx';
import ActivityRankings from './components/ActivityRankings.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import Header from './components/Header.jsx';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [fetchRankings, { data, loading, error }] = useLazyQuery(GET_ACTIVITY_RANKINGS);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    fetchRankings({
      variables: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        country: location.country,
      },
    });
  };

  const rankings = data?.getActivityRankings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-10">
          <CitySearch onSelect={handleLocationSelect} />
        </div>

        {loading && <LoadingSpinner />}

        {error && <ErrorMessage message={error.message} />}

        {rankings && !loading && (
          <ActivityRankings rankings={rankings} />
        )}

        {!rankings && !loading && !error && (
          <div className="text-center py-20">
            <p className="text-lg text-slate-400">
              Search for a city to see 7-day activity rankings based on weather forecasts.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
