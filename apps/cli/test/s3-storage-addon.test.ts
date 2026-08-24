import { describe, expect, it } from "bun:test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createVirtual } from "../src/index";
import { add } from "../src/index";
import { collectFiles } from "./setup";
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
    expect(adapter).toContain("export type S3BucketEnv");
    expect(adapter).toContain("export function createS3BucketFromEnv");
    expect(adapter).toContain(
      "S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be provided together",
    );
    expect(adapter).toContain('error.name === "NoSuchKey"');
    expect(adapter).toContain("getS3ErrorStatusCode(error) === 404");
    expect(adapter).toContain("credentials?: {");
    expect(adapter).toContain("...(config.credentials ? { credentials: config.credentials } : {})");
    expect(adapter).toContain('requestChecksumCalculation: "WHEN_REQUIRED"');
    expect(adapter).toContain('responseChecksumValidation: "WHEN_REQUIRED"');
    expect(JSON.parse(packageJson).dependencies["@aws-sdk/client-s3"]).toBeDefined();
    expect(JSON.parse(packageJson).dependencies["@aws-sdk/s3-request-presigner"]).toBeDefined();
    expect(serverEnv).toContain("S3_BUCKET=");
    expect(serverEnv).toContain("S3_ENDPOINT=");
  });

  it("generates S3 env vars in the Convex backend env file", async () => {
    const result = await createVirtual({
      projectName: "convex-s3-storage-addon",
      frontend: ["tanstack-start"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "none",
      communication: "none",
      addons: ["s3-storage"],
      examples: ["none"],
      dbSetup: "none",
      api: "none",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const convexEnv = files.get("packages/backend/.env.local") ?? "";

    expect(files.has("packages/storage/src/bucket.ts")).toBe(true);
    expect(convexEnv).toContain("S3_BUCKET=");
    expect(convexEnv).toContain("S3_REGION=auto");
    expect(convexEnv).toContain("S3_ENDPOINT=");
    expect(convexEnv).toContain("S3_ACCESS_KEY_ID=");
    expect(convexEnv).toContain("S3_SECRET_ACCESS_KEY=");
  });

  it("adds S3 env vars without overwriting existing values", async () => {
    const result = await runTRPCTest({
      projectName: "s3-storage-add-later",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      api: "trpc",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
      git: false,
    });

    expectSuccess(result);
    const projectDir = result.projectDir;
    if (!projectDir) throw new Error("Expected generated project directory");

    const envPath = path.join(projectDir, "apps/server/.env");
    await writeFile(envPath, "DATABASE_URL=postgres://existing\n", "utf8");

    const addResult = await add({
      projectDir,
      addons: ["s3-storage"],
      install: false,
    });

    expect(addResult?.success).toBe(true);
    const serverEnv = await readFile(envPath, "utf8");
    expect(serverEnv).toContain("DATABASE_URL=postgres://existing");
    expect(serverEnv).toContain("S3_BUCKET=");
    expect(serverEnv).toContain("S3_REGION=auto");
    expect(serverEnv).toContain("S3_SECRET_ACCESS_KEY=");
  });
});
