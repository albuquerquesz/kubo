import { describe, expect, it } from "bun:test";

import { parseAnalyticsEventPayload } from "../shared/analytics-event";

describe("parseAnalyticsEventPayload", () => {
  it("accepts CLI payloads and normalizes payment providers", () => {
    expect(
      parseAnalyticsEventPayload({
        database: "postgres",
        orm: "prisma",
        backend: "nestjs",
        runtime: "bun",
        frontend: [],
        addons: [],
        examples: [],
        auth: "better-auth",
        payments: ["stripe", "abacatepay"],
        git: false,
        packageManager: "bun",
        install: false,
        dbSetup: "none",
        api: "none",
        webDeploy: "none",
        serverDeploy: "none",
        cli_version: "0.1.1",
        node_version: "v22.0.0",
        platform: "linux",
      }),
    ).toMatchObject({ backend: "nestjs", payments: "stripe,abacatepay" });
  });

  it("rejects malformed, oversized, and unknown fields", () => {
    expect(parseAnalyticsEventPayload(null)).toBeNull();
    expect(parseAnalyticsEventPayload({ backend: 42 })).toBeNull();
    expect(parseAnalyticsEventPayload({ unknown: "field" })).toBeNull();
    expect(
      parseAnalyticsEventPayload({ frontend: Array.from({ length: 21 }, () => "next") }),
    ).toBeNull();
    expect(parseAnalyticsEventPayload({ backend: "x".repeat(129) })).toBeNull();
  });

  it("accepts audience and outcome fields", () => {
    expect(
      parseAnalyticsEventPayload({
        install_id: "6f1c2a4e-0000-4000-8000-000000000000",
        source: "mcp",
        mode: "flags",
        agent: "claude-code",
        ci: false,
        outcome: "failure",
        error_category: "ProjectCreationError",
        duration_ms: 1234.6,
      }),
    ).toEqual({
      install_id: "6f1c2a4e-0000-4000-8000-000000000000",
      source: "mcp",
      mode: "flags",
      agent: "claude-code",
      ci: false,
      outcome: "failure",
      error_category: "ProjectCreationError",
      duration_ms: 1235,
    });
  });

  it("rejects unknown outcomes and invalid durations", () => {
    expect(parseAnalyticsEventPayload({ outcome: "crashed" })).toBeNull();
    expect(parseAnalyticsEventPayload({ duration_ms: -1 })).toBeNull();
    expect(parseAnalyticsEventPayload({ duration_ms: "10" })).toBeNull();
    expect(parseAnalyticsEventPayload({ ci: "yes" })).toBeNull();
  });
});
