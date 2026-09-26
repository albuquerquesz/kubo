import { afterEach, describe, expect, it } from "bun:test";
import path from "node:path";

import fs from "fs-extra";

const FIXTURE_ROOT = path.join(import.meta.dir, ".fixtures");

import { resolveLayout } from "../src/layout-resolver";

async function withProjectDir(
  name: string,
  setup: (projectDir: string) => Promise<void>,
  run: (projectDir: string) => void | Promise<void>,
) {
  const projectDir = path.join(FIXTURE_ROOT, name);
  await fs.remove(projectDir);
  await fs.ensureDir(projectDir);
  await setup(projectDir);
  try {
    await run(projectDir);
  } finally {
    await fs.remove(projectDir);
  }
}

describe("resolveLayout", () => {
  afterEach(async () => {
    await fs.remove(FIXTURE_ROOT);
  });

  it("resolves standard paths when required app dirs exist", async () => {
    await withProjectDir(
      "happy-hono",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/web"));
        await fs.ensureDir(path.join(projectDir, "apps/server"));
      },
      (projectDir) => {
        const layoutResult = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "hono",
        });
        expect(layoutResult.isOk()).toBe(true);
        if (layoutResult.isErr()) return;
        expect(layoutResult.value.path("web", "app")).toBe("apps/web");
      },
    );
  });

  it("returns missing_paths when required layout paths are absent", async () => {
    await withProjectDir(
      "missing-web",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/server"));
      },
      (projectDir) => {
        const layoutResult = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "hono",
        });
        expect(layoutResult.isErr()).toBe(true);
        if (layoutResult.isOk()) return;
        expect(layoutResult.error.code).toBe("missing_paths");
        expect(layoutResult.error.message).toContain("kubo.config.ts");
        expect(layoutResult.error.message).toContain("layout.apps");
        expect(layoutResult.error.message).toContain("apps/web");
      },
    );
  });

  it("returns path_collision when logical ids share a path", async () => {
    await withProjectDir(
      "collision",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/shared"));
      },
      (projectDir) => {
        const layoutResult = resolveLayout(
          {
            preset: "standard",
            apps: { web: "apps/shared", server: "apps/shared" },
          },
          projectDir,
          { backend: "hono" },
        );
        expect(layoutResult.isErr()).toBe(true);
        if (layoutResult.isOk()) return;
        expect(layoutResult.error.code).toBe("path_collision");
      },
    );
  });

  it("requires backend package path for convex instead of apps/server", async () => {
    await withProjectDir(
      "convex-backend",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/web"));
        await fs.ensureDir(path.join(projectDir, "apps/server"));
      },
      (projectDir) => {
        const layoutResult = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "convex",
        });
        expect(layoutResult.isErr()).toBe(true);
        if (layoutResult.isOk()) return;
        expect(layoutResult.error.message).toContain("packages/backend");
      },
    );

    await withProjectDir(
      "convex-ok",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/web"));
        await fs.ensureDir(path.join(projectDir, "packages/backend"));
      },
      (projectDir) => {
        const layoutResult = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "convex",
        });
        expect(layoutResult.isOk()).toBe(true);
        if (layoutResult.isErr()) return;
        expect(layoutResult.value.path("backend", "package")).toBe("packages/backend");
      },
    );
  });
});
