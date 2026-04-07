const assert = require("node:assert/strict");
const test = require("node:test");

const { createApp } = require("../../dashboard_app/app");

async function startServer(app) {
  return await new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

test("GET / with a supported question renders a readable fallback answer for the selected city", async (t) => {
  const goldPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      { date: "2026-04-08", avg_temp: 10.0, outing_label: "Okay Day", outing_reason: "x" },
      { date: "2026-04-09", avg_temp: 12.0, outing_label: "Okay Day", outing_reason: "x" },
      { date: "2026-04-10", avg_temp: 14.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-11", avg_temp: 16.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-12", avg_temp: 18.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-13", avg_temp: 20.0, outing_label: "Great Day", outing_reason: "x" },
      { date: "2026-04-14", avg_temp: 22.0, outing_label: "Great Day", outing_reason: "x" },
    ],
  };
  const app = createApp({
    goldRepository: {
      async readCityForecast(cityKey) {
        assert.equal(cityKey, "toronto");
        return goldPayload;
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/?city=toronto&questionId=q2_7_day_average_temp`,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Answer/);
  assert.match(html, /The next 7-day average temperature in Toronto is 16.0 C\./);
  assert.match(html, /question-button-active/);
});

test("GET / with an unsupported question renders a clear question-specific error state", async (t) => {
  const goldPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-08",
        avg_temp: 10.0,
        weather_condition: "Mainly Clear",
        outing_label: "Okay Day",
        outing_reason: "x",
      },
    ],
  };
  const app = createApp({
    goldRepository: {
      async readCityForecast() {
        return goldPayload;
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/?city=toronto&questionId=invalid-question`,
  );
  const html = await response.text();

  assert.equal(response.status, 400);
  assert.match(html, /Unsupported question/);
  assert.match(html, /Question "invalid-question" is not supported\./);
  assert.match(html, /Weather Activity Dashboard/);
});
