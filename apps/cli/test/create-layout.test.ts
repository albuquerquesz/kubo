import { afterAll, describe, expect, it } from "bun:test";
import path from "node:path";

import fs from "fs-extra";

import { create } from "../src/index";
import { parseLayoutFlag } from "../src/utils/layout-input";

const SMOKE_DIR_PATH = path.join(import.meta.dir, "..", ".smoke", "create-layout");

afterAll(async () => {
  await fs.remove(SMOKE_DIR_PATH);
});

describe("parseLayoutFlag", () => {
  it("accepts preset names", () => {
    expect(parseLayoutFlag("libs").unwrap()).toEqual({ version: 1, preset: "libs" });
    expect(parseLayoutFlag(" standard ").unwrap()).toEqual({ version: 1, preset: "standard" });
  });

  it("accepts JSON layouts", () => {
    expect(parseLayoutFlag('{"preset":"libs","apps":{"web":"web"}}').unwrap()).toMatchObject({
      preset: "libs",
      apps: { web: "web" },
    });
  });

  it("rejects unknown presets, bad JSON and invalid paths", () => {
    expect(parseLayoutFlag("flat").isErr()).toBe(true);
    expect(parseLayoutFlag("{not json").isErr()).toBe(true);
    const invalid = parseLayoutFlag('{"apps":{"web":"../web"}}');
    expect(invalid.isErr()).toBe(true);
    if (invalid.isErr()) expect(invalid.error.message).toContain("apps.web");
  });
});

describe("create with a layout", () => {
  it("generates apps and packages in the layout folders and records the layout", async () => {
    const projectPath = path.join(SMOKE_DIR_PATH, "libs-layout");
    await fs.remove(projectPath);

    const result = await create(projectPath, {
      yes: true,
      install: false,
      git: false,
      disableAnalytics: true,
      directoryConflict: "overwrite",
      layout: { version: 1, preset: "libs", apps: { web: "web" } },
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    expect(await fs.pathExists(path.join(projectPath, "web/package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "apps/web"))).toBe(false);
    expect(await fs.pathExists(path.join(projectPath, "libs"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "packages"))).toBe(false);

    const rootPkg = await fs.readJson(path.join(projectPath, "package.json"));
    const workspaces: string[] = Array.isArray(rootPkg.workspaces)
      ? rootPkg.workspaces
      : rootPkg.workspaces.packages;
    expect(workspaces).toContain("libs/*");
    expect(workspaces).toContain("web");

    const kuboConfig = await fs.readFile(path.join(projectPath, "kubo.config.ts"), "utf8");
    expect(kuboConfig).toContain('"libs"');
    expect(kuboConfig).toContain('"web"');

    expect(result.value.reproducibleCommand).toContain(
      `--layout '{"preset":"libs","apps":{"web":"web"}}'`,
    );
  });

  it("fails before writing anything when the layout has conflicting folders", async () => {
    const projectPath = path.join(SMOKE_DIR_PATH, "conflicting-layout");
    await fs.remove(projectPath);

    const result = await create(projectPath, {
      yes: true,
      install: false,
      git: false,
      disableAnalytics: true,
      directoryConflict: "overwrite",
      layout: { version: 1, preset: "standard", apps: { web: "packages/ui" } },
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) return;
    expect(result.error.message).toContain("Layout path collision");
    expect(await fs.pathExists(projectPath)).toBe(false);
  });

  it("keeps the reproducible command unchanged for the standard layout", async () => {
    const result = await create(path.join(SMOKE_DIR_PATH, "standard-dry-run"), {
      yes: true,
      dryRun: true,
      disableAnalytics: true,
      directoryConflict: "overwrite",
      layout: { version: 1, preset: "standard" },
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) expect(result.value.reproducibleCommand).not.toContain("--layout");
  });
});
