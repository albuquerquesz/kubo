import { beforeEach, describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import fs from "fs-extra";

import { add, create } from "../src/index";
import { mergeAddonsExclusive } from "../src/utils/compatibility-rules";
import { SMOKE_DIR } from "./setup";

describe("scaffold quality fixes", () => {
  beforeEach(() => {
    process.env.BTS_SKIP_EXTERNAL_COMMANDS = "1";
    process.env.BTS_TEST_MODE = "1";
  });

  it("mergeAddonsExclusive replaces sibling linters", () => {
    const { updatedAddons, removedAddons } = mergeAddonsExclusive(
      ["turborepo", "biome"],
      ["oxlint"],
    );
    expect(updatedAddons).toEqual(["turborepo", "oxlint"]);
    expect(removedAddons).toEqual(["biome"]);
  });

  it("rejects create with dual biome+oxlint", async () => {
    const projectPath = path.join(SMOKE_DIR, "dual-linter-fail");
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
      addons: ["turborepo", "biome", "oxlint"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      packageManager: "bun",
      install: false,
      disableAnalytics: true,
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) return;
    expect(result.error.message).toMatch(/biome|oxlint|ultracite|code-quality/i);
  });

  it("scaffold: cookies, check-types, env path, sqlite scripts, biome indent", async () => {
    const projectPath = path.join(SMOKE_DIR, "scaffold-quality");
    await fs.remove(projectPath);

    const result = await create(projectPath, {
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "better-auth",
      payments: "none",
      api: "trpc",
      addons: ["turborepo", "biome"],
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

    // §2 auth cookies local-safe
    const authCandidates = [
      path.join(projectPath, "packages/auth/src/index.ts"),
      path.join(projectPath, "apps/server/src/auth/index.ts"),
      path.join(projectPath, "apps/server/src/lib/auth.ts"),
    ];
    let authContent = "";
    for (const candidate of authCandidates) {
      if (await fs.pathExists(candidate)) {
        authContent = await readFile(candidate, "utf8");
        break;
      }
    }
    expect(authContent.length).toBeGreaterThan(0);
    expect(authContent).toContain('sameSite: "lax"');
    expect(authContent).toContain('secure: process.env.NODE_ENV === "production"');
    expect(authContent).not.toContain('sameSite: "none"');

    // §5 check-types pure tsc
    const webPkg = JSON.parse(
      await readFile(path.join(projectPath, "apps/web/package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(webPkg.scripts?.["check-types"]).toBe("tsc --noEmit");
    expect(webPkg.scripts?.["check-types"]).not.toContain("vite build");

    // §4 env monorepo path
    const envServer = await readFile(path.join(projectPath, "packages/env/src/server.ts"), "utf8");
    expect(envServer).not.toContain('import "dotenv/config"');
    expect(envServer).toContain("apps/server/.env");
    expect(envServer).toContain("fileURLToPath");

    // §7 no turso CLI for db-setup none
    const rootPkg = JSON.parse(await readFile(path.join(projectPath, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(rootPkg.scripts?.["db:local"]).toBeUndefined();
    const dbPkg = JSON.parse(
      await readFile(path.join(projectPath, "packages/db/package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(dbPkg.scripts?.["db:local"]).toBeUndefined();

    // §1 biome spaces
    const biomeJson = JSON.parse(await readFile(path.join(projectPath, "biome.json"), "utf8")) as {
      formatter?: { indentStyle?: string };
    };
    expect(biomeJson.formatter?.indentStyle).toBe("space");

    // §6 kubojs.jsonrc header intact after create
    const kubojsConfig = await readFile(path.join(projectPath, "kubojs.jsonrc"), "utf8");
    expect(kubojsConfig).toContain("// kubojs");
    expect(kubojsConfig).toContain("$schema");

    // routeTree.gen.ts shipped for day-1 typecheck (not gitignored)
    expect(await fs.pathExists(path.join(projectPath, "apps/web/src/routeTree.gen.ts"))).toBe(true);
    const gitignore = await readFile(path.join(projectPath, ".gitignore"), "utf8");
    expect(gitignore).not.toContain("routeTree.gen.ts");
  });

  it("add oxlint replaces biome exclusively", async () => {
    const projectPath = path.join(SMOKE_DIR, "linter-switch");
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
      addons: ["turborepo", "biome"],
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

    const addResult = await add({
      projectDir: projectPath,
      addons: ["oxlint"],
      install: false,
    });
    expect(addResult?.success).toBe(true);

    const kubojsConfig = await readFile(path.join(projectPath, "kubojs.jsonrc"), "utf8");
    expect(kubojsConfig).toContain('"oxlint"');
    expect(kubojsConfig).not.toMatch(/"addons"\s*:\s*\[[^\]]*"biome"/);

    const pkg = JSON.parse(await readFile(path.join(projectPath, "package.json"), "utf8")) as {
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    expect(pkg.devDependencies?.["@biomejs/biome"]).toBeUndefined();
    expect(pkg.scripts?.check).toMatch(/oxlint/);

    // §6 header still present after add rewrite
    expect(kubojsConfig).toContain("// kubojs");
  });
});
