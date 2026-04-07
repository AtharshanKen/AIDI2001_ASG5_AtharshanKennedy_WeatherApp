const { spawn } = require("node:child_process");
const path = require("node:path");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = ["run", "test:playwright", "--", ...process.argv.slice(2)];

const child = spawn(npmCommand, args, {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PLAYWRIGHT_HOLD_OPEN: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
