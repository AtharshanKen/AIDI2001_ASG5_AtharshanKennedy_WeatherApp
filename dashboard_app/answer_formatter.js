const { formatAnswerForDisplay } = require("./fallback_formatter");

async function formatAnswer({
  answerPayload,
  openAiEnabled = false,
  openAiFormatter = null,
}) {
  if (!openAiEnabled || !openAiFormatter) {
    return formatAnswerForDisplay(answerPayload);
  }

  try {
    return await openAiFormatter.formatAnswer(answerPayload);
  } catch (error) {
    return formatAnswerForDisplay(answerPayload);
  }
}

module.exports = {
  formatAnswer,
};
