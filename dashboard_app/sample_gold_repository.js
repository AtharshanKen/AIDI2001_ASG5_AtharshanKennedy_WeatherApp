const SAMPLE_PAYLOADS = {
  toronto: {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-08",
        avg_temp: 20.0,
        weather_condition: "Mainly Clear",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
      {
        date: "2026-04-09",
        avg_temp: 15.5,
        weather_condition: "Partly Cloudy",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Partly cloudy with comfortable temperatures, low wind, and little rain.",
      },
    ],
  },
  ottawa: {
    metadata: {
      city: "ottawa",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-10",
        avg_temp: 12.5,
        weather_condition: "Rain",
        outing_score: 1,
        outing_label: "Not Good",
        outing_reason:
          "Rain with 6.0 mm precipitation, 38.0 km/h wind, and a cool 12.5 C average temperature.",
      },
      {
        date: "2026-04-11",
        avg_temp: 14.0,
        weather_condition: "Overcast",
        outing_score: 2,
        outing_label: "Okay Day",
        outing_reason: "Overcast with manageable wind and precipitation.",
      },
    ],
  },
  vancouver: {
    metadata: {
      city: "vancouver",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-12",
        avg_temp: 17.0,
        weather_condition: "Partly Cloudy",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Partly cloudy with comfortable temperatures, low wind, and little rain.",
      },
      {
        date: "2026-04-13",
        avg_temp: 15.0,
        weather_condition: "Mainly Clear",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
    ],
  },
  montreal: {
    metadata: {
      city: "montreal",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-14",
        avg_temp: 9.5,
        weather_condition: "Light Rain",
        outing_score: 1,
        outing_label: "Not Good",
        outing_reason:
          "Light Rain with 7.5 mm precipitation, 24.0 km/h wind, and a cool 9.5 C average temperature.",
      },
      {
        date: "2026-04-15",
        avg_temp: 13.0,
        weather_condition: "Partly Cloudy",
        outing_score: 2,
        outing_label: "Okay Day",
        outing_reason: "Partly Cloudy with manageable wind and precipitation.",
      },
    ],
  },
  calgary: {
    metadata: {
      city: "calgary",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-16",
        avg_temp: 18.5,
        weather_condition: "Clear Sky",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Clear sky with comfortable temperatures, low wind, and little rain.",
      },
      {
        date: "2026-04-17",
        avg_temp: 11.5,
        weather_condition: "Windy Plains",
        outing_score: 2,
        outing_label: "Okay Day",
        outing_reason: "Windy Plains with manageable wind and precipitation.",
      },
    ],
  },
};

function createSampleGoldRepository() {
  return {
    async readCityForecast(cityKey) {
      const payload = SAMPLE_PAYLOADS[cityKey];

      if (!payload) {
        return {
          metadata: {
            city: cityKey,
            run_date: "2026-04-07",
          },
          daily_forecasts: [],
        };
      }

      return structuredClone(payload);
    },
  };
}

module.exports = {
  createSampleGoldRepository,
};
