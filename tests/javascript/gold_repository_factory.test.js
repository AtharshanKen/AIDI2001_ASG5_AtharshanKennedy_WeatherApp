const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildGoldObjectKey,
  createGoldRepositoryFromEnvironment,
  loadGoogleCloudBucket,
} = require("../../dashboard_app/gold_repository_factory");

class FakeFile {
  constructor(name, payload) {
    this.name = name;
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
    this.prefixRequests = [];
  }

  file(name) {
    this.requestedNames.push(name);
    return new FakeFile(name, this.filesByName[name]);
  }

  async getFiles(options) {
    this.prefixRequests.push(options.prefix);
    const files = Object.entries(this.filesByName)
      .filter(([name]) => name.startsWith(options.prefix))
      .map(([name, payload]) => new FakeFile(name, payload));

    return [files];
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

test("gold repository factory can discover the latest bucket-backed Gold run when no run date is configured", async () => {
  const bucket = new FakeBucket({
    "weather-demo/gold/toronto_activity_forecast_2026-04-07.json": {
      metadata: {
        city: "toronto",
        run_date: "2026-04-07",
      },
      daily_forecasts: [
        {
          date: "2026-04-08",
        },
      ],
    },
    "weather-demo/gold/toronto_activity_forecast_2026-04-08.json": {
      metadata: {
        city: "toronto",
        run_date: "2026-04-08",
      },
      daily_forecasts: [
        {
          date: "2026-04-09",
        },
      ],
    },
  });
  const repository = createGoldRepositoryFromEnvironment({
    env: {
      DASHBOARD_GOLD_REPOSITORY_MODE: "gcp",
      DASHBOARD_GCP_BUCKET_NAME: "assignment-weather",
      DASHBOARD_GCP_BUCKET_PREFIX: "weather-demo",
    },
    loadBucket() {
      return bucket;
    },
  });

  const goldPayload = await repository.readCityForecast("toronto");

  assert.deepEqual(bucket.prefixRequests, ["weather-demo/gold/toronto_activity_forecast_"]);
  assert.deepEqual(bucket.requestedNames, ["weather-demo/gold/toronto_activity_forecast_2026-04-08.json"]);
  assert.equal(goldPayload.metadata.run_date, "2026-04-08");
});

test("gold repository bucket loader can use JSON credentials from environment for hosted runtimes", () => {
  const calls = [];

  class FakeStorage {
    constructor(options) {
      calls.push(options);
    }

    bucket(bucketName) {
      return {
        bucketName,
      };
    }
  }

  const bucket = loadGoogleCloudBucket("assignment-weather", {
    env: {
      GCP_CREDENTIALS_JSON: JSON.stringify({
        client_email: "weather-bot@example.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
        project_id: "weather-demo",
      }),
    },
    StorageClient: FakeStorage,
  });

  assert.deepEqual(calls, [
    {
      credentials: {
        client_email: "weather-bot@example.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
        project_id: "weather-demo",
      },
      projectId: "weather-demo",
    },
  ]);
  assert.deepEqual(bucket, {
    bucketName: "assignment-weather",
  });
});
