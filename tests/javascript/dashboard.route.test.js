const assert = require("node:assert/strict");
const test = require("node:test");

const { createApp } = require("../../dashboard_app/app");

const SAMPLE_GOLD_PAYLOAD = {
  metadata: {
    city: "toronto",
    run_date: "2026-04-07",
  },
  daily_forecasts: [
    {
      date: "2026-04-08",
      avg_temp: 20.0,
      weather_condition: "Mainly Clear",
      outing_score: 3,
      outing_label: "Great Day",
      outing_reason:
        "Mainly clear with comfortable temperatures, low wind, and little rain.",
    },
  ],
};

const OTTAWA_GOLD_PAYLOAD = {
  metadata: {
    city: "ottawa",
    run_date: "2026-04-07",
  },
  daily_forecasts: [
    {
      date: "2026-04-10",
      avg_temp: 12.5,
      weather_condition: "Rain",
      outing_score: 1,
      outing_label: "Not Good",
      outing_reason:
        "Rain with 6.0 mm precipitation, 38.0 km/h wind, and a cool 12.5 C average temperature.",
    },
  ],
};

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

test("GET / renders the dashboard shell with a selected city and forecast table", async (t) => {
  const app = createApp({
    goldRepository: {
      async readCityForecast(cityKey) {
        assert.equal(cityKey, "toronto");
        return SAMPLE_GOLD_PAYLOAD;
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Weather Activity Dashboard/);
  assert.match(html, /<select[^>]*name="city"/);
  assert.match(html, /<option value="toronto" selected>Toronto<\/option>/);
  assert.match(html, /<option value="ottawa">Ottawa<\/option>/);
  assert.match(html, /30-Day Forecast/);
  assert.match(html, /2026-04-08/);
  assert.match(html, /Mainly Clear/);
  assert.match(html, /Great Day/);
  assert.match(html, /Questions/);
  assert.match(html, /What does the weather in \[City\] look like for the next 30 days\?/);
  assert.match(html, /What is the average \[Temp\] in \[City\] for the next 7 days\?/);
  assert.match(
    html,
    /Which upcoming days in \[City\] are great for going out, and why\?/,
  );
});

test("GET / with an unsupported city renders a graceful dashboard error state", async (t) => {
  const app = createApp({
    goldRepository: {
      async readCityForecast() {
        return SAMPLE_GOLD_PAYLOAD;
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/?city=halifax`);
  const html = await response.text();

  assert.equal(response.status, 400);
  assert.match(html, /Weather Activity Dashboard/);
  assert.match(html, /Unsupported city/);
  assert.match(html, /City "halifax" is not supported\./);
  assert.match(html, /<option value="toronto" selected>Toronto<\/option>/);
  assert.match(html, /30-Day Forecast/);
});

test("GET / uses the selected valid city to render a different forecast table", async (t) => {
  const app = createApp({
    goldRepository: {
      async readCityForecast(cityKey) {
        if (cityKey === "ottawa") {
          return OTTAWA_GOLD_PAYLOAD;
        }

        return SAMPLE_GOLD_PAYLOAD;
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/?city=ottawa`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<option value="ottawa" selected>Ottawa<\/option>/);
  assert.doesNotMatch(html, /<option value="toronto" selected>Toronto<\/option>/);
  assert.match(html, /2026-04-10/);
  assert.match(html, /Rain/);
  assert.match(html, /Not Good/);
});

test("GET / uses built-in sample Gold data for other supported cities in local mode", async (t) => {
  const app = createApp();
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/?city=ottawa`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<option value="ottawa" selected>Ottawa<\/option>/);
  assert.match(html, /2026-04-10/);
  assert.match(html, /Rain/);
  assert.match(html, /Not Good/);
});

test("GET / in local mode renders a full 30-day forecast table for the selected city", async (t) => {
  const app = createApp();
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  const html = await response.text();
  const bodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  const rowCount = bodyMatch ? (bodyMatch[1].match(/<tr>/g) || []).length : 0;

  assert.equal(response.status, 200);
  assert.equal(rowCount, 30);
  assert.match(html, /2026-04-08/);
  assert.match(html, /2026-05-07/);
});
