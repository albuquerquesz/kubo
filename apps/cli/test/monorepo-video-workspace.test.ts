import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Monorepo root (apps/cli/test → ../../..) */
const root = join(import.meta.dir, "../../..");

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

describe("monorepo video workspace (post apps/video extraction)", () => {
  test("@kubojs/video is private and uses bundle/render, not monorepo build", () => {
    const pkg = readJson("apps/video/package.json") as {
      name: string;
      private?: boolean;
      scripts: Record<string, string>;
    };

    expect(pkg.name).toBe("@kubojs/video");
    expect(pkg.private).toBe(true);
    expect(pkg.scripts.bundle).toContain("remotion bundle");
    expect(pkg.scripts.render).toContain("kubo-launch");
    expect(pkg.scripts.dev).toContain("remotion studio");
    expect(pkg.scripts.build).toBeUndefined();
  });

  test("root scripts filter video via turbo bundle/dev", () => {
    const pkg = readJson("package.json") as { scripts: Record<string, string> };

    expect(pkg.scripts["dev:video"]).toBe("turbo run dev --filter=@kubojs/video");
    expect(pkg.scripts["build:video"]).toBe("turbo run bundle --filter=@kubojs/video");
  });

  test("turbo defines bundle task with build/** and out/** outputs", () => {
    const turbo = readJson("turbo.json") as {
      tasks: { bundle?: { outputs?: string[]; dependsOn?: string[] } };
    };

    expect(turbo.tasks.bundle).toBeDefined();
    expect(turbo.tasks.bundle?.outputs).toEqual(expect.arrayContaining(["build/**", "out/**"]));
  });

  test("web no longer nests video under public/", () => {
    expect(existsSync(join(root, "apps/web/public/video"))).toBe(false);
    expect(existsSync(join(root, "apps/video/package.json"))).toBe(true);
  });

  test("release workflow includes deploy-web after release with prebuilt vercel", () => {
    const yml = readFileSync(join(root, ".github/workflows/release.yaml"), "utf8");

    expect(yml).toContain("deploy-web:");
    expect(yml).toContain("needs: release");
    expect(yml).toContain("vercel build --prod");
    expect(yml).toContain("vercel deploy --prebuilt --prod");
    expect(yml).toContain("VERCEL_TOKEN");
  });

  test("code-quality report documents the last three commits under review", () => {
    const report = readFileSync(join(root, "docs/code-quality-review-last-3-commits.md"), "utf8");

    expect(report).toContain("0450614a");
    expect(report).toContain("cd822e63");
    expect(report).toContain("45e9f3ee");
    expect(report).toMatch(/### High/i);
    expect(report).toMatch(/### Medium/i);
    expect(report).toContain("Verification performed");
    expect(report).toContain(".github/workflows/release.yaml");
    expect(report).toContain("@kubojs/video");
  });
});
