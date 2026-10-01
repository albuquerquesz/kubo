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
    communication: [],
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

    const result = await loadProjectKuboConfig(projectDir);
    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    expect(result.value?.addons).toEqual(["biome"]);
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

    const result = await readKubojsConfig(projectDir);
    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    expect(result.value?.frontend).toEqual(["tanstack-router"]);
    expect(result.value?.layout).toEqual({ preset: "standard" });
  });

  it("coerces legacy communication string values when loading kubojs.jsonrc", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-legacy-comm");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubojs.jsonrc"),
      JSON.stringify(minimalConfigPayload({ communication: "none" }), null, 2),
      "utf8",
    );

    const noneResult = await readKubojsConfig(projectDir);
    expect(noneResult.isOk()).toBe(true);
    if (noneResult.isErr()) return;
    expect(noneResult.value?.communication).toEqual([]);

    await fs.writeFile(
      path.join(projectDir, "kubojs.jsonrc"),
      JSON.stringify(minimalConfigPayload({ communication: "resend" }), null, 2),
      "utf8",
    );

    const resendResult = await readKubojsConfig(projectDir);
    expect(resendResult.isOk()).toBe(true);
    if (resendResult.isErr()) return;
    expect(resendResult.value?.communication).toEqual(["resend"]);
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

    const result = await loadProjectKuboConfig(projectDir);
    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    expect(result.value?.addons).toEqual(["biome"]);
  });

  it("returns err for kubo.config.ts with unknown keys", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-invalid");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubo.config.ts"),
      toTsModule({ ...minimalConfigPayload(), notARealField: true }),
      "utf8",
    );

    const result = await loadProjectKuboConfig(projectDir);
    expect(result.isErr()).toBe(true);
    if (result.isOk()) return;
    expect(result.error.message).toContain("Invalid kubo.config.ts");
  });

  it("returns ok(null) when no config file exists", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-loader-empty");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);

    const result = await loadProjectKuboConfig(projectDir);
    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    expect(result.value).toBeNull();
  });
});
