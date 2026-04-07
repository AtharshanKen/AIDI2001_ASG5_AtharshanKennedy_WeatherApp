const assert = require("node:assert/strict");
const test = require("node:test");

const { formatAnswer } = require("../../dashboard_app/answer_formatter");

const ANSWER_PAYLOAD = {
  questionId: "q2_7_day_average_temp",
  city: "toronto",
  questionLabel: "What is the average [Temp] in [City] for the next 7 days?",
  answerType: "seven_day_average_temp",
  facts: {
    averageTempC: 16.0,
  },
  summary: "The next 7-day average temperature in Toronto is 16.0 C.",
};

test("answer formatter returns the fallback text when OpenAI formatting is disabled", async () => {
  assert.equal(
    await formatAnswer({
      answerPayload: ANSWER_PAYLOAD,
      openAiEnabled: false,
    }),
    "The next 7-day average temperature in Toronto is 16.0 C.",
  );
});

test("answer formatter falls back when the OpenAI formatter throws", async () => {
  assert.equal(
    await formatAnswer({
      answerPayload: ANSWER_PAYLOAD,
      openAiEnabled: true,
      openAiFormatter: {
        async formatAnswer() {
          throw new Error("Formatter unavailable");
        },
      },
    }),
    "The next 7-day average temperature in Toronto is 16.0 C.",
  );
});

test("answer formatter uses the OpenAI formatter result when one is provided", async () => {
  assert.equal(
    await formatAnswer({
      answerPayload: ANSWER_PAYLOAD,
      openAiEnabled: true,
      openAiFormatter: {
        async formatAnswer(answerPayload) {
          return `Formatted: ${answerPayload.summary}`;
        },
      },
    }),
    "Formatted: The next 7-day average temperature in Toronto is 16.0 C.",
  );
});
