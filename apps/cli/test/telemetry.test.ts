import { describe, expect, it } from "bun:test";

import { detectAgent, isCI, isTelemetryEnabled } from "../src/utils/telemetry";

describe("isTelemetryEnabled", () => {
  it("is enabled by default", () => {
    expect(isTelemetryEnabled({})).toBe(true);
  });

  it("honors KUBO_TELEMETRY_DISABLED and DO_NOT_TRACK", () => {
    expect(isTelemetryEnabled({ KUBO_TELEMETRY_DISABLED: "1" })).toBe(false);
    expect(isTelemetryEnabled({ KUBO_TELEMETRY_DISABLED: "true" })).toBe(false);
    expect(isTelemetryEnabled({ DO_NOT_TRACK: "1" })).toBe(false);
    expect(isTelemetryEnabled({ DO_NOT_TRACK: "0" })).toBe(true);
  });

  it("keeps the legacy BTS_* variables working", () => {
    expect(isTelemetryEnabled({ BTS_TELEMETRY_DISABLED: "1" })).toBe(false);
    expect(isTelemetryEnabled({ BTS_TELEMETRY: "0" })).toBe(false);
    expect(isTelemetryEnabled({ BTS_TELEMETRY: "1" })).toBe(true);
  });
});

describe("detectAgent", () => {
  it("recognizes coding agents from their environment markers", () => {
    expect(detectAgent({ CLAUDECODE: "1" })).toBe("claude-code");
    expect(detectAgent({ CURSOR_TRACE_ID: "abc" })).toBe("cursor");
    expect(detectAgent({ CODEX_SANDBOX: "seatbelt" })).toBe("codex");
    expect(detectAgent({ AI_AGENT: "something" })).toBe("other");
    expect(detectAgent({})).toBeUndefined();
  });
});

describe("isCI", () => {
  it("detects common CI providers", () => {
    expect(isCI({ CI: "true" })).toBe(true);
    expect(isCI({ GITHUB_ACTIONS: "true" })).toBe(true);
    expect(isCI({})).toBe(false);
  });
});
