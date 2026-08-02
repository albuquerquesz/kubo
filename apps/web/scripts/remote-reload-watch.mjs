/**
 * Watches web sources and bumps a token file whenever an agent/editor saves.
 * Remote phones poll the token via /api/dev/remote-reload and full-reload —
 * more reliable than Next HMR over Tailscale/MagicDNS.
 */
import { watch, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokenPath = join(root, ".remote-reload-token");

const watchTargets = [
  join(root, "src"),
  join(root, "content"),
  join(root, "public"),
  join(root, "next.config.ts"),
  join(root, "source.config.ts"),
];

let debounceTimer;
let lastToken = "";

function writeToken(reason) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (token === lastToken) return;
  lastToken = token;
  writeFileSync(tokenPath, token, "utf8");
  console.log(`[remote-reload] ${token}${reason ? ` (${reason})` : ""}`);
}

function bump(reason) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => writeToken(reason), 350);
}

writeToken("start");

for (const target of watchTargets) {
  if (!existsSync(target)) {
    console.warn(`[remote-reload] skip missing: ${target}`);
    continue;
  }
  try {
    // recursive is supported on Linux for directories
    watch(target, { recursive: true }, (_event, filename) => {
      const name = filename?.toString?.() ?? "";
      // ignore noisy maps / tsbuildinfo if any slip in
      if (name.endsWith(".map") || name.endsWith(".tsbuildinfo")) return;
      bump(name || target);
    });
    console.log(`[remote-reload] watching ${target}`);
  } catch (error) {
    console.warn(`[remote-reload] failed to watch ${target}:`, error);
  }
}

console.log(`[remote-reload] token file → ${tokenPath}`);
// keep process alive
setInterval(() => {}, 1 << 30);
