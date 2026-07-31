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
    // Dual diagonal gold ribbons: primary mid-right + warm outer-right (structure match).
    expect(source).toContain("sampleCubic");
    expect(source).toContain("x: 0.43");
    expect(source).toContain("x: 0.71");
    expect(source).toContain("x: 1.08");
    expect(source).toContain("x: 1.18");
    // Flat rounded rects only — no per-cell radial edge treatment in the paint loop.
    expect(source).toContain("ctx.roundRect");
    expect(source).toContain("useLayoutEffect");
    // Quiet matrix + band-driven energy (no continuous right wash).
    expect(source).toContain("copyPocket");
    expect(source).toContain("noiseMod");
    expect(source).toContain("safeDraw");
    expect(source).not.toContain("rightField");
    expect(source).not.toContain("deepOlive");
    expect(source).not.toContain("midGold");
    // Broad dual-ribbon fields (not thin knife ribbons or gold soup).
    expect(source).toContain("width: 0.15");
    expect(source).toContain("width: 0.14");
    expect(source).toContain("opacity: 0.92");
    expect(source).toContain("opacity: 0.94");
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
    // CTA replaced by install script (package manager + copyable command).
    expect(hero).toContain("HeroRailLower");
    expect(hero).not.toContain("Montar stack");
    expect(hero).not.toContain('href="/new"');
    // P1: no bottom scroll arrow.
    expect(hero).not.toContain("ArrowDown");
    expect(hero).not.toContain("scrollToNextSection");
    expect(hero).not.toContain("Rolar para a próxima seção");
    // Tighter left gutter (lg ~32px), not the previous 64px rail.
    expect(hero).toContain("lg:px-8");
    expect(hero).not.toContain("lg:px-16");
    expect(hero).not.toContain("xl:px-24");
    // P1: lighter title ~84px / normal weight / milder tracking.
    expect(hero).toContain("!font-normal");
    expect(hero).toContain("tracking-[-0.03em]");
    expect(hero).toContain("5.25rem");
    expect(hero).not.toContain("EtherealBeamsCanvas");
    expect(hero).not.toContain("playHeroStickyScale");
    expect(hero).not.toContain("playHeroScrollRevealIcons");
    expect(hero).not.toContain("lg:min-h-[200dvh]");

    // Installer lives in the hero (not a separate strip below).
    expect(page).not.toContain("HeroInstallStrip");
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
    // Quiet opaque base + soft-light ribbons; hide fallback when Canvas is ready.
    expect(css).toContain("soft-light, soft-light, soft-light, soft-light, normal");
    expect(css).toContain('data-mosaic-ready="true"');
    expect(css).toContain("almost no primary");
    // Over-yellow fix: no continuous right-side primary olive field gradient.
    expect(css).not.toContain("Right-side continuous olive field");
    expect(css).not.toContain("var(--primary) 24%, var(--card)");

    // Hydration-independent boot paints Canvas when React effects do not run.
    const layout = readRepo("apps/web/src/app/layout.tsx");
    const boot = readRepo("apps/web/public/mosaic-hero-boot.js");
    expect(layout).toContain('src="/mosaic-hero-boot.js"');
    expect(layout).toContain("beforeInteractive");
    expect(boot).toContain("mosaic-hero-canvas");
    expect(boot).toContain("data-mosaic-ready");
    expect(boot).toContain("REFERENCE_ROWS");
    expect(boot).not.toContain("twimg.com");
    expect(boot).not.toContain("Fluxion");
    // Boot shares the right-descending dual-ribbon geometry with the React canvas.
    expect(boot).toContain("x: 0.43");
    expect(boot).toContain("y: -0.08");
    expect(boot).toContain("x: 0.71");
    expect(boot).toContain("x: 1.18");
    expect(boot).toContain("x: 0.08");
    expect(boot).toContain("y: 1.12");
    expect(boot).toContain("SEAM_RATIO = 0.09");
    expect(boot).toContain("CORNER_RATIO = 0.17");
    // CSS fallback mirrors right-descending direction with negative-angle bands.
    expect(css).toContain("-28deg");
    expect(css).toContain("-48deg");
    expect(css).toContain("-16deg");
    // Mobile veil extends the copy-safe area to ~76% of the frame.
    expect(css).toContain("max-width: 640px");
    expect(css).toContain("76%");
  });
});
