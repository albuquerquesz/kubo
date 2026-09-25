import { describe, expect, it } from "bun:test";

import type { KuboConfig, ProjectConfig } from "@kubojs/types";

import { buildKuboConfigFromProject, serializeKuboConfigFile } from "../src/kubo-config-serializer";

function minimalProjectConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectName: "demo",
    projectDir: "/tmp/demo",
    relativePath: ".",
    database: "none",
    orm: "none",
    backend: "hono",
    runtime: "bun",
    frontend: ["tanstack-router"],
    addons: ["turborepo"],
    examples: [],
    testing: [],
    auth: "none",
    payments: [],
    observability: [],
    communication: "none",
    git: false,
    packageManager: "bun",
    install: false,
    dbSetup: "none",
    api: "trpc",
    webDeploy: "none",
    serverDeploy: "none",
    ...overrides,
  };
}

function minimalKuboConfig(overrides: Partial<KuboConfig> = {}): KuboConfig {
  return {
    version: "0.1.1",
    createdAt: "2026-01-01T00:00:00.000Z",
    layout: { preset: "standard" },
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

describe("serializeKuboConfigFile", () => {
  it("emits a minimal export default object", () => {
    const content = serializeKuboConfigFile(minimalKuboConfig());
    expect(content).toMatch(/^export default \{/);
    expect(content.trimEnd()).toMatch(/\};\s*$/);
  });

  it("strips reproducibleCommand from persisted output", () => {
    const content = serializeKuboConfigFile(
      minimalKuboConfig({
        reproducibleCommand: "bun create kubojs@latest demo --yes",
      }),
    );
    expect(content).not.toContain("reproducibleCommand");
  });
});

describe("buildKuboConfigFromProject", () => {
  it("defaults layout to standard preset", () => {
    const kuboConfig = buildKuboConfigFromProject(minimalProjectConfig(), "0.1.1");
    expect(kuboConfig.layout).toEqual({ preset: "standard" });
  });

  it("preserves explicit layout from project config", () => {
    const kuboConfig = buildKuboConfigFromProject(
      minimalProjectConfig({
        layout: { preset: "standard", apps: { web: "packages/client" } },
      }),
      "0.1.1",
    );
    expect(kuboConfig.layout?.apps?.web).toBe("packages/client");
  });
});
