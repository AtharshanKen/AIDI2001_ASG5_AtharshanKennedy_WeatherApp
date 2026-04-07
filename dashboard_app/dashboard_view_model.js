const { listSupportedQuestions } = require("./question_catalog");

function buildDashboardViewModel({
  cities,
  selectedCity,
  goldPayload,
  errorMessage = null,
  errorTitle = "Unsupported city",
  selectedQuestionId = null,
  answerCard = null,
}) {
  return {
    answerCard,
    cities: cities.map((city) => ({
      ...city,
      selected: city.key === selectedCity.key,
    })),
    errorMessage,
    errorTitle,
    questions: listSupportedQuestions().map((question) => ({
      ...question,
      selected: question.id === selectedQuestionId,
      url: `/?city=${selectedCity.key}&questionId=${question.id}`,
    })),
    selectedCity,
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
