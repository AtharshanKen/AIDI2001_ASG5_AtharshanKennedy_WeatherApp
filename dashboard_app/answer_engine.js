const { getQuestionById } = require("./question_catalog");

function answerQuestion({ city, questionId, goldPayload }) {
  const question = getQuestionById(questionId);

  if (question.id === "q1_30_day_outlook") {
    return answerThirtyDayOutlook({ city, question, goldPayload });
  }
  if (question.id === "q2_7_day_average_temp") {
    return answerSevenDayAverageTemperature({ city, question, goldPayload });
  }
  if (question.id === "q3_great_outdoor_days") {
    return answerGreatOutdoorDays({ city, question, goldPayload });
  }

  throw new Error(`Question "${questionId}" is not implemented yet.`);
}

function answerSevenDayAverageTemperature({ city, question, goldPayload }) {
  const nextSevenDays = goldPayload.daily_forecasts.slice(0, 7);

  if (nextSevenDays.length === 0) {
    throw new Error(`No forecast records are available for city "${city}".`);
  }

  const averageTempC = Number(
    (
      nextSevenDays.reduce((total, forecast) => total + forecast.avg_temp, 0) /
      nextSevenDays.length
    ).toFixed(1),
  );

  return {
    questionId: question.id,
    city,
    questionLabel: question.label,
    answerType: "seven_day_average_temp",
    facts: {
      daysConsidered: nextSevenDays.length,
      averageTempC,
      startDate: nextSevenDays[0].date,
      endDate: nextSevenDays[nextSevenDays.length - 1].date,
    },
    summary: `The next 7-day average temperature in ${formatCityName(city)} is ${averageTempC.toFixed(1)} C.`,
  };
}

function formatCityName(city) {
  return String(city).charAt(0).toUpperCase() + String(city).slice(1);
}

function answerGreatOutdoorDays({ city, question, goldPayload }) {
  const greatDays = goldPayload.daily_forecasts
    .filter((forecast) => forecast.outing_label === "Great Day")
    .map((forecast) => ({
      date: forecast.date,
      avgTempC: forecast.avg_temp,
      outingReason: forecast.outing_reason,
    }));

  return {
    questionId: question.id,
    city,
    questionLabel: question.label,
    answerType: "great_outdoor_days",
    facts: {
      totalGreatDays: greatDays.length,
      greatDays,
    },
    summary:
      `${formatCityName(city)} has ${greatDays.length} upcoming Great Day forecasts` +
      `${greatDays.length > 0 ? ` on ${joinDates(greatDays.map((day) => day.date))}.` : "."}`,
  };
}

function joinDates(dates) {
  if (dates.length === 1) {
    return dates[0];
  }
  if (dates.length === 2) {
    return `${dates[0]} and ${dates[1]}`;
  }

  return `${dates.slice(0, -1).join(", ")}, and ${dates[dates.length - 1]}`;
}

function answerThirtyDayOutlook({ city, question, goldPayload }) {
  const forecasts = goldPayload.daily_forecasts;
  const warmestDay = forecasts.reduce((warmest, forecast) => {
    if (!warmest || forecast.avg_temp > warmest.avg_temp) {
      return forecast;
    }

    return warmest;
  }, null);
  const greatDayCount = forecasts.filter((forecast) => forecast.outing_label === "Great Day").length;

  if (!warmestDay) {
    throw new Error(`No forecast records are available for city "${city}".`);
  }

  return {
    questionId: question.id,
    city,
    questionLabel: question.label,
    answerType: "thirty_day_outlook",
    facts: {
      totalDays: forecasts.length,
      greatDayCount,
      warmestDay: {
        date: warmestDay.date,
        avgTempC: warmestDay.avg_temp,
      },
    },
    summary:
      `The next ${forecasts.length} days in ${formatCityName(city)} include ${greatDayCount} Great Day forecasts, ` +
      `and the warmest day is ${warmestDay.date} at ${warmestDay.avg_temp.toFixed(1)} C.`,
  };
}

module.exports = {
  answerQuestion,
};
