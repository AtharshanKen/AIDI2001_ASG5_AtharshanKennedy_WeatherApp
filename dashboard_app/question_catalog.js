const SUPPORTED_QUESTIONS = [
  {
    id: "q1_30_day_outlook",
    label: "What does the weather look like for the next 30 days?",
  },
  {
    id: "q2_7_day_average_temp",
    label: "What is the average temperature for the next 7 days?",
  },
  {
    id: "q3_great_outdoor_days",
    label: "Which upcoming days are great for going out, and why?",
  },
];

class UnsupportedQuestionError extends Error {
  constructor(questionId) {
    super(`Question "${questionId}" is not supported.`);
    this.name = "UnsupportedQuestionError";
  }
}

function listSupportedQuestions() {
  return SUPPORTED_QUESTIONS.map((question) => ({ ...question }));
}

function getQuestionById(questionId) {
  const question = SUPPORTED_QUESTIONS.find((entry) => entry.id === questionId);

  if (!question) {
    throw new UnsupportedQuestionError(questionId);
  }

  return { ...question };
}

module.exports = {
  getQuestionById,
  listSupportedQuestions,
  UnsupportedQuestionError,
};
