const assert = require("node:assert/strict");
const test = require("node:test");

const { createApp } = require("../../dashboard_app/app");
const { createGoldRepositoryFromEnvironment } = require("../../dashboard_app/gold_repository_factory");

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

class FakeFile {
  constructor(payload) {
    this.payload = payload;
  }

  async download() {
    return [Buffer.from(JSON.stringify(this.payload), "utf-8")];
  }
}

class FakeBucket {
  constructor(filesByName) {
    this.filesByName = filesByName;
  }

  file(name) {
    return new FakeFile(this.filesByName[name]);
  }
}

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
  assert.match(html, /What does the weather look like for the next 30 days\?/);
  assert.match(html, /What is the average temperature for the next 7 days\?/);
  assert.match(html, /Which upcoming days are great for going out, and why\?/);
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

  const response = await fetch(`http://127.0.0.1:${server.address().port}/?city=invalid-city`);
  const html = await response.text();

  assert.equal(response.status, 400);
  assert.match(html, /Weather Activity Dashboard/);
  assert.match(html, /Unsupported city/);
  assert.match(html, /City "invalid-city" is not supported\./);
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

test("GET / can render bucket-backed Gold data when the repository is selected from environment config", async (t) => {
  const torontoBucketPayload = {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [
      {
        date: "2026-04-22",
        avg_temp: 21.5,
        weather_condition: "Clear Sky",
        outing_score: 3,
        outing_label: "Great Day",
        outing_reason:
          "Clear sky with comfortable temperatures, low wind, and little rain.",
      },
    ],
  };
  const bucket = new FakeBucket({
    "weather-demo/gold/toronto_activity_forecast_2026-04-07.json": torontoBucketPayload,
  });
  const app = createApp({
    goldRepository: createGoldRepositoryFromEnvironment({
      env: {
        DASHBOARD_GOLD_REPOSITORY_MODE: "gcp",
        DASHBOARD_GCP_BUCKET_NAME: "assignment-weather",
        DASHBOARD_GCP_BUCKET_PREFIX: "weather-demo",
        DASHBOARD_GOLD_RUN_DATE: "2026-04-07",
      },
      loadBucket(bucketName) {
        assert.equal(bucketName, "assignment-weather");
        return bucket;
      },
    }),
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/?city=toronto`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /2026-04-22/);
  assert.match(html, /Clear Sky/);
  assert.match(html, /Great Day/);
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
  assert.match(html, /--dashboard-city-panel-height:\s*264px;/);
  assert.match(html, /--dashboard-question-panel-height:\s*380px;/);
  assert.match(html, /--dashboard-sidebar-gap:\s*1\.5rem;/);
  assert.match(html, /class="panel forecast-panel"/);
  assert.match(html, /class="sidebar-stack"/);
  assert.match(html, /class="panel city-panel"/);
  assert.match(html, /class="panel question-panel"/);
  assert.match(html, /class="forecast-table-scroll"/);
  assert.match(html, /main\s*\{[\s\S]*align-items:\s*stretch;/);
  assert.match(html, /\.forecast-panel\s*\{[\s\S]*display:\s*flex;/);
  assert.match(html, /\.forecast-panel\s*\{[\s\S]*flex-direction:\s*column;/);
  assert.match(html, /\.forecast-panel\s*\{[\s\S]*height:\s*var\(--dashboard-column-height\);/);
  assert.match(html, /\.sidebar-stack\s*\{[\s\S]*display:\s*grid;/);
  assert.match(
    html,
    /\.sidebar-stack\s*\{[\s\S]*grid-template-rows:\s*var\(--dashboard-city-panel-height\)\s*var\(--dashboard-question-panel-height\);/,
  );
  assert.match(html, /\.sidebar-stack\s*\{[\s\S]*height:\s*var\(--dashboard-column-height\);/);
  assert.match(html, /\.city-panel\s*\{[\s\S]*height:\s*var\(--dashboard-city-panel-height\);/);
  assert.match(html, /\.question-panel\s*\{[\s\S]*height:\s*var\(--dashboard-question-panel-height\);/);
  assert.match(html, /\.question-panel\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(html, /\.forecast-table-scroll\s*\{[\s\S]*flex:\s*1 1 auto;/);
  assert.match(html, /\.forecast-table-scroll\s*\{[\s\S]*min-height:\s*0;/);
  assert.match(html, /\.forecast-table-scroll\s*\{[\s\S]*overflow-y:\s*auto;/);
});

test("GET / with OpenAI formatting enabled renders the formatter output for a supported question", async (t) => {
  const app = createApp({
    goldRepository: {
      async readCityForecast() {
        return SAMPLE_GOLD_PAYLOAD;
      },
    },
    answerFormatting: {
      openAiEnabled: true,
      openAiFormatter: {
        async formatAnswer(answerPayload) {
          assert.equal(answerPayload.questionId, "q2_7_day_average_temp");
          return "OpenAI formatted answer: Toronto should average 20.0 C over the next 7 days.";
        },
      },
    },
  });
  const server = await startServer(app);

  t.after(async () => {
    await stopServer(server);
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/?questionId=q2_7_day_average_temp`,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Answer/);
  assert.match(html, /OpenAI formatted answer: Toronto should average 20.0 C over the next 7 days\./);
});
