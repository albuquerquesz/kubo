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
        const layout = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "hono",
        });
        expect(layout.path("web", "app")).toBe("apps/web");
      },
    );
  });

  it("throws when required layout paths are missing on disk", async () => {
    await withProjectDir(
      "missing-web",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/server"));
      },
      (projectDir) => {
        expect(() =>
          resolveLayout({ preset: "standard" }, projectDir, { backend: "hono" }),
        ).toThrow(/kubo\.config\.ts/);
        expect(() =>
          resolveLayout({ preset: "standard" }, projectDir, { backend: "hono" }),
        ).toThrow(/layout\.apps/);
        expect(() =>
          resolveLayout({ preset: "standard" }, projectDir, { backend: "hono" }),
        ).toThrow(/apps\/web/);
      },
    );
  });

  it("throws on layout path collision between logical ids", async () => {
    await withProjectDir(
      "collision",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/shared"));
      },
      (projectDir) => {
        expect(() =>
          resolveLayout(
            {
              preset: "standard",
              apps: { web: "apps/shared", server: "apps/shared" },
            },
            projectDir,
            { backend: "hono" },
          ),
        ).toThrow(/Layout path collision/);
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
        expect(() =>
          resolveLayout({ preset: "standard" }, projectDir, { backend: "convex" }),
        ).toThrow(/packages\/backend/);
      },
    );

    await withProjectDir(
      "convex-ok",
      async (projectDir) => {
        await fs.ensureDir(path.join(projectDir, "apps/web"));
        await fs.ensureDir(path.join(projectDir, "packages/backend"));
      },
      (projectDir) => {
        const layout = resolveLayout({ preset: "standard" }, projectDir, {
          backend: "convex",
        });
        expect(layout.path("backend", "package")).toBe("packages/backend");
      },
    );
  });
});
