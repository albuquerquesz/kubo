import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "../../..");

function readRepo(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("ethereal beams hero contract", () => {
  test("keeps the canvas decorative, responsive, and client-only", () => {
    const source = readRepo("apps/web/src/app/(home)/_components/ethereal-beams-canvas.tsx");

    expect(source).toContain('"use client"');
    expect(source).toContain("pointer-events-none");
    expect(source).toContain('getContext("webgl2")');
    expect(source).toContain("WebGLErrorBoundary");
    expect(source).toContain("StaticBeams");
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain("dpr={[1, settings.maxDpr]}");
    expect(source).toContain("count: 14");
    expect(source).toContain("count: 9");
    expect(source).toContain("count: 6");
  });

  test("ethereal beams canvas remains available as a standalone decorative layer", () => {
    const source = readRepo("apps/web/src/app/(home)/_components/ethereal-beams-canvas.tsx");

    expect(source).toContain("export default function EtherealBeamsCanvas");
    expect(source).toContain("useThemeColors");
    expect(source).toContain("ethereal-beams-fallback");
  });
});
