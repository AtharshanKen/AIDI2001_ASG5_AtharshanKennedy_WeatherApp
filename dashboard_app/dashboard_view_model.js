const { listSupportedQuestions } = require("./question_catalog");

function buildDashboardViewModel({ cities, selectedCity, goldPayload, errorMessage = null }) {
  return {
    cities: cities.map((city) => ({
      ...city,
      selected: city.key === selectedCity.key,
    })),
    errorMessage,
    selectedCity,
    questionLabels: listSupportedQuestions().map((question) => question.label),
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
