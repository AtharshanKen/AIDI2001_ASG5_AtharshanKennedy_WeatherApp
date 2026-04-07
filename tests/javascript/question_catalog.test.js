const assert = require("node:assert/strict");
const test = require("node:test");

const { listSupportedQuestions } = require("../../dashboard_app/question_catalog");

test("question catalog exposes exactly the three approved questions in a stable order", () => {
  assert.deepEqual(listSupportedQuestions(), [
    {
      id: "q1_30_day_outlook",
      label: "What does the weather in [City] look like for the next 30 days?",
    },
    {
      id: "q2_7_day_average_temp",
      label: "What is the average [Temp] in [City] for the next 7 days?",
    },
    {
      id: "q3_great_outdoor_days",
      label: "Which upcoming days in [City] are great for going out, and why?",
    },
  ]);
});
