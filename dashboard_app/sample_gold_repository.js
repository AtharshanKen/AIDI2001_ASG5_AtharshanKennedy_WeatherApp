const CITY_SAMPLE_CONFIG = {
  toronto: {
    runDate: "2026-04-07",
    startDate: "2026-04-08",
    templates: [
      {
        avgTemp: 20.0,
        weatherCondition: "Mainly Clear",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
      {
        avgTemp: 15.5,
        weatherCondition: "Partly Cloudy",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Partly cloudy with comfortable temperatures, low wind, and little rain.",
      },
      {
        avgTemp: 13.0,
        weatherCondition: "Overcast",
        outingScore: 2,
        outingLabel: "Okay Day",
        outingReason: "Overcast with manageable wind and precipitation.",
      },
    ],
  },
  ottawa: {
    runDate: "2026-04-07",
    startDate: "2026-04-10",
    templates: [
      {
        avgTemp: 12.5,
        weatherCondition: "Rain",
        outingScore: 1,
        outingLabel: "Not Good",
        outingReason:
          "Rain with 6.0 mm precipitation, 38.0 km/h wind, and a cool 12.5 C average temperature.",
      },
      {
        avgTemp: 14.0,
        weatherCondition: "Overcast",
        outingScore: 2,
        outingLabel: "Okay Day",
        outingReason: "Overcast with manageable wind and precipitation.",
      },
      {
        avgTemp: 16.5,
        weatherCondition: "Mainly Clear",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
    ],
  },
  vancouver: {
    runDate: "2026-04-07",
    startDate: "2026-04-12",
    templates: [
      {
        avgTemp: 17.0,
        weatherCondition: "Partly Cloudy",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Partly cloudy with comfortable temperatures, low wind, and little rain.",
      },
      {
        avgTemp: 15.0,
        weatherCondition: "Mainly Clear",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
      {
        avgTemp: 12.5,
        weatherCondition: "Rain Showers",
        outingScore: 2,
        outingLabel: "Okay Day",
        outingReason: "Rain Showers with manageable wind and precipitation.",
      },
    ],
  },
  montreal: {
    runDate: "2026-04-07",
    startDate: "2026-04-14",
    templates: [
      {
        avgTemp: 9.5,
        weatherCondition: "Light Rain",
        outingScore: 1,
        outingLabel: "Not Good",
        outingReason:
          "Light Rain with 7.5 mm precipitation, 24.0 km/h wind, and a cool 9.5 C average temperature.",
      },
      {
        avgTemp: 13.0,
        weatherCondition: "Partly Cloudy",
        outingScore: 2,
        outingLabel: "Okay Day",
        outingReason: "Partly Cloudy with manageable wind and precipitation.",
      },
      {
        avgTemp: 16.0,
        weatherCondition: "Mainly Clear",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
    ],
  },
  calgary: {
    runDate: "2026-04-07",
    startDate: "2026-04-16",
    templates: [
      {
        avgTemp: 18.5,
        weatherCondition: "Clear Sky",
        outingScore: 3,
        outingLabel: "Great Day",
        outingReason:
          "Clear sky with comfortable temperatures, low wind, and little rain.",
      },
      {
        avgTemp: 11.5,
        weatherCondition: "Partly Cloudy",
        outingScore: 2,
        outingLabel: "Okay Day",
        outingReason: "Partly Cloudy with manageable wind and precipitation.",
      },
      {
        avgTemp: 7.0,
        weatherCondition: "Snow",
        outingScore: 1,
        outingLabel: "Not Good",
        outingReason:
          "Snow with 5.5 mm precipitation, 32.0 km/h wind, and a cool 7.0 C average temperature.",
      },
    ],
  },
};

function createSampleGoldRepository() {
  return {
    async readCityForecast(cityKey) {
      const config = CITY_SAMPLE_CONFIG[cityKey];

      if (!config) {
        return {
          metadata: {
            city: cityKey,
            run_date: "2026-04-07",
          },
          daily_forecasts: [],
        };
      }

      return {
        metadata: {
          city: cityKey,
          run_date: config.runDate,
        },
        daily_forecasts: createThirtyDayForecasts(config),
      };
    },
  };
}

function createThirtyDayForecasts(config) {
  const temperatureOffsets = [0, -0.5, 0.5, 1.0];

  return Array.from({ length: 30 }, (_, index) => {
    const template = config.templates[index % config.templates.length];

    return {
      date: addDays(config.startDate, index),
      avg_temp: Number((template.avgTemp + temperatureOffsets[index % temperatureOffsets.length]).toFixed(1)),
      weather_condition: template.weatherCondition,
      outing_score: template.outingScore,
      outing_label: template.outingLabel,
      outing_reason: template.outingReason,
    };
  });
}

function addDays(isoDate, offsetDays) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

module.exports = {
  createSampleGoldRepository,
};
