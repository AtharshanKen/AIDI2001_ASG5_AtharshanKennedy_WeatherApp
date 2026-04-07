const { defineConfig } = require("@playwright/test");

const appPort = process.env.PLAYWRIGHT_APP_PORT || "3100";
const appUrl = `http://127.0.0.1:${appPort}`;
const reuseExistingServer = process.env.PLAYWRIGHT_FRESH_SERVER === "1" ? false : true;

module.exports = defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  retries: 0,
  timeout: process.env.PLAYWRIGHT_HOLD_OPEN === "1" ? 0 : 30000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: appUrl,
    browserName: "chromium",
    channel: "msedge",
    headless: false,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    env: {
      ...process.env,
      PORT: appPort,
    },
    url: appUrl,
    reuseExistingServer,
    timeout: 120000,
  },
});
