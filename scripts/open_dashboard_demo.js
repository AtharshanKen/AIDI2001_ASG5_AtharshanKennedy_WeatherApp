const { spawn } = require("node:child_process");
const path = require("node:path");

const { chromium } = require("@playwright/test");

const APP_URL = "http://127.0.0.1:3000/";

async function main() {
  const serverProcess = startServer();
  let browser;

  try {
    await waitForServer(APP_URL);
    browser = await chromium.launch({
      channel: "msedge",
      headless: false,
    });

    const page = await browser.newPage();
    await page.goto(APP_URL);

    console.log("Dashboard demo is open in Edge.");
    console.log("You can click around and close the browser when you're done.");

    await new Promise((resolve) => {
      browser.on("disconnected", resolve);
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }

    stopServer(serverProcess);
  }
}

function startServer() {
  return spawnNpm(["start"]);
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch (error) {
      // Keep polling until the local server is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("The dashboard server did not start within 30 seconds.");
}

function stopServer(serverProcess) {
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
}

function spawnNpm(args) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  return spawn(npmCommand, args, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

process.on("SIGINT", () => {
  process.exit(130);
});

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
