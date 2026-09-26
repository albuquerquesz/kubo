import { beforeEach, describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { serializeKuboConfigFile } from "@kubojs/template-generator";
import { KuboConfigFileSchema } from "@kubojs/types";
import fs from "fs-extra";

import { add, create } from "../src/index";
import { loadProjectKuboConfig } from "../src/utils/kubo-config";
import { SMOKE_DIR } from "./setup";

const minimalCreateOptions = {
  frontend: ["tanstack-router"] as const,
  backend: "hono" as const,
  runtime: "bun" as const,
  database: "none" as const,
  orm: "none" as const,
  auth: "none" as const,
  payments: "none" as const,
  api: "trpc" as const,
  addons: ["turborepo"] as const,
  examples: ["none"] as const,
  dbSetup: "none" as const,
  webDeploy: "none" as const,
  serverDeploy: "none" as const,
  packageManager: "bun" as const,
  install: false,
  disableAnalytics: true,
};

describe("kubo.config.ts contract", () => {
  beforeEach(() => {
    process.env.BTS_SKIP_EXTERNAL_COMMANDS = "1";
    process.env.BTS_TEST_MODE = "1";
  });

  it("create output reloads and passes KuboConfigFileSchema", async () => {
    const projectPath = path.join(SMOKE_DIR, "kubo-config-contract-create");
    await fs.remove(projectPath);

    const createResult = await create(projectPath, minimalCreateOptions);
    expect(createResult.isOk()).toBe(true);
    if (createResult.isErr()) return;

    const onDisk = await readFile(path.join(projectPath, "kubo.config.ts"), "utf8");
    expect(onDisk).not.toContain("reproducibleCommand");
    expect(await fs.pathExists(path.join(projectPath, "kubojs.jsonrc"))).toBe(false);

    const loadedResult = await loadProjectKuboConfig(projectPath);
    expect(loadedResult.isOk()).toBe(true);
    if (loadedResult.isErr()) return;
    expect(loadedResult.value).not.toBeNull();
    const parsed = KuboConfigFileSchema.parse(loadedResult.value);
    expect(parsed.backend).toBe("hono");
    expect(parsed.addons).toEqual(["turborepo"]);
    expect(parsed.layout?.preset).toBe("standard");
  });

  it("add persists addons readable via loadProjectKuboConfig", async () => {
    const projectPath = path.join(SMOKE_DIR, "kubo-config-contract-add");
    await fs.remove(projectPath);

    const createResult = await create(projectPath, minimalCreateOptions);
    expect(createResult.isOk()).toBe(true);
    if (createResult.isErr()) return;

    const addResult = await add({
      projectDir: projectPath,
      addons: ["biome"],
      install: false,
    });
    expect(addResult?.success).toBe(true);

    const loadedResult = await loadProjectKuboConfig(projectPath);
    expect(loadedResult.isOk()).toBe(true);
    if (loadedResult.isErr()) return;
    expect(loadedResult.value?.addons).toEqual(["turborepo", "biome"]);
  });

  it("add surfaces invalid kubo.config.ts instead of missing-project message", async () => {
    const projectDir = path.join(SMOKE_DIR, "kubo-config-contract-invalid-add");
    await fs.remove(projectDir);
    await fs.ensureDir(projectDir);
    await fs.writeFile(
      path.join(projectDir, "kubo.config.ts"),
      `export default ${JSON.stringify(
        {
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
          notARealField: true,
        },
        null,
        2,
      )};\n`,
      "utf8",
    );

    const addResult = await add({
      projectDir,
      addons: ["biome"],
      install: false,
    });

    expect(addResult?.success).toBe(false);
    expect(addResult?.error).toContain("Invalid kubo.config.ts");
    expect(addResult?.error).not.toContain("No kubojs project found");
  });

  it("serializeKuboConfigFile round-trips without reproducibleCommand", async () => {
    const projectPath = path.join(SMOKE_DIR, "kubo-config-contract-serialize");
    await fs.remove(projectPath);

    const createResult = await create(projectPath, minimalCreateOptions);
    expect(createResult.isOk()).toBe(true);
    if (createResult.isErr()) return;

    const sourceResult = await loadProjectKuboConfig(projectPath);
    expect(sourceResult.isOk()).toBe(true);
    if (sourceResult.isErr()) return;
    const source = sourceResult.value;
    expect(source).not.toBeNull();
    if (!source) return;

    const withCommand = { ...source, reproducibleCommand: "bun create kubojs@latest x" };
    await fs.writeFile(
      path.join(projectPath, "kubo.config.ts"),
      serializeKuboConfigFile(withCommand),
      "utf8",
    );

    const reloadedResult = await loadProjectKuboConfig(projectPath);
    expect(reloadedResult.isOk()).toBe(true);
    if (reloadedResult.isErr()) return;
    const parsed = KuboConfigFileSchema.parse(reloadedResult.value);
    expect(parsed.addons).toEqual(source.addons);
    expect("reproducibleCommand" in parsed).toBe(false);
  });
});
