import { describe, expect, it } from "bun:test";
import path from "node:path";

import fs from "fs-extra";

import { loadProjectKuboConfig, readKubojsConfig } from "../src/utils/kubo-config";
import { SMOKE_DIR } from "./setup";

function minimalConfigPayload(overrides: Record<string, unknown> = {}) {
  return {
    version: "0.1.1",
    createdAt: "2026-01-01T00:00:00.000Z",
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
    packageManager: "bun",
    dbSetup: "none",
    api: "trpc",
    webDeploy: "none",
    serverDeploy: "none",
    ...overrides,
  };
}

function toTsModule(payload: Record<string, unknown>): string {
  return `export default ${JSON.stringify(payload, null, 2)};\n`;
}

describe("loadProjectKuboConfig", () => {
  it("loads a valid kubo.config.ts export", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-ts");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubo.config.ts"),
      toTsModule(minimalConfigPayload({ addons: ["biome"] })),
      "utf8",
    );

    const config = await loadProjectKuboConfig(projectDir);
    expect(config?.addons).toEqual(["biome"]);
    expect(config?.layout).toEqual({ preset: "standard" });
  });

  it("loads legacy kubojs.jsonrc when no TS config exists", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-jsonrc");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubojs.jsonrc"),
      JSON.stringify(minimalConfigPayload(), null, 2),
      "utf8",
    );

    const config = await readKubojsConfig(projectDir);
    expect(config?.frontend).toEqual(["tanstack-router"]);
    expect(config?.layout).toEqual({ preset: "standard" });
  });

  it("prefers kubo.config.ts over kubojs.jsonrc", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-priority");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubo.config.ts"),
      toTsModule(minimalConfigPayload({ addons: ["biome"] })),
      "utf8",
    );
    await fs.writeFile(
      path.join(projectDir, "kubojs.jsonrc"),
      JSON.stringify(minimalConfigPayload({ addons: ["oxlint"] }), null, 2),
      "utf8",
    );

    const config = await loadProjectKuboConfig(projectDir);
    expect(config?.addons).toEqual(["biome"]);
  });

  it("rejects kubo.config.ts with unknown keys", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-invalid");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubo.config.ts"),
      toTsModule({ ...minimalConfigPayload(), notARealField: true }),
      "utf8",
    );

    await expect(loadProjectKuboConfig(projectDir)).rejects.toThrow(/Invalid kubo\.config\.ts/);
  });
});
