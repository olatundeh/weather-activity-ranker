# Weather Activity Ranker

A full-stack web application that accepts a city or town and returns a ranking of how desirable it will be to visit for various activities over the next 7 days, based on real-time weather data from [Open-Meteo](https://open-meteo.com/).

## Activities Ranked

- **Skiing** — Favors cold temps, snowfall, existing snow depth
- **Surfing** — Favors moderate wind for swell, mild temps, no storms
- **Outdoor Sightseeing** — Favors clear skies, mild temps, good visibility
- **Indoor Sightseeing** — Inversely correlated with outdoor conditions (bad weather = good for museums)

## Architecture Overview

```
weather-activity-ranker/
├── server/                         # Node.js + GraphQL backend
│   └── src/
│       ├── index.js                # Express + Apollo Server entry
│       ├── schema/
│       │   ├── typeDefs.js         # GraphQL type definitions
│       │   └── resolvers.js        # Query resolvers (orchestration only)
│       └── services/
│           ├── geocode.js          # Open-Meteo Geocoding API client
│           ├── weather.js          # Open-Meteo Forecast API + daily aggregation
│           └── scoring/
│               ├── index.js        # Strategy registry + orchestrator
│               ├── skiing.js       # Skiing scoring strategy
│               ├── surfing.js      # Surfing scoring strategy
│               ├── outdoorSightseeing.js
│               └── indoorSightseeing.js
├── client/                         # React + Vite frontend
│   └── src/
│       ├── main.jsx                # Entry point + Apollo Provider
│       ├── App.jsx                 # Root component
│       ├── graphql/
│       │   ├── client.js           # Apollo Client setup
│       │   └── queries.js          # GraphQL query definitions
│       ├── hooks/
│       │   └── useLocationSearch.js  # Debounced city search hook
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── CitySearch.jsx      # Autocomplete city search
│       │   ├── ActivityRankings.jsx # Rankings container
│       │   ├── DayCard.jsx         # Expandable day with scores
│       │   ├── ScoreBar.jsx        # Visual score bar
│       │   ├── ErrorMessage.jsx
│       │   └── LoadingSpinner.jsx
│       └── utils/
│           ├── formatDate.js       # Date formatting helpers
│           └── weatherIcons.js     # WMO code → icon/color mapping
└── README.md
```

### Key Architectural Decisions

1. **Strategy Pattern for Scoring** — Each activity is an independent module that implements `(dailyWeather) => { score, rating, reasoning }`. Adding a new activity requires creating one file and registering it in `scoring/index.js`. Zero changes to existing code.

2. **Service Layer Separation** — Three distinct services (geocoding, weather, scoring) with no cross-dependencies. The GraphQL resolver orchestrates them but contains no business logic.

3. **Hourly → Daily Aggregation** — Raw hourly data from Open-Meteo is aggregated server-side into daily summaries (averages, sums, extremes) before scoring. This keeps scoring logic simple and testable.

4. **GraphQL over REST** — Provides a typed, self-documenting API. Clients request exactly the fields they need. Easy to extend with new queries without versioning.

5. **Debounced Geocoding** — The city search input debounces at 300ms to avoid excessive API calls while maintaining responsive UX.

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend Runtime | Node.js (ES Modules) | Matches team stack requirement |
| API Layer | Apollo Server 4 + Express | Industry-standard GraphQL server |
| Frontend Framework | React 18 + Vite | Fast dev experience, modern tooling |
| GraphQL Client | Apollo Client 3 | Caching, loading states, type safety |
| Styling | TailwindCSS 3 | Utility-first, minimal CSS overhead |
| Icons | Lucide React | Lightweight, tree-shakeable icon library |
| Weather Data | Open-Meteo API | Free, no API key, comprehensive data |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation & Running

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install

# 3. Start the backend (from server/)
cd ../server
npm run dev
# Server runs at http://localhost:4000/graphql

# 4. Start the frontend (from client/)
cd ../client
npm run dev
# Client runs at http://localhost:5173
```

### Usage

1. Open http://localhost:5173
2. Type a city or town name in the search box
3. Select a location from the dropdown
4. View 7-day activity rankings — click any day to expand details

## Scoring Methodology

Each activity is scored 0–100 based on weighted weather components:

### Skiing (max 100)
| Component | Weight | Best Conditions |
|-----------|--------|----------------|
| Temperature | 30 | -5°C to 0°C |
| Snowfall | 30 | 20+ cm fresh snow |
| Snow Depth | 20 | 1+ meter base |
| Weather Code | 20 | Snowing or clear |

### Surfing (max 100)
| Component | Weight | Best Conditions |
|-----------|--------|----------------|
| Wind Speed | 35 | 15–30 km/h |
| Temperature | 25 | 15–25°C |
| Storm Safety | 20 | No thunderstorms |
| Sky Conditions | 15 | Clear skies |

### Outdoor Sightseeing (max 100)
| Component | Weight | Best Conditions |
|-----------|--------|----------------|
| Sky/Weather | 30 | Clear sky |
| Temperature | 25 | 15–25°C |
| Visibility | 20 | 20+ km |
| Precipitation | 15 | None |
| Wind | 10 | Light breeze |

### Indoor Sightseeing (max 100)
Inverse of outdoor — bad outdoor weather increases indoor desirability.
| Component | Weight | Best Conditions |
|-----------|--------|----------------|
| Weather | 35 | Rain/storms |
| Temperature | 25 | Extreme hot/cold |
| Precipitation | 20 | Heavy rain |
| Visibility | 20 | Poor (<1 km) |

## How AI Assisted in Development

This project was built with Cascade (Windsurf AI). Here's how AI was used and how judgment was applied:

### AI Contributions
- **Architecture design**: AI proposed the strategy pattern for scoring and the service layer separation. I validated these were appropriate abstractions for the requirements.
- **Scoring algorithms**: AI generated initial scoring weights and thresholds. I reviewed them for reasonableness (e.g., skiing should penalize rain, surfing needs wind for waves).
- **Boilerplate generation**: Apollo Server setup, Vite configuration, TailwindCSS config — standard setup code accelerated by AI.
- **WMO weather code mapping**: AI generated the complete code-to-description and code-to-icon mappings from the API documentation.

### Human Judgment Applied
- **Scoring calibration**: The scoring weights are reasonable defaults but would benefit from real-world validation and tuning.
- **Architecture validation**: Confirmed the strategy pattern is extensible without over-engineering for 4 activities.
- **Error handling**: Ensured proper error propagation from Open-Meteo through GraphQL to the UI.
