const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEFAULT_OPENAI_MODEL,
  FORMATTER_INSTRUCTIONS,
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
  assert.equal(requests[0].request.max_output_tokens, 240);
  assert.equal(requests[0].request.instructions, FORMATTER_INSTRUCTIONS);
  assert.match(
    requests[0].request.instructions,
    /Make the answer sound friendly, natural, polished, and helpful while staying fully factual/,
  );
  assert.match(requests[0].request.instructions, /Use only the grounded facts provided/);
  assert.match(
    requests[0].request.instructions,
    /Keep every date, temperature, city name, count, condition, and reason exactly unchanged/,
  );
  assert.match(requests[0].request.instructions, /Do not add, remove, infer, generalize, soften, or merge facts/);
  assert.match(requests[0].request.instructions, /Answer the user's question directly in the first sentence/);
  assert.match(requests[0].request.instructions, /Prefer natural conversational wording over stiff summary wording/);
  assert.match(
    requests[0].request.instructions,
    /Rewrite awkward phrasing into smoother plain English while preserving the exact facts/,
  );
  assert.match(
    requests[0].request.instructions,
    /Write from the provided facts instead of rephrasing a prewritten summary/,
  );
  assert.match(
    requests[0].request.instructions,
    /If startDate and endDate are provided, you may describe them as an exact date range using both dates/,
  );
  assert.match(
    requests[0].request.instructions,
    /If many dates are provided, keep the response concise and readable/,
  );
  assert.match(
    requests[0].request.instructions,
    /Do not list unnecessary extra details for every date unless the question explicitly asks for them/,
  );
  assert.match(
    requests[0].request.instructions,
    /If the answer includes many Great Day dates, prioritize readability and keep the wording brief while preserving the dates/,
  );

  assert.match(requests[0].request.input, /questionLabel/);
  assert.match(requests[0].request.input, /answerType/);
  assert.match(requests[0].request.input, /averageTempC/);
  assert.doesNotMatch(requests[0].request.input, /"summary"/);
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
