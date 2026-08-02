import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getMosaicBandGeometry } from "../src/app/(home)/_components/mosaic-hero-canvas";

const repoRoot = join(import.meta.dir, "../../..");

function readRepo(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("mosaic hero background contract", () => {
  test("keeps the canvas decorative, yellow/amber field-driven, and motion-safe", () => {
    const source = readRepo("apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx");

    expect(source).toContain('"use client"');
    expect(source).toContain("pointer-events-none");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain("MAX_DPR");
    // Theme tokens still resolved for any residual/theme hooks.
    expect(source).toContain("--background");
    expect(source).toContain("--primary");
    expect(source).toContain("--accent");
    expect(source).toContain("--foreground");
    expect(source).toContain("mosaic-hero-fallback");
    expect(source).toContain("resolveGrid");
    expect(source).toContain("REFERENCE_ROWS");
    expect(source).toContain("data-mosaic-ready");
    // User-tuned tile geometry.
    expect(source).toContain("CORNER_RATIO = 0.34");
    expect(source).toContain("SEAM_RATIO = 0.05");
    // Yellow + dark yellow field (bright S + amber bow).
    expect(source).toContain("const FIELD");
    expect(source).toContain("yellowCore");
    expect(source).toContain("yellowHot");
    expect(source).toContain("yellowMid");
    expect(source).toContain("amberCore");
    expect(source).toContain("amberHot");
    expect(source).toContain("amberFade");
    expect(source).toContain("baseDark");
    expect(source).toContain("COOL_RIDGE");
    expect(source).toContain("WARM_RIDGE");
    expect(source).toContain("COOL_UPPER_RIDGE");
    expect(source).toContain("COOL_LOWER_RIDGE");
    // Continuous cool S as one band (no mid-gap wash).
    expect(source).toContain("coolS");
    expect(source).toContain("warmBand");
    expect(source).toContain("topLeftHaze");
    expect(source).toContain("overlapPale");
    expect(source).toContain("hotColor");
    expect(source).toContain("getMosaicBandGeometry");
    // No gold six-column lightning pack.
    expect(source).not.toContain("width: 0.034");
    expect(source).not.toContain("primaryBand");
    expect(source).not.toContain("copperBand");
    // Flat rounded rects only.
    expect(source).toContain("ctx.roundRect");
    expect(source).toContain("useLayoutEffect");
    expect(source).toContain("copyPocket");
    expect(source).toContain("noiseMod");
    expect(source).toContain("safeDraw");
    expect(source).toContain("hotspot");
    // Canvas mounts without a client-only gate that can leave only the fallback.
    expect(source).toContain('className="mosaic-hero-canvas absolute inset-0 h-full w-full"');
    expect(source).not.toContain("{mounted &&");
    // Never ship the reference brand name or remote artwork URL in the component.
    expect(source).not.toContain("Fluxion");
    expect(source).not.toContain("pbs.twimg.com");
  });

  test("phase-0 ridge geometry is inverted S-curve with far-right warm bow", () => {
    const geo = getMosaicBandGeometry(0);
    const source = readRepo("apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx");

    // No continuous coolMass wash blob (skeptic: restores discrete ribbons).
    expect(source).not.toContain("coolMassX");
    expect(source).not.toContain("coolMassY");
    expect(source).not.toContain("rightWeight");

    // Inverted cool S: enters top-right, not left half.
    expect(geo.coolRidge[0].x).toBeGreaterThanOrEqual(0.7);
    expect(geo.coolRidge[0].y).toBeLessThan(0.08);
    // Mid bulge swings left (x ~0.55–0.62) around y0.36.
    const coolMid = geo.coolRidge.find((p) => Math.abs(p.y - 0.36) < 0.06);
    expect(coolMid).toBeDefined();
    expect(coolMid!.x).toBeGreaterThan(0.52);
    expect(coolMid!.x).toBeLessThan(0.64);
    // Lower half swings back right (~0.72–0.82).
    const coolLower = geo.coolRidge.filter((p) => p.y >= 0.65 && p.y <= 0.95);
    expect(coolLower.length).toBeGreaterThan(0);
    for (const p of coolLower) {
      expect(p.x).toBeGreaterThanOrEqual(0.7);
      expect(p.x).toBeLessThanOrEqual(0.86);
    }
    // Discrete ribbon path span (S-curve, not a vertical rail).
    const coolXs = geo.coolRidge.map((p) => p.x);
    expect(Math.max(...coolXs) - Math.min(...coolXs)).toBeGreaterThan(0.18);
    expect(Math.max(...coolXs)).toBeLessThanOrEqual(0.86);

    // Warm outer bow on FAR right (x0.82–0.98).
    expect(geo.warmRidge[0].x).toBeGreaterThan(0.78);
    const warmMid = geo.warmRidge.find((p) => Math.abs(p.y - 0.38) < 0.1);
    expect(warmMid).toBeDefined();
    expect(warmMid!.x).toBeGreaterThan(0.88);

    // Warm weave through inverted yellow mid-right.
    expect(geo.warmWeaveRidge).toBeDefined();
    const weaveXs = geo.warmWeaveRidge!.map((p) => p.x);
    expect(Math.min(...weaveXs)).toBeLessThanOrEqual(0.6);
    expect(Math.max(...weaveXs)).toBeLessThan(0.85);

    // Hotspots: sole cool primary at inverted lower coords + warm outer.
    const coolLowerHot = geo.bands.find(
      (b) => b.hotspot && Math.abs(b.hotspot.x - 0.76) < 0.06 && b.hotspot.y > 0.7,
    );
    const warmOuter = geo.bands.find(
      (b) => b.hotspot && b.hotspot.x >= 0.9 && b.hotspot.y > 0.28 && b.hotspot.y < 0.5,
    );
    expect(coolLowerHot?.hotspot?.x).toBeCloseTo(0.76, 1);
    expect(coolLowerHot?.hotspot?.y).toBeCloseTo(0.76, 1);
    expect(warmOuter?.hotspot?.x).toBeCloseTo(0.91, 1);
    // Dual outer arms for far-right amber dens.
    expect(geo.warmShoulderRidge).toBeDefined();
    expect(geo.warmEdgeRidge).toBeDefined();
    expect(Math.min(...geo.warmShoulderRidge!.map((p) => p.x))).toBeLessThanOrEqual(0.84);
    expect(Math.max(...geo.warmEdgeRidge!.map((p) => p.x))).toBeGreaterThanOrEqual(0.96);
    // Sole lower primary hotspot on cool S (x≥0.7 after invert).
    const coolHotCount = geo.bands.filter(
      (b) => b.hotspot && b.hotspot.y > 0.65 && b.hotspot.x >= 0.7 && b.hotspot.x < 0.85,
    ).length;
    expect(coolHotCount).toBe(1);

    // Discrete ribbons: thinner widths (not mega-cloud wash). Floor 0.05.
    for (const b of geo.bands) {
      expect(b.width).toBeGreaterThanOrEqual(0.05);
      expect(b.width).toBeLessThanOrEqual(0.2);
    }

    // Left-flank spur of inverted S (mid x, not far-right).
    expect(geo.coolFarRightSpur).toBeDefined();
    const spurXs = geo.coolFarRightSpur!.map((p) => p.x);
    expect(Math.max(...spurXs)).toBeLessThanOrEqual(0.58);
    expect(Math.min(...spurXs)).toBeGreaterThanOrEqual(0.44);

    // Phase 0 is identity on cool S start (full ridge).
    const coolSBand = geo.bands.find(
      (b) =>
        b.pointCount >= geo.coolRidge.length - 1 &&
        b.start &&
        Math.abs(b.start.x - geo.coolRidge[0].x) < 0.01,
    );
    expect(coolSBand?.start.x).toBeCloseTo(geo.coolRidge[0].x, 5);
    expect(coolSBand?.start.y).toBeCloseTo(geo.coolRidge[0].y, 5);
  });

  test("CSS fallback uses discrete yellow/amber ribbons not cyan/red", () => {
    const css = readRepo("apps/web/src/app/global.css");
    expect(css).toContain(".mosaic-hero-fallback");
    expect(css).toContain("rgb(214 167 43");
    expect(css).toContain("rgb(196 147 20");
    expect(css).toContain("rgb(150 105 18");
    expect(css).toContain("#0e0e0c");
    // Discrete hotspots: inverted lower primary + amber far-right.
    expect(css).toContain("at 76% 75%");
    expect(css).toContain("at 72% 16%");
    expect(css).toContain("at 94% 38%");
  });
});
