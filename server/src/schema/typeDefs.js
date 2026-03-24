export const typeDefs = `#graphql
  """
  A location returned from geocoding search
  """
  type Location {
    name: String!
    country: String
    admin1: String
    latitude: Float!
    longitude: Float!
    elevation: Float
    timezone: String
  }

  """
  Weather summary for a single day
  """
  type DailyWeather {
    date: String!
    temperatureMax: Float!
    temperatureMin: Float!
    temperatureMean: Float!
    precipitationSum: Float!
    snowfallSum: Float!
    cloudCoverMean: Float!
    windSpeedMax: Float!
    windSpeedMean: Float!
    visibilityMean: Float!
    weatherCode: Int!
    weatherDescription: String!
  }

  """
  Score for a specific activity on a specific day (0-100)
  """
  type ActivityScore {
    activity: String!
    score: Int!
    rating: String!
    reasoning: String!
  }

  """
  A single day's ranking: weather + activity scores
  """
  type DayRanking {
    date: String!
    weather: DailyWeather!
    scores: [ActivityScore!]!
  }

  """
  Full result for a location query
  """
  type ActivityRanking {
    location: Location!
    days: [DayRanking!]!
  }

  type Query {
    """
    Search for locations by city/town name
    """
    searchLocations(name: String!): [Location!]!

    """
    Get 7-day activity rankings for a specific location
    """
    getActivityRankings(latitude: Float!, longitude: Float!, name: String, country: String): ActivityRanking!
  }
`;
