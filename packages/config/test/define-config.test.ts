import { describe, expect, it } from "bun:test";

import { defineKuboConfig } from "../src/index";

describe("defineKuboConfig", () => {
  it("returns the config object unchanged", () => {
    const config = defineKuboConfig({
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
      layout: { preset: "standard" },
    });

    expect(config.layout?.preset).toBe("standard");
  });
});
