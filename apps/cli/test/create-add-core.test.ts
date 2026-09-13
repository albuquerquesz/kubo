import { describe, expect, it } from "bun:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { add } from "../src";
import { expectSuccess, runTRPCTest } from "./test-utils";

describe("Create Path and Add Path", () => {
  it("uses the shared addon catalog and preserves user files", async () => {
    const created = await runTRPCTest({
      projectName: "shared-addon-catalog",
      addons: ["none"],
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      api: "trpc",
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
    });

    expectSuccess(created);
    const projectDir = created.projectDir;
    if (!projectDir) throw new Error("Expected generated project directory");

    const userFilePath = join(projectDir, "apps/web/src/user-owned.ts");
    const binaryFilePath = join(projectDir, "apps/web/public/user-owned.bin");
    const userFileContent = "export const userOwned = true;\n";
    const binaryFileContent = Uint8Array.from([0, 255, 12, 128]);
    await mkdir(dirname(userFilePath), { recursive: true });
    await mkdir(dirname(binaryFilePath), { recursive: true });
    await writeFile(userFilePath, userFileContent, "utf8");
    await writeFile(binaryFilePath, binaryFileContent);

    const result = await add({
      projectDir,
      addons: ["s3-storage"],
      install: false,
    });

    expect(result?.success).toBe(true);
    expect(await readFile(userFilePath, "utf8")).toBe(userFileContent);
    expect(await readFile(binaryFilePath)).toEqual(binaryFileContent);

    const storagePackage = JSON.parse(
      await readFile(join(projectDir, "packages/storage/package.json"), "utf8"),
    );
    expect(storagePackage.dependencies["@aws-sdk/client-s3"]).toBeDefined();
    expect(await readFile(join(projectDir, "packages/storage/src/index.ts"), "utf8")).toContain(
      "export class S3Bucket",
    );
  });

  it("keeps dry-run side-effect free while applying the same addon catalog", async () => {
    const created = await runTRPCTest({
      projectName: "shared-addon-catalog-dry-run",
      addons: ["none"],
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      api: "trpc",
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
    });

    expectSuccess(created);
    const projectDir = created.projectDir;
    if (!projectDir) throw new Error("Expected generated project directory");

    const result = await add({
      projectDir,
      addons: ["s3-storage"],
      install: false,
      dryRun: true,
    });

    expect(result?.success).toBe(true);
    expect(result?.dryRun).toBe(true);
    expect(await Bun.file(join(projectDir, "packages/storage/package.json")).exists()).toBe(false);
  });
});
