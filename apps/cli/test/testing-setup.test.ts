import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expectSuccess, runTRPCTest } from "./test-utils";

describe("Vitest and Playwright testing category", () => {
  it("scaffolds vitest config, smoke test, and scripts", async () => {
    const result = await runTRPCTest({
      projectName: "vitest-scaffold",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      api: "trpc",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      addons: ["none"],
      testing: ["vitest"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
      git: false,
    });

    expectSuccess(result);
    const projectDir = result.projectDir!;
    const vitestConfig = await readFile(path.join(projectDir, "vitest.config.ts"), "utf8");
    const smokeTest = await readFile(path.join(projectDir, "smoke.test.ts"), "utf8");
    const packageJson = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));

    expect(vitestConfig).toContain("smoke.test.ts");
    expect(smokeTest).toContain('from "vitest"');
    expect(packageJson.scripts.test).toBe("vitest run");
    expect(packageJson.scripts["test:watch"]).toBe("vitest");
    expect(packageJson.devDependencies.vitest).toBeDefined();
  });

  it("scaffolds playwright config with web-only script for turborepo", async () => {
    const result = await runTRPCTest({
      projectName: "playwright-scaffold",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      api: "trpc",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      addons: ["turborepo"],
      testing: ["playwright"],
      examples: ["none"],
      dbSetup: "none",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
      git: false,
    });

    expectSuccess(result);
    const projectDir = result.projectDir!;
    const playwrightConfig = await readFile(path.join(projectDir, "playwright.config.ts"), "utf8");
    const exampleSpec = await readFile(path.join(projectDir, "e2e/example.spec.ts"), "utf8");
    const packageJson = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));

    expect(playwrightConfig).toContain('command: "bun run dev:web"');
    expect(playwrightConfig).toContain("http://localhost:3001");
    expect(exampleSpec).toContain("homepage loads");
    expect(packageJson.scripts["test:e2e"]).toBe("playwright test");
    expect(packageJson.devDependencies["@playwright/test"]).toBeDefined();
  });
});
