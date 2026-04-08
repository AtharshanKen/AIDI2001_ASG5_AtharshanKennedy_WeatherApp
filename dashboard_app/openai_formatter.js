const OpenAI = require("openai");

const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";

function createOpenAiFormatter({
  client,
  model = DEFAULT_OPENAI_MODEL,
}) {
  return {
    async formatAnswer(answerPayload) {
      const response = await client.responses.create({
        model,
        instructions:
          "Rewrite the provided weather answer for readability using only the grounded facts provided. Do not add, remove, or change facts, dates, temperatures, or city names. Return plain text only.",
        input: JSON.stringify(
          {
            questionLabel: answerPayload.questionLabel,
            summary: answerPayload.summary,
            facts: answerPayload.facts,
          },
          null,
          2,
        ),
        max_output_tokens: 160,
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
  createOpenAiFormatter,
  createOpenAiFormattingFromEnvironment,
};
