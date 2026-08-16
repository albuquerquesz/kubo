import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expectSuccess, runTRPCTest } from "./test-utils";

describe("S3-compatible storage addon", () => {
  it("generates the bucket contract, S3 adapter, dependencies, and env vars", async () => {
    const result = await runTRPCTest({
      projectName: "s3-storage-addon",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      api: "trpc",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      addons: ["s3-storage"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
      git: false,
    });

    expectSuccess(result);

    const packageDir = path.join(result.projectDir!, "packages", "storage");
    const bucket = await readFile(path.join(packageDir, "src", "bucket.ts"), "utf8");
    const adapter = await readFile(path.join(packageDir, "src", "index.ts"), "utf8");
    const packageJson = await readFile(path.join(packageDir, "package.json"), "utf8");
    const serverEnv = await readFile(path.join(result.projectDir!, "apps/server/.env"), "utf8");

    expect(bucket).toContain("export abstract class Bucket");
    expect(bucket).toContain("abstract upload");
    expect(bucket).toContain("abstract getSignedUrl");
    expect(adapter).toContain("extends Bucket<GetObjectCommandOutput>");
    expect(JSON.parse(packageJson).dependencies["@aws-sdk/client-s3"]).toBeDefined();
    expect(JSON.parse(packageJson).dependencies["@aws-sdk/s3-request-presigner"]).toBeDefined();
    expect(serverEnv).toContain("S3_BUCKET=");
    expect(serverEnv).toContain("S3_ENDPOINT=");
  });
});
