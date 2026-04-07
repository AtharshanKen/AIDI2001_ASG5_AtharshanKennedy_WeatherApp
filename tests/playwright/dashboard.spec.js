const { test, expect } = require("@playwright/test");

test("dashboard renders in headed mode and city selection updates the forecast view", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Weather Activity Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "30-Day Forecast" })).toBeVisible();
  await expect(page.getByRole("table", { name: "30-day forecast table" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await expect(page.locator("tbody")).toContainText("2026-04-08");
  await expect(page.locator("tbody")).toContainText("Mainly Clear");

  await page.getByLabel("Choose a city").selectOption("ottawa");
  await page.getByRole("button", { name: "View Forecast" }).click();

  await expect(page).toHaveURL(/city=ottawa/);
  await expect(page.getByLabel("Choose a city")).toHaveValue("ottawa");
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await expect(page.locator("tbody")).toContainText("2026-04-10");
  await expect(page.locator("tbody")).toContainText("Rain");
  await expect(page.locator("tbody")).toContainText("Not Good");

  await holdOpenForEvidence(page);
});

test("unsupported city query shows a visible error banner and safe Toronto fallback", async ({
  page,
}) => {
  await page.goto("/?city=invalid-city");

  await expect(page.getByRole("heading", { name: "Weather Activity Dashboard" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Unsupported city");
  await expect(page.getByRole("alert")).toContainText('City "invalid-city" is not supported.');
  await expect(page.getByLabel("Choose a city")).toHaveValue("toronto");
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await expect(page.locator("tbody")).toContainText("2026-04-08");

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
