import { afterAll, describe, expect, it } from "bun:test";
import path from "node:path";

import { CreateInputSchema, KuboConfigFileSchema } from "@kubojs/types";
import fs from "fs-extra";

import { create } from "../src/index";

const SMOKE_DIR_PATH = path.join(import.meta.dir, "..", ".smoke", "create-architecture");

afterAll(async () => {
  await fs.remove(SMOKE_DIR_PATH);
});

describe("create with an architecture", () => {
  it("reorganizes the API and web app and records the architecture", async () => {
    const projectPath = path.join(SMOKE_DIR_PATH, "clean");
    await fs.remove(projectPath);

    const result = await create(projectPath, {
      yes: true,
      install: false,
      git: false,
      disableAnalytics: true,
      directoryConflict: "overwrite",
      architecture: "clean",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const config = result.value.projectConfig;
    expect(config.architecture).toBe("clean");
    if (config.api === "trpc" || config.api === "orpc") {
      expect(await fs.pathExists(path.join(projectPath, "apps/api/src/presentation/routers"))).toBe(
        true,
      );
      expect(await fs.pathExists(path.join(projectPath, "apps/api/src/modules"))).toBe(false);
    }
    expect(
      await fs.pathExists(
        path.join(projectPath, "apps/web/src/presentation/components/header.tsx"),
      ),
    ).toBe(true);

    const kuboConfig = await fs.readFile(path.join(projectPath, "kubo.config.ts"), "utf8");
    expect(kuboConfig).toContain('"architecture": "clean"');
    const parsed = KuboConfigFileSchema.safeParse(
      JSON.parse(kuboConfig.replace(/^export default /, "").replace(/;\s*$/, "")),
    );
    expect(parsed.success).toBe(true);

    expect(result.value.reproducibleCommand).toContain("--architecture clean");
  });

  it("rejects unknown architectures", () => {
    expect(CreateInputSchema.safeParse({ architecture: "hexagonal" }).success).toBe(false);
    expect(CreateInputSchema.safeParse({ architecture: "layered" }).success).toBe(true);
  });
});
