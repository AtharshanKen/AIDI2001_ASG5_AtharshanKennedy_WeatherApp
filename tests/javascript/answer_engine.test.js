const assert = require("node:assert/strict");
const test = require("node:test");

const { answerQuestion } = require("../../dashboard_app/answer_engine");

test("answer engine returns a deterministic payload for the 7-day average temperature question", () => {
  const goldPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      { date: "2026-04-08", avg_temp: 10.0, outing_label: "Okay Day", outing_reason: "x" },
      { date: "2026-04-09", avg_temp: 12.0, outing_label: "Okay Day", outing_reason: "x" },
      { date: "2026-04-10", avg_temp: 14.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-11", avg_temp: 16.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-12", avg_temp: 18.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-13", avg_temp: 20.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-14", avg_temp: 22.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-15", avg_temp: 99.0, outing_label: "Not Good", outing_reason: "x" },
    ],
  };

  assert.deepEqual(
    answerQuestion({
      city: "toronto",
      questionId: "q2_7_day_average_temp",
      goldPayload,
    }),
    {
      questionId: "q2_7_day_average_temp",
      city: "toronto",
      questionLabel: "What is the average temperature for the next 7 days?",
      answerType: "seven_day_average_temp",
      facts: {
        daysConsidered: 7,
        averageTempC: 16.0,
        startDate: "2026-04-08",
        endDate: "2026-04-14",
      },
      summary: "The next 7-day average temperature in Toronto is 16.0 C.",
    },
  );
});

test("answer engine returns only upcoming Great Day rows and grounded reasons for the go-out question", () => {
  const goldPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-08",
        avg_temp: 10.0,
        outing_label: "Okay Day",
        outing_reason: "Overcast with manageable wind and precipitation.",
      },
      {
        date: "2026-04-09",
        avg_temp: 18.0,
        outing_label: "Great Day",
        outing_reason: "Mainly clear with comfortable temperatures, low wind, and little rain.",
      },
      {
        date: "2026-04-10",
        avg_temp: 12.0,
        outing_label: "Not Good",
        outing_reason: "Rain with 6.0 mm precipitation, 38.0 km/h wind, and a cool 12.0 C average temperature.",
      },
      {
        date: "2026-04-11",
        avg_temp: 20.0,
        outing_label: "Great Day",
        outing_reason: "Partly cloudy with comfortable temperatures, low wind, and little rain.",
      },
    ],
  };

  assert.deepEqual(
    answerQuestion({
      city: "toronto",
      questionId: "q3_great_outdoor_days",
      goldPayload,
    }),
    {
      questionId: "q3_great_outdoor_days",
      city: "toronto",
      questionLabel: "Which upcoming days are great for going out, and why?",
      answerType: "great_outdoor_days",
      facts: {
        totalGreatDays: 2,
        greatDays: [
          {
            date: "2026-04-09",
            avgTempC: 18.0,
            outingReason:
              "Mainly clear with comfortable temperatures, low wind, and little rain.",
          },
          {
            date: "2026-04-11",
            avgTempC: 20.0,
            outingReason:
              "Partly cloudy with comfortable temperatures, low wind, and little rain.",
          },
        ],
      },
      summary:
        "Toronto has 2 upcoming Great Day forecasts on 2026-04-09 and 2026-04-11.",
    },
  );
});

test("answer engine returns a deterministic 30-day outlook summary from Gold records", () => {
  const goldPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      { date: "2026-04-08", avg_temp: 10.0, outing_label: "Okay Day", outing_reason: "x" },
      { date: "2026-04-09", avg_temp: 18.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-10", avg_temp: 12.0, outing_label: "Not Good", outing_reason: "x" },
      { date: "2026-04-11", avg_temp: 20.0, outing_label: "Great Day", outing_reason: "x" },
    ],
  };

  assert.deepEqual(
    answerQuestion({
      city: "toronto",
      questionId: "q1_30_day_outlook",
      goldPayload,
    }),
    {
      questionId: "q1_30_day_outlook",
      city: "toronto",
      questionLabel: "What does the weather look like for the next 30 days?",
      answerType: "thirty_day_outlook",
      facts: {
        totalDays: 4,
        greatDayCount: 2,
        warmestDay: {
          date: "2026-04-11",
          avgTempC: 20.0,
        },
      },
      summary:
        "The next 4 days in Toronto include 2 Great Day forecasts, and the warmest day is 2026-04-11 at 20.0 C.",
    },
  );
});
