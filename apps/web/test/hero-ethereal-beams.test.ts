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

  test("hero preserves content order and removes the competing pin grammar", () => {
    const hero = readRepo("apps/web/src/app/(home)/_components/hero-section.tsx");

    expect(hero).toContain('id="top"');
    expect(hero).toContain('title="Construa sem começar do zero."');
    expect(hero).toContain(
      "Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.",
    );
    expect(hero).toContain('href="/new"');
    expect(hero).toContain("HeroRailLower");
    expect(hero).not.toContain("playHeroStickyScale");
    expect(hero).not.toContain("playHeroScrollRevealIcons");
    expect(hero).not.toContain("lg:min-h-[200dvh]");
  });
});
