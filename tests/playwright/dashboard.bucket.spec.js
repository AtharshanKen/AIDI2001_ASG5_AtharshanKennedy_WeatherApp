const { test, expect } = require("@playwright/test");

const bucketModeConfigured =
  process.env.DASHBOARD_GOLD_REPOSITORY_MODE === "gcp" &&
  Boolean(process.env.DASHBOARD_GCP_BUCKET_NAME) &&
  Boolean(process.env.DASHBOARD_GOLD_RUN_DATE) &&
  Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

test("bucket-backed dashboard renders a real forecast and supports city switching", async ({
  page,
}) => {
  test.skip(
    !bucketModeConfigured,
    "Bucket-backed Playwright smoke test requires GCP dashboard environment variables.",
  );

  await page.goto("/?city=toronto");

  await expect(page.getByRole("heading", { name: "Weather Activity Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "30-Day Forecast" })).toBeVisible();
  await expect(page.getByRole("table", { name: "30-day forecast table" })).toBeVisible();
  await expect(page.getByLabel("Choose a city")).toHaveValue("toronto");
  await expect(page.locator("tbody tr")).toHaveCount(30);

  await page.getByLabel("Choose a city").selectOption("ottawa");
  await page.getByRole("button", { name: "View Forecast" }).click();

  await expect(page).toHaveURL(/city=ottawa/);
  await expect(page.getByLabel("Choose a city")).toHaveValue("ottawa");
  await expect(page.locator("tbody tr")).toHaveCount(30);

  await holdOpenForEvidence(page);
});

test("bucket-backed dashboard can answer a supported question without fixture-specific values", async ({
  page,
}) => {
  test.skip(
    !bucketModeConfigured,
    "Bucket-backed Playwright smoke test requires GCP dashboard environment variables.",
  );

  await page.goto("/?city=toronto");

  await expect(page.getByRole("table", { name: "30-day forecast table" })).toBeVisible();

  await page
    .getByRole("button", {
      name: "What is the average temperature for the next 7 days?",
    })
    .click();

  await expect(page).toHaveURL(/questionId=q2_7_day_average_temp/);
  await expect(
    page.getByRole("heading", {
      name: "What is the average temperature for the next 7 days?",
    }),
  ).toBeVisible();
  await expect(page.getByText(/The next 7-day average temperature in Toronto is/i)).toBeVisible();

  await holdOpenForEvidence(page);
});

async function holdOpenForEvidence(page) {
  if (process.env.PLAYWRIGHT_HOLD_OPEN !== "1") {
    return;
  }

  const browser = page.context().browser();

  if (!browser) {
    return;
  }

  console.log("");
  console.log("Evidence mode: the Playwright checks are complete.");
  console.log("The browser will stay open until you close it yourself.");

  await new Promise((resolve) => {
    browser.once("disconnected", resolve);
  });
}
