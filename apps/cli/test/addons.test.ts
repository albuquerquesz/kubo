import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { add, type Addons, type Frontend } from "../src";
import { getCompatibleAddons } from "../src/utils/compatibility-rules";
import { expectError, expectSuccess, runTRPCTest, type TestConfig } from "./test-utils";

describe("Addon Configurations", () => {
  describe("Frontend-Specific Addons", () => {
    describe("PWA Addon", () => {
      const pwaCompatibleFrontends = ["tanstack-router", "react-router", "solid", "next"];

      for (const frontend of pwaCompatibleFrontends) {
        it(`should work with PWA + ${frontend}`, async () => {
          const config: TestConfig = {
            projectName: `pwa-${frontend}`,
            addons: ["pwa"],
            frontend: [frontend as Frontend],
            backend: "hono",
            runtime: "bun",
            database: "sqlite",
            orm: "drizzle",
            auth: "none",
            examples: ["none"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            install: false,
          };

          // Handle special frontend requirements
          if (frontend === "solid") {
            config.api = "orpc"; // tRPC not supported with solid
          } else {
            config.api = "trpc";
          }

          const result = await runTRPCTest(config);
          expectSuccess(result);
        });
      }

      const pwaIncompatibleFrontends = [
        "nuxt",
        "svelte",
        "native-bare",
        "native-uniwind",
        "native-unistyles",
      ];

      for (const frontend of pwaIncompatibleFrontends) {
        it(`should fail with PWA + ${frontend}`, async () => {
          const config: TestConfig = {
            projectName: `pwa-${frontend}-fail`,
            addons: ["pwa"],
            frontend: [frontend as Frontend],
            backend: "hono",
            runtime: "bun",
            database: "sqlite",
            orm: "drizzle",
            auth: "none",
            examples: ["none"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            expectError: true,
          };

          if (["nuxt", "svelte"].includes(frontend)) {
            config.api = "orpc";
          } else {
            config.api = "trpc";
          }

          const result = await runTRPCTest(config);
          expectError(
            result,
            "pwa addon requires one of these frontends: tanstack-router, react-router, solid, next",
          );
        });
      }
    });

    describe("Tauri Addon", () => {
      const tauriCompatibleFrontends = [
        "tanstack-router",
        "react-router",
        "tanstack-start",
        "next",
        "nuxt",
        "svelte",
        "solid",
        "astro",
      ];

      for (const frontend of tauriCompatibleFrontends) {
        it(`should work with Tauri + ${frontend}`, async () => {
          const config: TestConfig = {
            projectName: `tauri-${frontend}`,
            addons: ["tauri"],
            frontend: [frontend as Frontend],
            backend: "hono",
            runtime: "bun",
            database: "sqlite",
            orm: "drizzle",
            auth: "none",
            examples: ["none"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            install: false,
          };

          if (["nuxt", "svelte", "solid", "astro"].includes(frontend)) {
            config.api = "orpc";
          } else {
            config.api = "trpc";
          }

          const result = await runTRPCTest(config);
          expectSuccess(result);
        });
      }

      const tauriIncompatibleFrontends = ["native-bare", "native-uniwind", "native-unistyles"];

      for (const frontend of tauriIncompatibleFrontends) {
        it(`should fail with Tauri + ${frontend}`, async () => {
          const result = await runTRPCTest({
            projectName: `tauri-${frontend}-fail`,
            addons: ["tauri"],
            frontend: [frontend as Frontend],
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
            expectError: true,
          });

          expectError(result, "tauri addon requires one of these frontends");
        });
      }

      it("should fail with Tauri + backend self", async () => {
        const result = await runTRPCTest({
          projectName: "tauri-self-backend-fail",
          addons: ["tauri"],
          frontend: ["next"],
          backend: "self",
          runtime: "none",
          database: "none",
          orm: "none",
          auth: "none",
          api: "orpc",
          examples: ["ai"],
          dbSetup: "none",
          webDeploy: "none",
          serverDeploy: "none",
          expectError: true,
        });

        expectError(result, "tauri addon requires a separate backend or no backend");
      });

      for (const frontend of ["next", "tanstack-start"] as const) {
        it(`should fail with Tauri + Convex Better Auth + ${frontend}`, async () => {
          const result = await runTRPCTest({
            projectName: `tauri-convex-better-auth-${frontend}-fail`,
            addons: ["tauri"],
            frontend: [frontend],
            backend: "convex",
            runtime: "none",
            database: "none",
            orm: "none",
            auth: "better-auth",
            api: "none",
            examples: ["ai"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            expectError: true,
          });

          expectError(result, "server auth bootstrap");
        });
      }
    });

    describe("Electrobun Addon", () => {
      const electrobunCompatibleFrontends = [
        "tanstack-router",
        "react-router",
        "tanstack-start",
        "next",
        "nuxt",
        "svelte",
        "solid",
        "astro",
      ];

      for (const frontend of electrobunCompatibleFrontends) {
        it(`should work with Electrobun + ${frontend}`, async () => {
          const config: TestConfig = {
            projectName: `electrobun-${frontend}`,
            addons: ["electrobun"],
            frontend: [frontend as Frontend],
            backend: "hono",
            runtime: "bun",
            database: "sqlite",
            orm: "drizzle",
            auth: "none",
            examples: ["none"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            install: false,
          };

          config.api = ["nuxt", "svelte", "solid", "astro"].includes(frontend) ? "orpc" : "trpc";

          const result = await runTRPCTest(config);
          expectSuccess(result);
        });
      }

      const electrobunIncompatibleFrontends = ["native-bare", "native-uniwind", "native-unistyles"];

      for (const frontend of electrobunIncompatibleFrontends) {
        it(`should fail with Electrobun + ${frontend}`, async () => {
          const config: TestConfig = {
            projectName: `electrobun-${frontend}-fail`,
            addons: ["electrobun"],
            frontend: [frontend as Frontend],
            backend: "hono",
            runtime: "bun",
            database: "sqlite",
            orm: "drizzle",
            auth: "none",
            examples: ["none"],
            dbSetup: "none",
            webDeploy: "none",
            serverDeploy: "none",
            expectError: true,
          };

          config.api = "trpc";

          const result = await runTRPCTest(config);
          expectError(result, "electrobun addon requires one of these frontends");
        });
      }

      it("should fail with Electrobun + backend self", async () => {
        const result = await runTRPCTest({
          projectName: "electrobun-self-backend-fail",
          addons: ["electrobun"],
          frontend: ["next"],
          backend: "self",
          runtime: "none",
          database: "none",
          orm: "none",
          auth: "none",
          api: "orpc",
          examples: ["ai"],
          dbSetup: "none",
          webDeploy: "none",
          serverDeploy: "none",
          expectError: true,
        });

        expectError(result, "electrobun addon requires a separate backend or no backend");
      });

      it("should work with Electrobun + Convex Better Auth + Next.js for desktop HMR", async () => {
        const result = await runTRPCTest({
          projectName: "electrobun-convex-better-auth-next",
          addons: ["turborepo", "electrobun"],
          frontend: ["next"],
          backend: "convex",
          runtime: "none",
          database: "none",
          orm: "none",
          auth: "better-auth",
          api: "none",
          examples: ["ai"],
          dbSetup: "none",
          webDeploy: "none",
          serverDeploy: "none",
          install: false,
        });

        expectSuccess(result);
        expect(result.projectDir).toBeDefined();
        if (!result.projectDir) return;

        const rootPackageJson = JSON.parse(
          await readFile(join(result.projectDir, "package.json"), "utf8"),
        );
        const nextConfig = await readFile(
          join(result.projectDir, "apps", "web", "next.config.ts"),
          "utf8",
        );

        expect(rootPackageJson.scripts["dev:desktop"]).toBe("turbo run dev:hmr -F desktop");
        expect(nextConfig).not.toContain('output: "export"');
      });
    });
  });

  describe("Standalone Addons", () => {
    // smoke coverage for addons that have no dedicated content tests
    for (const addon of ["oxlint", "lefthook", "mcp"] as const) {
      it(`should work with ${addon} addon`, async () => {
        const result = await runTRPCTest({
          projectName: `${addon}-standalone`,
          addons: [addon],
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

        expectSuccess(result);
      });
    }
  });

  describe("Multiple Addons", () => {
    it("should work with multiple compatible addons", async () => {
      const result = await runTRPCTest({
        projectName: "multiple-addons",
        addons: ["biome", "husky", "turborepo", "pwa"],
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

      expectSuccess(result);
    });

    it("should work with lefthook and husky together", async () => {
      const result = await runTRPCTest({
        projectName: "both-git-hooks",
        addons: ["lefthook", "husky"],
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

      expectSuccess(result);
    });

    it("should fail with incompatible addon combination", async () => {
      const result = await runTRPCTest({
        projectName: "incompatible-addons-fail",
        addons: ["pwa"], // PWA not compatible with nuxt
        frontend: ["nuxt"],
        backend: "hono",
        runtime: "bun",
        database: "sqlite",
        orm: "drizzle",
        auth: "none",
        api: "orpc",
        examples: ["none"],
        dbSetup: "none",
        webDeploy: "none",
        serverDeploy: "none",
        expectError: true,
      });

      expectError(result, "pwa addon requires one of these frontends");
    });

    it("should fail when task runners are combined", async () => {
      const result = await runTRPCTest({
        projectName: "monorepo-addon-conflict",
        addons: ["turborepo", "vite-plus"],
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
        expectError: true,
      });

      expectError(
        result,
        "Cannot combine 'turborepo' and 'vite-plus' addons. Choose one task runner.",
      );
    });

    it("should hide task runner addons when one is already installed", () => {
      const compatibleAddons = getCompatibleAddons(
        ["turborepo", "vite-plus", "biome"] as Addons[],
        ["tanstack-router"] as Frontend[],
        ["turborepo"] as Addons[],
      );

      expect(compatibleAddons).not.toContain("vite-plus");
      expect(compatibleAddons).toContain("biome");
    });

    it("should wire Vite+ addon scripts, deps, overrides, and config imports", async () => {
      const result = await runTRPCTest({
        projectName: "vite-plus-addon",
        addons: ["vite-plus"],
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

      expectSuccess(result);
      const projectDir = result.projectDir;
      expect(projectDir).toBeDefined();

      const rootPackageJson = JSON.parse(await readFile(join(projectDir!, "package.json"), "utf8"));
      const webPackageJson = JSON.parse(
        await readFile(join(projectDir!, "apps/web/package.json"), "utf8"),
      );
      const webViteConfig = await readFile(join(projectDir!, "apps/web/vite.config.ts"), "utf8");

      expect(rootPackageJson.devDependencies["vite-plus"]).toBe("0.2.2");
      expect(rootPackageJson.devDependencies.rolldown).toBe("1.1.4");
      expect(rootPackageJson.overrides).toMatchObject({
        vite: "npm:@voidzero-dev/vite-plus-core@0.2.2",
      });
      expect(rootPackageJson.overrides.vitest).toBeUndefined();
      expect(rootPackageJson.scripts.dev).toBe("vp run -r dev");
      expect(rootPackageJson.scripts.build).toBe("vp run -r build");
      expect(rootPackageJson.scripts["check-types"]).toBe("vp run -r check-types");
      expect(rootPackageJson.scripts.check).toBe("vp check && vp run -r check-types");
      expect(rootPackageJson.scripts.lint).toBe("vp lint");
      expect(rootPackageJson.scripts.format).toBe("vp fmt");
      expect(rootPackageJson.scripts.staged).toBe("vp staged");
      expect(rootPackageJson.scripts["hooks:setup"]).toBe("vp config");
      expect(rootPackageJson.scripts["dev:web"]).toBe("vp run --filter web dev");
      expect(rootPackageJson.scripts["dev:server"]).toBe("vp run --filter server dev");
      expect(webPackageJson.scripts.dev).toBe("vp dev");
      expect(webPackageJson.scripts.build).toBe("vp build");
      expect(webPackageJson.scripts.start).toBe("vp dev");
      expect(webPackageJson.scripts["check-types"]).toBe("tsc --noEmit");
      expect(webViteConfig).toContain('import { defineConfig } from "vite-plus";');
      expect(webViteConfig).not.toContain('import { defineConfig } from "vite";');
      const rootViteConfig = await readFile(join(projectDir!, "vite.config.ts"), "utf8");
      expect(rootViteConfig).toContain('import { defineConfig } from "vite-plus";');
      expect(rootViteConfig).toContain('"apps/web/dist/**"');
      expect(rootViteConfig).toContain('"apps/web/.tanstack/**"');
      // routeTree.gen.ts is committed source (not listed as generated ignore)
      expect(rootViteConfig).not.toContain('"apps/web/src/routeTree.gen.ts"');
      expect(rootViteConfig).toContain('"apps/server/dist/**"');
      expect(rootViteConfig).toContain('"packages/db/dist/**"');
      expect(rootViteConfig).toContain('"local.db"');
      expect(rootViteConfig).toContain('"local.db-*"');
      expect(rootViteConfig).toContain('"packages/db/local.db*"');
      expect(rootViteConfig).not.toContain('"apps/web/.next/**"');
      expect(rootViteConfig).not.toContain('"apps/web/.nuxt/**"');
      expect(rootViteConfig).not.toContain('"packages/db/prisma/generated/**"');
      expect(rootViteConfig).not.toContain('"packages/db/prisma/**/*.db*"');
      expect(rootViteConfig).not.toContain('".wrangler/**"');
      expect(rootViteConfig).toContain("typeCheck: false");
      expect(rootViteConfig).toContain('"*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}":');
      expect(rootViteConfig).toContain('"vp check --fix"');
    });

    it("should wire Vite+ staged checks into Git hook addons", async () => {
      const result = await runTRPCTest({
        projectName: "vite-plus-hooks",
        addons: ["vite-plus", "lefthook", "husky"],
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

      expectSuccess(result);
      const projectDir = result.projectDir;
      expect(projectDir).toBeDefined();

      const rootPackageJson = JSON.parse(await readFile(join(projectDir!, "package.json"), "utf8"));
      const lefthookConfig = await readFile(join(projectDir!, "lefthook.yml"), "utf8");

      expect(rootPackageJson["lint-staged"]).toEqual({
        "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": ["vp check --fix"],
      });
      expect(rootPackageJson.scripts["hooks:setup"]).toBeUndefined();
      expect(lefthookConfig).toContain("name: vite-plus");
      expect(lefthookConfig).toContain("run: bun vp staged");
      expect(lefthookConfig).not.toContain("oxlint --fix");
    });

    it("should keep explicit Oxlint Git hook tasks when Vite+ is also selected", async () => {
      const result = await runTRPCTest({
        projectName: "vite-plus-oxlint-hooks",
        addons: ["vite-plus", "oxlint", "lefthook", "husky"],
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

      expectSuccess(result);
      const projectDir = result.projectDir;
      expect(projectDir).toBeDefined();

      const rootPackageJson = JSON.parse(await readFile(join(projectDir!, "package.json"), "utf8"));
      const lefthookConfig = await readFile(join(projectDir!, "lefthook.yml"), "utf8");

      expect(rootPackageJson["lint-staged"]).toEqual({
        "*": ["oxlint", "oxfmt --write"],
      });
      expect(lefthookConfig).toContain("name: oxlint");
      expect(lefthookConfig).toContain("name: oxfmt");
      expect(lefthookConfig).not.toContain("name: vite-plus");
    });

    it("should wire Vite+ addon when added later", async () => {
      const created = await runTRPCTest({
        projectName: "vite-plus-add-later",
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["vite-plus"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJson = JSON.parse(await readFile(join(projectDir, "package.json"), "utf8"));
      const webPackageJson = JSON.parse(
        await readFile(join(projectDir, "apps/web/package.json"), "utf8"),
      );
      const webViteConfig = await readFile(join(projectDir, "apps/web/vite.config.ts"), "utf8");
      const rootViteConfig = await readFile(join(projectDir, "vite.config.ts"), "utf8");

      expect(rootPackageJson.devDependencies["vite-plus"]).toBe("0.2.2");
      expect(rootPackageJson.scripts.dev).toBe("vp run -r dev");
      expect(rootPackageJson.scripts.staged).toBe("vp staged");
      expect(rootPackageJson.scripts["hooks:setup"]).toBe("vp config");
      expect(webPackageJson.scripts.dev).toBe("vp dev");
      expect(webViteConfig).toContain('import { defineConfig } from "vite-plus";');
      expect(webViteConfig).not.toContain('from "vite";');
      expect(rootViteConfig).toContain('import { defineConfig } from "vite-plus";');
    });

    it("should wire Turborepo addon when added later", async () => {
      const created = await runTRPCTest({
        projectName: "turborepo-add-later",
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["turborepo"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJson = JSON.parse(await readFile(join(projectDir, "package.json"), "utf8"));
      const turboConfig = JSON.parse(await readFile(join(projectDir, "turbo.json"), "utf8"));

      expect(rootPackageJson.devDependencies.turbo).toBeDefined();
      expect(rootPackageJson.scripts.dev).toBe("turbo run dev");
      expect(rootPackageJson.scripts.build).toBe("turbo run build");
      expect(turboConfig.tasks.build.dependsOn).toEqual(["^build"]);
    });

    it("should reject adding Vite+ to a project with an existing task runner", async () => {
      const created = await runTRPCTest({
        projectName: "vite-plus-add-task-runner-conflict",
        addons: ["turborepo"],
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["vite-plus"],
        install: false,
      });

      expect(addResult?.success).toBe(false);
      expect(addResult?.error).toContain(
        "Cannot combine 'turborepo' and 'vite-plus' addons. Choose one task runner.",
      );

      const kubojsConfig = await readFile(join(projectDir, "kubojs.jsonrc"), "utf8");
      expect(kubojsConfig).toContain('"turborepo"');
      expect(kubojsConfig).not.toContain('"vite-plus"');
    });

    it("should reject adding another task runner to a Vite+ project", async () => {
      const created = await runTRPCTest({
        projectName: "vite-plus-add-reverse-task-runner-conflict",
        addons: ["vite-plus"],
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["turborepo"],
        install: false,
      });

      expect(addResult?.success).toBe(false);
      expect(addResult?.error).toContain(
        "Cannot combine 'turborepo' and 'vite-plus' addons. Choose one task runner.",
      );

      const kubojsConfig = await readFile(join(projectDir, "kubojs.jsonrc"), "utf8");
      expect(kubojsConfig).toContain('"vite-plus"');
      expect(kubojsConfig).not.toContain('"turborepo"');
    });

    it("should refresh existing Git hook addons when Vite+ is added later", async () => {
      const created = await runTRPCTest({
        projectName: "vite-plus-add-existing-hooks",
        addons: ["lefthook", "husky"],
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["vite-plus"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJson = JSON.parse(await readFile(join(projectDir, "package.json"), "utf8"));
      const lefthookConfig = await readFile(join(projectDir, "lefthook.yml"), "utf8");

      expect(rootPackageJson.scripts["hooks:setup"]).toBeUndefined();
      expect(rootPackageJson["lint-staged"]).toEqual({
        "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": ["vp check --fix"],
      });
      expect(lefthookConfig).toContain("name: vite-plus");
      expect(lefthookConfig).toContain("run: bun vp staged");
    });

    it("should refresh Git hook addons when they are added after Vite+", async () => {
      const created = await runTRPCTest({
        projectName: "vite-plus-add-hooks-later",
        addons: ["vite-plus"],
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["husky", "lefthook"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJson = JSON.parse(await readFile(join(projectDir, "package.json"), "utf8"));
      const lefthookConfig = await readFile(join(projectDir, "lefthook.yml"), "utf8");

      expect(rootPackageJson.scripts["hooks:setup"]).toBeUndefined();
      expect(rootPackageJson["lint-staged"]).toEqual({
        "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": ["vp check --fix"],
      });
      expect(lefthookConfig).toContain("name: vite-plus");
      expect(lefthookConfig).toContain("run: bun vp staged");
    });

    it("should refresh existing Git hook addons when Biome is added later", async () => {
      const created = await runTRPCTest({
        projectName: "biome-add-existing-hooks",
        addons: ["lefthook", "husky"],
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
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const addResult = await add({
        projectDir,
        addons: ["biome"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJson = JSON.parse(await readFile(join(projectDir, "package.json"), "utf8"));
      const lefthookConfig = await readFile(join(projectDir, "lefthook.yml"), "utf8");

      expect(rootPackageJson["lint-staged"]).toEqual({
        "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": ["biome check --write ."],
      });
      expect(lefthookConfig).toContain("name: biome");
      expect(lefthookConfig).toContain("biome check --write");
      expect(lefthookConfig).not.toContain("name: vite-plus");
      expect(lefthookConfig).not.toContain("name: oxlint");
    });

    it("should preserve Bun workspace catalogs when package scripts refresh on add", async () => {
      const created = await runTRPCTest({
        projectName: "bun-catalog-add-refresh",
        addons: ["turborepo"],
        frontend: ["tanstack-router"],
        backend: "hono",
        runtime: "bun",
        database: "sqlite",
        orm: "drizzle",
        auth: "better-auth",
        api: "trpc",
        examples: ["none"],
        dbSetup: "none",
        webDeploy: "none",
        serverDeploy: "none",
        install: false,
      });

      expectSuccess(created);
      const projectDir = created.result?.projectDirectory;
      if (!projectDir) throw new Error("Expected generated project directory");

      const rootPackageJsonBefore = JSON.parse(
        await readFile(join(projectDir, "package.json"), "utf8"),
      );
      const catalogBefore = rootPackageJsonBefore.workspaces.catalog;
      expect(catalogBefore["better-auth"]).toBeDefined();

      const addResult = await add({
        projectDir,
        addons: ["biome"],
        install: false,
      });

      expect(addResult?.success).toBe(true);

      const rootPackageJsonAfter = JSON.parse(
        await readFile(join(projectDir, "package.json"), "utf8"),
      );
      const authPackageJson = JSON.parse(
        await readFile(join(projectDir, "packages/auth/package.json"), "utf8"),
      );

      expect(Array.isArray(rootPackageJsonAfter.workspaces)).toBe(false);
      expect(rootPackageJsonAfter.workspaces.packages).toEqual(
        rootPackageJsonBefore.workspaces.packages,
      );
      expect(rootPackageJsonAfter.workspaces.catalog).toMatchObject(catalogBefore);
      expect(authPackageJson.dependencies["better-auth"]).toBe("catalog:");
    });

    it("should deduplicate addons", async () => {
      const result = await runTRPCTest({
        projectName: "duplicate-addons",
        addons: ["biome", "biome", "turborepo"], // Duplicate biome
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

      expectSuccess(result);
    });
  });

  describe("Addons with None Option", () => {
    it("should work with addons none", async () => {
      const result = await runTRPCTest({
        projectName: "no-addons",
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

      expectSuccess(result);
    });

    it("should fail with none + other addons", async () => {
      const result = await runTRPCTest({
        projectName: "none-with-other-addons-fail",
        addons: ["none", "biome"],
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
        expectError: true,
      });

      expectError(result, "Cannot combine 'none' with other addons");
    });
  });
});
