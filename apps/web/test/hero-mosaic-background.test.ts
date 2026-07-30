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
    expect(source).toContain("resolveGrid");
    expect(source).toContain("REFERENCE_ROWS");
    expect(source).toContain("data-mosaic-ready");
    // Softer corners (16–18% of pitch), narrow seam.
    expect(source).toContain("CORNER_RATIO = 0.17");
    expect(source).toContain("SEAM_RATIO = 0.09");
    // Directional bands: lower-right → upper-left, no mid-field eye/bridge.
    expect(source).toContain("x: 0.92");
    expect(source).toContain("x: 1.12");
    expect(source).toContain("x: 0.78");
    expect(source).toContain("x: 0.86");
    // Flat rounded rects only — no per-cell radial edge treatment in the paint loop.
    expect(source).toContain("ctx.roundRect");
    expect(source).toContain("useLayoutEffect");
    // Continuous quiet olive field before bands/veil (yellow density contract).
    expect(source).toContain("deepOlive");
    expect(source).toContain("midGold");
    expect(source).toContain("rightField");
    expect(source).toContain("copyPocket");
    // Canvas mounts without a client-only gate that can leave only the fallback.
    expect(source).toContain('className="mosaic-hero-canvas absolute inset-0 h-full w-full"');
    expect(source).not.toContain("{mounted &&");
    // Never ship the reference brand or remote artwork.
    expect(source).not.toContain("Fluxion");
    expect(source).not.toContain("twimg.com");
    expect(source).not.toContain("hero-reference");
  });

  test("hero uses lower-left composition, compact CTA, and full-bleed artwork", () => {
    const hero = readRepo("apps/web/src/app/(home)/_components/hero-section.tsx");
    const page = readRepo("apps/web/src/app/(home)/page.tsx");
    const strip = readRepo("apps/web/src/app/(home)/_components/hero-install-strip.tsx");
    const css = readRepo("apps/web/src/app/global.css");

    expect(hero).toContain("MosaicHeroCanvas");
    expect(hero).toContain("mosaic-hero-veil");
    expect(hero).toContain('id="top"');
    expect(hero).toContain("-mt-12");
    expect(hero).toContain("min-h-svh");
    expect(hero).toContain("items-start");
    expect(hero).toContain("justify-end");
    expect(hero).toContain("text-left");
    expect(hero).toContain('title="Construa sem começar do zero."');
    expect(hero).toContain(
      "Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.",
    );
    expect(hero).toContain('href="/new"');
    expect(hero).toContain("Montar stack");
    // P1: no bottom scroll arrow.
    expect(hero).not.toContain("ArrowDown");
    expect(hero).not.toContain("scrollToNextSection");
    expect(hero).not.toContain("Rolar para a próxima seção");
    // P1: ~64px desktop gutter (px-16), not xl:px-24.
    expect(hero).toContain("lg:px-16");
    expect(hero).not.toContain("xl:px-24");
    // P1: lighter title ~84px / normal weight / milder tracking.
    expect(hero).toContain("!font-normal");
    expect(hero).toContain("tracking-[-0.03em]");
    expect(hero).toContain("5.25rem");
    expect(hero).not.toContain("HeroRailLower");
    expect(hero).not.toContain("EtherealBeamsCanvas");
    expect(hero).not.toContain("playHeroStickyScale");
    expect(hero).not.toContain("playHeroScrollRevealIcons");
    expect(hero).not.toContain("lg:min-h-[200dvh]");

    // Installer relocated, not deleted.
    expect(page).toContain("HeroInstallStrip");
    expect(strip).toContain("HeroRailLower");
    expect(strip).toContain("DEFAULT_PACKAGE_MANAGER");

    expect(css).toContain(".mosaic-hero-fallback");
    expect(css).toContain(".mosaic-hero-fallback::before");
    expect(css).toContain(".mosaic-hero-veil");
    expect(css).toContain("--mosaic-pitch");
    expect(css).toContain("var(--background)");
    expect(css).toContain("var(--primary)");
    expect(css).toContain("var(--accent)");
    // Fallback tiles via mask: rx ≈ 5.5u / 32u pitch (≈17%), not graph-paper lines.
    expect(css).toContain("rx='5.5'");
    expect(css).toContain("mask-image");
    // Density: opaque olive base + soft-light bands, not screen-only; hide when ready.
    expect(css).toContain("soft-light, soft-light, soft-light, soft-light, normal, normal");
    expect(css).toContain('data-mosaic-ready="true"');
    expect(css).toContain("Right-side continuous olive field");
  });
});
