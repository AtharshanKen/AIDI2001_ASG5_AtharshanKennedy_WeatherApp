const OpenAI = require("openai");

const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
const FORMATTER_INSTRUCTIONS =
  "You are rewriting a weather dashboard answer for a student-facing web app. " +
  "Make the answer sound friendly, natural, polished, and helpful while staying fully factual. " +
  "Use only the grounded facts provided. Keep every date, temperature, city name, count, condition, and reason exactly unchanged. " +
  "Do not add, remove, infer, generalize, soften, or merge facts. " +
  "Answer the user's question directly in the first sentence. " +
  "Prefer natural conversational wording over stiff summary wording. " +
  "Rewrite awkward phrasing into smoother plain English while preserving the exact facts. " +
  "Write from the provided facts instead of rephrasing a prewritten summary. " +
  "If startDate and endDate are provided, you may describe them as an exact date range using both dates. " +
  "If many dates are provided, keep the response concise and readable. " +
  "Do not list unnecessary extra details for every date unless the question explicitly asks for them. " +
  "If the answer includes many Great Day dates, prioritize readability and keep the wording brief while preserving the dates. " +
  "Use plain English in one short paragraph and return plain text only.";

function createOpenAiFormatter({
  client,
  model = DEFAULT_OPENAI_MODEL,
}) {
  return {
    async formatAnswer(answerPayload) {
      const response = await client.responses.create({
        model,
        instructions: FORMATTER_INSTRUCTIONS,
        input: JSON.stringify(
          {
            questionLabel: answerPayload.questionLabel,
            answerType: answerPayload.answerType,
            facts: answerPayload.facts,
          },
          null,
          2,
        ),
        max_output_tokens: 240,
      });

      const text = response.output_text ? response.output_text.trim() : "";

      if (!text) {
        throw new Error("OpenAI formatter returned no text output.");
      }

      return text;
    },
  };
}

function createOpenAiFormattingFromEnvironment({
  env = process.env,
  OpenAIClient = OpenAI,
} = {}) {
  const apiKey = env.OPENAI_API_KEY;
  const enabledFlag = (env.OPENAI_ENABLED || "").toLowerCase();

  if (!apiKey || enabledFlag === "false") {
    return {
      openAiEnabled: false,
      openAiFormatter: null,
    };
  }

  const client = new OpenAIClient({
    apiKey,
  });

  return {
    openAiEnabled: true,
    openAiFormatter: createOpenAiFormatter({
      client,
      model: env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    }),
  };
}

module.exports = {
  DEFAULT_OPENAI_MODEL,
  FORMATTER_INSTRUCTIONS,
  createOpenAiFormatter,
  createOpenAiFormattingFromEnvironment,
};
