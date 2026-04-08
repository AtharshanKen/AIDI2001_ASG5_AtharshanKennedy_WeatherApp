const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEFAULT_OPENAI_MODEL,
  createOpenAiFormattingFromEnvironment,
} = require("../../dashboard_app/openai_formatter");

const ANSWER_PAYLOAD = {
  questionId: "q2_7_day_average_temp",
  city: "toronto",
  questionLabel: "What is the average temperature for the next 7 days?",
  answerType: "seven_day_average_temp",
  facts: {
    averageTempC: 16.0,
    startDate: "2026-04-08",
    endDate: "2026-04-14",
  },
  summary: "The next 7-day average temperature in Toronto is 16.0 C.",
};

test("OpenAI formatting stays disabled when no API key is configured", () => {
  assert.deepEqual(
    createOpenAiFormattingFromEnvironment({
      env: {},
    }),
    {
      openAiEnabled: false,
      openAiFormatter: null,
    },
  );
});

test("OpenAI formatter uses the Responses API with the configured model and grounded payload", async () => {
  const requests = [];

  class FakeOpenAI {
    constructor(options) {
      this.options = options;
      this.responses = {
        create: async (request) => {
          requests.push({
            apiKey: options.apiKey,
            request,
          });

          return {
            output_text: "Formatted by OpenAI.",
          };
        },
      };
    }
  }

  const formatting = createOpenAiFormattingFromEnvironment({
    env: {
      OPENAI_API_KEY: "sk-test",
      OPENAI_MODEL: "gpt-5.4-mini",
    },
    OpenAIClient: FakeOpenAI,
  });

  assert.equal(formatting.openAiEnabled, true);
  assert.ok(formatting.openAiFormatter);
  assert.equal(await formatting.openAiFormatter.formatAnswer(ANSWER_PAYLOAD), "Formatted by OpenAI.");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].apiKey, "sk-test");
  assert.equal(requests[0].request.model, "gpt-5.4-mini");
  assert.equal(requests[0].request.max_output_tokens, 160);
  assert.match(requests[0].request.instructions, /Do not add, remove, or change facts/);
  assert.match(requests[0].request.input, /questionLabel/);
  assert.match(requests[0].request.input, /averageTempC/);
});

test("OpenAI formatter uses the default model when none is configured", async () => {
  const models = [];

  class FakeOpenAI {
    constructor() {
      this.responses = {
        create: async (request) => {
          models.push(request.model);
          return {
            output_text: "Formatted by default model.",
          };
        },
      };
    }
  }

  const formatting = createOpenAiFormattingFromEnvironment({
    env: {
      OPENAI_API_KEY: "sk-test",
    },
    OpenAIClient: FakeOpenAI,
  });

  assert.equal(await formatting.openAiFormatter.formatAnswer(ANSWER_PAYLOAD), "Formatted by default model.");
  assert.deepEqual(models, [DEFAULT_OPENAI_MODEL]);
});
