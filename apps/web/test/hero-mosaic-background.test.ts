import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "../../..");

function readRepo(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("mosaic hero background contract", () => {
  test("keeps the canvas decorative, token-driven, and motion-safe", () => {
    const source = readRepo("apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx");

    expect(source).toContain('"use client"');
    expect(source).toContain("pointer-events-none");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain("MAX_DPR");
    expect(source).toContain("--background");
    expect(source).toContain("--primary");
    expect(source).toContain("--accent");
    expect(source).toContain("--foreground");
    expect(source).toContain("mosaic-hero-fallback");
    expect(source).toContain("COLUMNS");
    expect(source).toContain("ROWS");
    // Never ship the reference brand or remote artwork.
    expect(source).not.toContain("Fluxion");
    expect(source).not.toContain("twimg.com");
    expect(source).not.toContain("hero-reference");
  });

  test("hero wires mosaic background and preserves content", () => {
    const hero = readRepo("apps/web/src/app/(home)/_components/hero-section.tsx");
    const css = readRepo("apps/web/src/app/global.css");

    expect(hero).toContain("MosaicHeroCanvas");
    expect(hero).toContain("mosaic-hero-veil");
    expect(hero).toContain('id="top"');
    expect(hero).toContain('title="Construa sem começar do zero."');
    expect(hero).toContain(
      "Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.",
    );
    expect(hero).toContain("HeroRailLower");
    expect(hero).not.toContain("EtherealBeamsCanvas");
    expect(hero).not.toContain("playHeroStickyScale");
    expect(hero).not.toContain("playHeroScrollRevealIcons");
    expect(hero).not.toContain("lg:min-h-[200dvh]");

    expect(css).toContain(".mosaic-hero-fallback");
    expect(css).toContain(".mosaic-hero-veil");
    expect(css).toContain("var(--background)");
    expect(css).toContain("var(--primary)");
    expect(css).toContain("var(--accent)");
  });
});
