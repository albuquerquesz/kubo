import { describe, expect, it } from "bun:test";
import path from "node:path";

import { serializeKuboConfigFile } from "@kubojs/template-generator";
import fs from "fs-extra";

import { add, create } from "../src/index";
import { loadProjectKuboConfig } from "../src/utils/kubo-config";
import { SMOKE_DIR } from "./setup";

describe("layout-aware add", () => {
  it("writes PWA files to a custom web app path from kubo.config.ts", async () => {
    const projectPath = path.join(SMOKE_DIR, "layout-custom-web");
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

    await fs.move(path.join(projectPath, "apps/web"), path.join(projectPath, "packages/client"));

    const loadedResult = await loadProjectKuboConfig(projectPath);
    expect(loadedResult.isOk()).toBe(true);
    if (loadedResult.isErr()) return;
    const loaded = loadedResult.value;
    expect(loaded).not.toBeNull();
    if (!loaded) return;

    const updated = {
      ...loaded,
      layout: {
        preset: "standard" as const,
        apps: { web: "packages/client" },
      },
    };
    await fs.writeFile(
      path.join(projectPath, "kubo.config.ts"),
      serializeKuboConfigFile(updated),
      "utf8",
    );

    const addResult = await add({
      projectDir: projectPath,
      addons: ["pwa"],
      install: false,
    });

    expect(addResult?.success).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "packages/client/vite.config.ts"))).toBe(
      true,
    );
  });
});
