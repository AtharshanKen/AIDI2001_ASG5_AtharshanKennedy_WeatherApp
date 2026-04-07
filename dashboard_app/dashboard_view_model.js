const QUESTION_LABELS = [
  "What does the weather in [City] look like for the next 30 days?",
  "What is the average [Temp] in [City] for the next 7 days?",
  "Which upcoming days in [City] are great for going out, and why?",
];

function buildDashboardViewModel({ cities, selectedCity, goldPayload, errorMessage = null }) {
  return {
    cities: cities.map((city) => ({
      ...city,
      selected: city.key === selectedCity.key,
    })),
    errorMessage,
    selectedCity,
    questionLabels: [...QUESTION_LABELS],
    forecastRows: goldPayload.daily_forecasts.map((forecast) => ({
      date: forecast.date,
      avgTemp: `${forecast.avg_temp.toFixed(1)} C`,
      weatherCondition: forecast.weather_condition,
      outingLabel: forecast.outing_label,
      outingReason: forecast.outing_reason,
    })),
  };
}

module.exports = {
  buildDashboardViewModel,
};
