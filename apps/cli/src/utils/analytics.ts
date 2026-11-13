import { randomUUID } from "node:crypto";
import path from "node:path";

import { log } from "@clack/prompts";
import { Result } from "better-result";
import envPaths from "env-paths";
import fs from "fs-extra";
import pc from "picocolors";

import type { ProjectConfig } from "../types";
import { isSilent } from "./context";
import { getLatestCLIVersion } from "./get-latest-cli-version";
import { detectAgent, isCI, isTelemetryEnabled } from "./telemetry";

const CONVEX_INGEST_URL = process.env.CONVEX_INGEST_URL;
const SEND_TIMEOUT_MS = 2000;
const TELEMETRY_FILE = "telemetry.json";
const TELEMETRY_DOCS_URL = "https://kubojs.dev/docs/analytics";

/** How the CLI was invoked: terminal, JSON API (`create-json`), MCP server, or the JS API. */
export type TelemetrySource = "cli" | "json" | "mcp" | "api";
/** How the stack was chosen. */
export type TelemetryMode = "interactive" | "flags" | "yes" | "template";
export type TelemetryOutcome = "success" | "failure" | "cancelled";

let telemetrySource: TelemetrySource = "cli";

/** Set once per process by entry points that are not the interactive terminal (e.g. MCP). */
export function setTelemetrySource(source: TelemetrySource): void {
  telemetrySource = source;
}

/** The JS API (`create()`) reports as "api" unless an entry point (e.g. MCP) already set a source. */
export function markProgrammaticTelemetrySource(): void {
  if (telemetrySource === "cli") telemetrySource = "api";
}

type TelemetryState = { installId: string; noticeShown: boolean };

function getTelemetryFilePath(): string {
  return path.join(envPaths("kubojs", { suffix: "" }).config, TELEMETRY_FILE);
}

function isTelemetryState(value: unknown): value is TelemetryState {
  return (
    typeof value === "object" &&
    value !== null &&
    "installId" in value &&
    typeof value.installId === "string" &&
    "noticeShown" in value &&
    typeof value.noticeShown === "boolean"
  );
}

/**
 * Reads the anonymous install id (a random UUID, not derived from the machine or user),
 * creating it on first use. Returns undefined if the config dir is not writable.
 */
async function loadTelemetryState(): Promise<TelemetryState | undefined> {
  const filePath = getTelemetryFilePath();
  const existing = await Result.tryPromise({
    try: async (): Promise<unknown> => fs.readJson(filePath),
    catch: () => undefined,
  });
  if (existing.isOk() && isTelemetryState(existing.value)) {
    return existing.value;
  }

  const state: TelemetryState = { installId: randomUUID(), noticeShown: false };
  const written = await Result.tryPromise({
    try: async () => {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, state, { spaces: 2 });
    },
    catch: () => undefined,
  });
  return written.isOk() ? state : undefined;
}

async function markNoticeShown(state: TelemetryState): Promise<void> {
  await Result.tryPromise({
    try: () => fs.writeJson(getTelemetryFilePath(), { ...state, noticeShown: true }, { spaces: 2 }),
    catch: () => undefined,
  });
}

function showTelemetryNotice(): void {
  log.info(
    pc.dim(
      `kubojs collects anonymous usage data (stack choices, CLI version, OS) to guide development.\n` +
        `No project names, paths or personal data. Opt out with KUBO_TELEMETRY_DISABLED=1.\n` +
        `Details: ${TELEMETRY_DOCS_URL}`,
    ),
  );
}

async function sendConvexEvent(payload: Record<string, unknown>): Promise<void> {
  if (!CONVEX_INGEST_URL) return;

  await Result.tryPromise({
    try: () =>
      fetch(CONVEX_INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      }),
    catch: () => undefined, // Silent failure
  });
}

function getStackPayload(config: ProjectConfig) {
  return {
    database: config.database,
    orm: config.orm,
    backend: config.backend,
    runtime: config.runtime,
    frontend: config.frontend,
    addons: config.addons,
    examples: config.examples,
    auth: config.auth,
    payments: config.payments,
    git: config.git,
    packageManager: config.packageManager,
    install: config.install,
    dbSetup: config.dbSetup,
    api: config.api,
    webDeploy: config.webDeploy,
    serverDeploy: config.serverDeploy,
  };
}

export type CreateTelemetryEvent = {
  outcome: TelemetryOutcome;
  mode: TelemetryMode;
  durationMs: number;
  /** Present when the stack was resolved (always on success). */
  config?: ProjectConfig;
  /** Error class name on failure (e.g. `ProjectCreationError`), never the message. */
  errorCategory?: string;
};

export async function trackCreateEvent(
  event: CreateTelemetryEvent,
  disableAnalytics = false,
): Promise<void> {
  if (!CONVEX_INGEST_URL || !isTelemetryEnabled() || disableAnalytics) return;

  const state = await loadTelemetryState();
  if (state && !state.noticeShown && !isSilent()) {
    showTelemetryNotice();
    await markNoticeShown(state);
  }

  await sendConvexEvent({
    ...(event.config ? getStackPayload(event.config) : {}),
    install_id: state?.installId,
    source: telemetrySource,
    mode: event.mode,
    agent: detectAgent(),
    ci: isCI(),
    outcome: event.outcome,
    error_category: event.errorCategory,
    duration_ms: event.durationMs,
    cli_version: getLatestCLIVersion(),
    node_version: process.version,
    platform: process.platform,
  });
}
