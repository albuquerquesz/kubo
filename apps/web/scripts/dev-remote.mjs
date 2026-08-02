/**
 * Dev server for device preview: Next + file-token watcher so phones full-reload
 * when the agent (or you) save files on the notebook.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const children = [];

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  child.on("error", (error) => {
    console.error(`[dev-remote] ${label} failed:`, error);
  });
  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  // force-exit shortly if children hang
  setTimeout(() => process.exit(code), 500).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const runner = typeof Bun !== "undefined" || process.execPath.includes("bun") ? "bun" : "node";

run(runner, ["scripts/remote-reload-watch.mjs"], "watcher");

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const next = run(runner, [nextBin, "dev", "--hostname", "0.0.0.0", "--port", "3333"], "next");

next.on("exit", (code, signal) => {
  shutdown(code ?? (signal ? 1 : 0));
});
