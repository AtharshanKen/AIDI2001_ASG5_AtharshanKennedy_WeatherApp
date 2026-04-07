const { test, expect } = require("@playwright/test");

test("user can click a supported question and see a grounded fallback answer", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Weather Activity Dashboard" })).toBeVisible();
  await expect(page.getByLabel("Choose a city")).toHaveValue("toronto");
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
  await expect(page.getByText("The next 7-day average temperature in Toronto is 16.9 C.")).toBeVisible();

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
