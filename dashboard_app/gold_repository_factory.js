const { createSampleGoldRepository } = require("./sample_gold_repository");

function createGoldRepositoryFromEnvironment({
  env = process.env,
  loadBucket = loadGoogleCloudBucket,
  sampleFactory = createSampleGoldRepository,
} = {}) {
  const repositoryMode = String(env.DASHBOARD_GOLD_REPOSITORY_MODE ?? "local").toLowerCase();

  if (repositoryMode === "local") {
    return sampleFactory();
  }

  if (repositoryMode === "gcp") {
    const bucketName = env.DASHBOARD_GCP_BUCKET_NAME;
    const runDate = env.DASHBOARD_GOLD_RUN_DATE;

    if (!bucketName) {
      throw new Error("DASHBOARD_GCP_BUCKET_NAME is required for gcp repository mode");
    }
    if (!runDate) {
      throw new Error("DASHBOARD_GOLD_RUN_DATE is required for gcp repository mode");
    }

    return createBucketGoldRepository({
      bucket: loadBucket(bucketName),
      prefix: env.DASHBOARD_GCP_BUCKET_PREFIX ?? "",
      runDate,
    });
  }

  throw new Error(`Unsupported dashboard gold repository mode: ${repositoryMode}`);
}

function createBucketGoldRepository({ bucket, prefix = "", runDate }) {
  return {
    async readCityForecast(cityKey) {
      const objectKey = buildGoldObjectKey({ cityKey, prefix, runDate });
      const file = bucket.file(objectKey);
      const [contents] = await file.download();
      return JSON.parse(contents.toString("utf-8"));
    },
  };
}

function buildGoldObjectKey({ cityKey, prefix, runDate }) {
  const path = `gold/${cityKey}_activity_forecast_${runDate}.json`;
  const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, "");
  return normalizedPrefix ? `${normalizedPrefix}/${path}` : path;
}

function loadGoogleCloudBucket(bucketName) {
  try {
    const { Storage } = require("@google-cloud/storage");
    const client = new Storage();
    return client.bucket(bucketName);
  } catch (error) {
    throw new Error(
      `@google-cloud/storage is required for gcp repository mode: ${error.message}`,
    );
  }
}

module.exports = {
  buildGoldObjectKey,
  createBucketGoldRepository,
  createGoldRepositoryFromEnvironment,
  loadGoogleCloudBucket,
};
