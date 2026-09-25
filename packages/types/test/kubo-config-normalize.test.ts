import { describe, expect, it } from "bun:test";

import { normalizeLegacyKuboConfig } from "../src/kubo-config-normalize";
import type { KubojsConfig } from "../src/types";

function minimalLegacyConfig(overrides: Partial<KubojsConfig> = {}): KubojsConfig {
  return {
    version: "0.1.1",
    createdAt: "2026-01-01T00:00:00.000Z",
    database: "none",
    orm: "none",
    backend: "hono",
    runtime: "bun",
    frontend: ["tanstack-router"],
    addons: [],
    examples: [],
    testing: [],
    auth: "none",
    payments: [],
    observability: [],
    communication: "none",
    packageManager: "bun",
    dbSetup: "none",
    api: "trpc",
    webDeploy: "none",
    serverDeploy: "none",
    ...overrides,
  };
}

describe("normalizeLegacyKuboConfig", () => {
  it("adds standard layout when layout is missing", () => {
    const normalized = normalizeLegacyKuboConfig(minimalLegacyConfig());
    expect(normalized.layout).toEqual({ preset: "standard" });
  });

  it("keeps explicit layout overrides", () => {
    const normalized = normalizeLegacyKuboConfig(
      minimalLegacyConfig({
        layout: { preset: "standard", apps: { web: "packages/client" } },
      }),
    );
    expect(normalized.layout?.apps?.web).toBe("packages/client");
    expect(normalized.layout?.preset).toBe("standard");
  });
});
