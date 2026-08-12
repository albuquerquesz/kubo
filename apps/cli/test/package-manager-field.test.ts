import { beforeEach, describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import fs from "fs-extra";

import { add, create } from "../src/index";
import { SMOKE_DIR } from "./setup";

describe("packageManager field", () => {
  beforeEach(() => {
    process.env.BTS_SKIP_EXTERNAL_COMMANDS = "1";
    process.env.BTS_TEST_MODE = "1";
  });

  it("pins a corepack-valid packageManager version after create", async () => {
    const projectPath = path.join(SMOKE_DIR, "package-manager-create");
    await fs.remove(projectPath);

    const result = await create(projectPath, {
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

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const pkgJson = JSON.parse(await readFile(path.join(projectPath, "package.json"), "utf8")) as {
      packageManager?: string;
    };

    expect(pkgJson.packageManager).toMatch(
      /^bun@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    );
    expect(pkgJson.packageManager).not.toContain("@latest");
  });

  it("does not rewrite packageManager to @latest when adding addons", async () => {
    const projectPath = path.join(SMOKE_DIR, "package-manager-add");
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

    const before = JSON.parse(await readFile(path.join(projectPath, "package.json"), "utf8")) as {
      packageManager?: string;
    };

    const addResult = await add({
      projectDir: projectPath,
      addons: ["biome"],
      install: false,
    });

    expect(addResult?.success).toBe(true);

    const after = JSON.parse(await readFile(path.join(projectPath, "package.json"), "utf8")) as {
      packageManager?: string;
    };

    expect(after.packageManager).toBe(before.packageManager);
    expect(after.packageManager).not.toContain("@latest");
  });
});
