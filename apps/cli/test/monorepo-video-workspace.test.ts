import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../../..");

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(root, rel), "utf8")) as T;
}

describe("monorepo video workspace", () => {
  test("@kubojs/video is a private Remotion app outside web public/", () => {
    expect(existsSync(join(root, "apps/web/public/video"))).toBe(false);

    const pkg = readJson<{
      name: string;
      private?: boolean;
      scripts: Record<string, string>;
    }>("apps/video/package.json");

    expect(pkg.name).toBe("@kubojs/video");
    expect(pkg.private).toBe(true);
    expect(pkg.scripts.build).toBeUndefined();
    expect(pkg.scripts.dev).toContain("remotion studio");
    expect(pkg.scripts.bundle).toContain("remotion bundle");
    expect(pkg.scripts.render).toContain("kubo-launch");
  });

  test("root and turbo wire video via opt-in bundle", () => {
    const rootPkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const turbo = readJson<{ tasks: { bundle?: { outputs?: string[] } } }>("turbo.json");

    expect(rootPkg.scripts["dev:video"]).toBe("turbo run dev --filter=@kubojs/video");
    expect(rootPkg.scripts["build:video"]).toBe("turbo run bundle --filter=@kubojs/video");
    expect(turbo.tasks.bundle?.outputs).toEqual(expect.arrayContaining(["build/**", "out/**"]));
  });
});
