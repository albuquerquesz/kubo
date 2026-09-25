import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import fs from "fs-extra";

import { add, create } from "../src/index";
import { SMOKE_DIR } from "./setup";

describe("layout drift blocks add", () => {
  it("fails before mutating kubo.config.ts when layout paths are missing", async () => {
    const projectPath = path.join(SMOKE_DIR, "layout-add-failure");
    await fs.remove(projectPath);

    const createResult = await create(projectPath, {
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      api: "trpc",
      addons: ["turborepo"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      packageManager: "bun",
      install: false,
      disableAnalytics: true,
    });
    expect(createResult.isOk()).toBe(true);
    if (createResult.isErr()) return;

    const configPath = path.join(projectPath, "kubo.config.ts");
    const beforeConfig = await readFile(configPath, "utf8");

    await fs.move(path.join(projectPath, "apps/web"), path.join(projectPath, "_moved-web"));

    const addResult = await add({
      projectDir: projectPath,
      addons: ["biome"],
      install: false,
    });

    expect(addResult?.success).toBe(false);
    expect(addResult?.error).toContain("kubo.config.ts");
    expect(addResult?.error).toContain("apps/web");

    const afterConfig = await readFile(configPath, "utf8");
    expect(afterConfig).toBe(beforeConfig);
    expect(afterConfig).not.toContain('"biome"');
  });
});
