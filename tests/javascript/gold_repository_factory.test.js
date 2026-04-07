const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildGoldObjectKey,
  createGoldRepositoryFromEnvironment,
} = require("../../dashboard_app/gold_repository_factory");

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
    this.requestedNames = [];
  }

  file(name) {
    this.requestedNames.push(name);
    return new FakeFile(this.filesByName[name]);
  }
}

test("gold repository factory returns local sample repository by default", async () => {
  const repository = createGoldRepositoryFromEnvironment();
  const goldPayload = await repository.readCityForecast("toronto");

  assert.equal(goldPayload.metadata.city, "toronto");
  assert.equal(goldPayload.daily_forecasts.length, 30);
});

test("gold repository factory can return a bucket-backed repository from environment config", async () => {
  const objectKey = "weather-demo/gold/toronto_activity_forecast_2026-04-07.json";
  const bucket = new FakeBucket({
    [objectKey]: {
      metadata: {
        city: "toronto",
        run_date: "2026-04-07",
      },
      daily_forecasts: [],
    },
  });
  const loadBucketCalls = [];
  const repository = createGoldRepositoryFromEnvironment({
    env: {
      DASHBOARD_GOLD_REPOSITORY_MODE: "gcp",
      DASHBOARD_GCP_BUCKET_NAME: "assignment-weather",
      DASHBOARD_GCP_BUCKET_PREFIX: "weather-demo",
      DASHBOARD_GOLD_RUN_DATE: "2026-04-07",
    },
    loadBucket(bucketName) {
      loadBucketCalls.push(bucketName);
      return bucket;
    },
  });

  const goldPayload = await repository.readCityForecast("toronto");

  assert.deepEqual(loadBucketCalls, ["assignment-weather"]);
  assert.deepEqual(bucket.requestedNames, [objectKey]);
  assert.deepEqual(goldPayload, {
    metadata: {
      city: "toronto",
      run_date: "2026-04-07",
    },
    daily_forecasts: [],
  });
});

test("gold repository object key builder uses optional prefixes without double slashes", () => {
  assert.equal(
    buildGoldObjectKey({
      cityKey: "toronto",
      prefix: "/weather-demo/",
      runDate: "2026-04-07",
    }),
    "weather-demo/gold/toronto_activity_forecast_2026-04-07.json",
  );
});
