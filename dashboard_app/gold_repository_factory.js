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

    return createBucketGoldRepository({
      bucket: loadBucket(bucketName, { env }),
      prefix: env.DASHBOARD_GCP_BUCKET_PREFIX ?? "",
      runDate,
    });
  }

  throw new Error(`Unsupported dashboard gold repository mode: ${repositoryMode}`);
}

function createBucketGoldRepository({ bucket, prefix = "", runDate }) {
  return {
    async readCityForecast(cityKey) {
      const objectKey = runDate
        ? buildGoldObjectKey({ cityKey, prefix, runDate })
        : await findLatestGoldObjectKey({ bucket, cityKey, prefix });
      const file = bucket.file(objectKey);
      const [contents] = await file.download();
      return JSON.parse(contents.toString("utf-8"));
    },
  };
}

function buildGoldObjectPrefix({ cityKey, prefix }) {
  const path = `gold/${cityKey}_activity_forecast_`;
  const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, "");
  return normalizedPrefix ? `${normalizedPrefix}/${path}` : path;
}

function buildGoldObjectKey({ cityKey, prefix, runDate }) {
  return `${buildGoldObjectPrefix({ cityKey, prefix })}${runDate}.json`;
}

async function findLatestGoldObjectKey({ bucket, cityKey, prefix = "" }) {
  const objectPrefix = buildGoldObjectPrefix({ cityKey, prefix });
  const [files] = await bucket.getFiles({
    prefix: objectPrefix,
  });
  const matchingKeys = files
    .map((file) => file.name)
    .filter((name) => /^.+\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();

  const latestObjectKey = matchingKeys.at(-1);

  if (!latestObjectKey) {
    throw new Error(`No Gold bucket objects found for city "${cityKey}".`);
  }

  return latestObjectKey;
}

function buildGoogleCloudStorageClientOptions(env = process.env) {
  const rawCredentials =
    env.DASHBOARD_GCP_CREDENTIALS_JSON ??
    env.GCP_CREDENTIALS_JSON ??
    env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!rawCredentials) {
    return {};
  }

  const credentials = JSON.parse(rawCredentials);
  const options = {
    credentials,
  };

  if (credentials.project_id) {
    options.projectId = credentials.project_id;
  }

  return options;
}

function loadGoogleCloudBucket(bucketName, {
  env = process.env,
  StorageClient,
} = {}) {
  try {
    const { Storage } = require("@google-cloud/storage");
    const Client = StorageClient || Storage;
    const client = new Client(buildGoogleCloudStorageClientOptions(env));
    return client.bucket(bucketName);
  } catch (error) {
    throw new Error(
      `@google-cloud/storage is required for gcp repository mode: ${error.message}`,
    );
  }
}

module.exports = {
  buildGoogleCloudStorageClientOptions,
  buildGoldObjectKey,
  buildGoldObjectPrefix,
  createBucketGoldRepository,
  createGoldRepositoryFromEnvironment,
  findLatestGoldObjectKey,
  loadGoogleCloudBucket,
};
