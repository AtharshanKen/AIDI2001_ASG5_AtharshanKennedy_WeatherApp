const { spawn } = require("node:child_process");
const path = require("node:path");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = ["run", "test:playwright", "--", ...process.argv.slice(2)];
const appPort = String(3400 + Math.floor(Math.random() * 200));

console.log(`Playwright evidence run will use fresh app port ${appPort}.`);

const child = spawn(npmCommand, args, {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PLAYWRIGHT_HOLD_OPEN: "1",
    PLAYWRIGHT_FRESH_SERVER: "1",
    PLAYWRIGHT_APP_PORT: appPort,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
