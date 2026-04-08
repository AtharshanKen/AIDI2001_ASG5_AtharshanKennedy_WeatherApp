const { UnsupportedCityError, getCity, listCities } = require("./city_catalog");
const { answerQuestion } = require("./answer_engine");
const { formatAnswer } = require("./answer_formatter");
const { buildDashboardViewModel } = require("./dashboard_view_model");
const { createGoldRepositoryFromEnvironment } = require("./gold_repository_factory");
const { UnsupportedQuestionError } = require("./question_catalog");
const { renderDashboardPage } = require("./render_dashboard");

function configureApp(app, { goldRepository = createGoldRepositoryFromEnvironment() } = {}) {
  app.get("/", async (request, response, next) => {
    try {
      let selectedCity = getCity("toronto");
      let errorMessage = null;
      let errorTitle = "Unsupported city";
      let selectedQuestionId = null;
      let answerCard = null;

      if (request.query.city) {
        try {
          selectedCity = getCity(request.query.city);
        } catch (error) {
          if (!(error instanceof UnsupportedCityError)) {
            throw error;
          }

          errorMessage = error.message;
          errorTitle = "Unsupported city";
        }
      }

      const goldPayload = await goldRepository.readCityForecast(selectedCity.key);

      if (request.query.questionId) {
        selectedQuestionId = request.query.questionId;

        try {
          const answerPayload = answerQuestion({
            city: selectedCity.key,
            questionId: selectedQuestionId,
            goldPayload,
          });

          answerCard = {
            heading: "Answer",
            questionLabel: answerPayload.questionLabel,
            text: await formatAnswer({
              answerPayload,
              openAiEnabled: false,
            }),
          };
        } catch (error) {
          if (!(error instanceof UnsupportedQuestionError)) {
            throw error;
          }

          errorMessage = error.message;
          errorTitle = "Unsupported question";
        }
      }

      const viewModel = buildDashboardViewModel({
        answerCard,
        cities: listCities(),
        errorTitle,
        selectedQuestionId,
        selectedCity,
        goldPayload,
        errorMessage,
      });

      response
        .status(errorMessage ? 400 : 200)
        .type("html")
        .send(renderDashboardPage(viewModel));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, request, response, next) => {
    response.status(500).type("html").send(`<h1>Dashboard error</h1><p>${error.message}</p>`);
  });

  return app;
}

function createApp({ express = require("express"), goldRepository = createGoldRepositoryFromEnvironment() } = {}) {
  const app = express();
  return configureApp(app, { goldRepository });
}

module.exports = {
  configureApp,
  createApp,
};
