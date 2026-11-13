type Env = Record<string, string | undefined>;

const TRUTHY = new Set(["1", "true", "yes"]);

function isTruthy(value: string | undefined): boolean {
  return value !== undefined && TRUTHY.has(value.toLowerCase());
}

/**
 * Returns true if telemetry/analytics should be enabled, false otherwise.
 *
 * Opt-out, checked in order:
 * - `KUBO_TELEMETRY_DISABLED=1` disables.
 * - `DO_NOT_TRACK=1` disables (https://consoledonottrack.com).
 * - Legacy `BTS_TELEMETRY_DISABLED=1` disables; legacy `BTS_TELEMETRY=0` disables.
 * - Otherwise enabled.
 */
export function isTelemetryEnabled(env: Env = process.env): boolean {
  if (isTruthy(env.KUBO_TELEMETRY_DISABLED)) return false;
  if (isTruthy(env.DO_NOT_TRACK)) return false;

  if (env.BTS_TELEMETRY_DISABLED !== undefined) {
    return env.BTS_TELEMETRY_DISABLED !== "1";
  }
  if (env.BTS_TELEMETRY !== undefined) {
    return env.BTS_TELEMETRY === "1";
  }
  return true;
}

/** Coding agents we can recognize from the environment they set for child processes. */
const AGENT_ENV_MARKERS: ReadonlyArray<readonly [agent: string, envVar: string]> = [
  ["claude-code", "CLAUDECODE"],
  ["cursor", "CURSOR_AGENT"],
  ["cursor", "CURSOR_TRACE_ID"],
  ["codex", "CODEX_SANDBOX"],
  ["codex", "CODEX_MANAGED_BY_NPM"],
  ["gemini-cli", "GEMINI_CLI"],
  ["opencode", "OPENCODE"],
  ["amp", "AMP_CURRENT_THREAD_ID"],
  ["cline", "CLINE_ACTIVE"],
  ["replit", "REPL_ID"],
];

export function detectAgent(env: Env = process.env): string | undefined {
  const match = AGENT_ENV_MARKERS.find(([, envVar]) => Boolean(env[envVar]));
  if (match) return match[0];
  return env.AI_AGENT ? "other" : undefined;
}

export function isCI(env: Env = process.env): boolean {
  return (
    isTruthy(env.CI) ||
    Boolean(env.GITHUB_ACTIONS || env.GITLAB_CI || env.BUILDKITE || env.CIRCLECI)
  );
}
