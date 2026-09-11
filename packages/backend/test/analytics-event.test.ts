import { describe, expect, it } from "bun:test";

import { parseAnalyticsEventPayload } from "../convex/analytics_event";

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
});
