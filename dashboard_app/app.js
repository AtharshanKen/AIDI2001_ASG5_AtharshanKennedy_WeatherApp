const express = require("express");

const { UnsupportedCityError, getCity, listCities } = require("./city_catalog");
const { buildDashboardViewModel } = require("./dashboard_view_model");
const { createSampleGoldRepository } = require("./sample_gold_repository");
const { renderDashboardPage } = require("./render_dashboard");

function createApp({ goldRepository = createSampleGoldRepository() } = {}) {
  const app = express();

  app.get("/", async (request, response, next) => {
    try {
      let selectedCity = getCity("toronto");
      let errorMessage = null;

      if (request.query.city) {
        try {
          selectedCity = getCity(request.query.city);
        } catch (error) {
          if (!(error instanceof UnsupportedCityError)) {
            throw error;
          }

          errorMessage = error.message;
        }
      }

      const goldPayload = await goldRepository.readCityForecast(selectedCity.key);
      const viewModel = buildDashboardViewModel({
        cities: listCities(),
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

module.exports = {
  createApp,
};
