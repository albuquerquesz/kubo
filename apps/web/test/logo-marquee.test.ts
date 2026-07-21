/**
 * Geometry + drag normalize contract for the home logo marquee.
 * Source of truth: docs/spec-mistral-home-logo-marquee.md (cell/step geometry).
 * Product content: Brazilian integrations (count may differ from original 12-card probe).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC,
  LOGO_MARQUEE_BREAKPOINT_PX,
  LOGO_MARQUEE_CELL_COUNT,
  LOGO_MARQUEE_CLICK_SLOP_PX,
  LOGO_MARQUEE_COMPACT,
  LOGO_MARQUEE_DESKTOP,
  cellOriginX,
  logoMarqueeMetrics,
  normalizeMarqueeOffset,
} from "../src/lib/logo-marquee.ts";

const webRoot = join(import.meta.dir, "..");

describe("logo marquee metrics", () => {
  test("compact: 160 cell / step, logo max 80×40", () => {
    expect(LOGO_MARQUEE_COMPACT.cell).toBe(160);
    expect(LOGO_MARQUEE_COMPACT.step).toBe(160);
    expect(LOGO_MARQUEE_COMPACT.sequenceWidth).toBe(160 * LOGO_MARQUEE_CELL_COUNT);
    expect(LOGO_MARQUEE_COMPACT.logoMaxW).toBe(80);
    expect(LOGO_MARQUEE_COMPACT.logoMaxH).toBe(40);
    expect(logoMarqueeMetrics(767)).toEqual(LOGO_MARQUEE_COMPACT);
  });

  test("desktop: 272 cell, step 271, logo max 112×60", () => {
    expect(LOGO_MARQUEE_DESKTOP.cell).toBe(272);
    expect(LOGO_MARQUEE_DESKTOP.step).toBe(271);
    expect(LOGO_MARQUEE_DESKTOP.sequenceWidth).toBe(271 * LOGO_MARQUEE_CELL_COUNT);
    expect(LOGO_MARQUEE_DESKTOP.logoMaxW).toBe(112);
    expect(LOGO_MARQUEE_DESKTOP.logoMaxH).toBe(60);
    expect(logoMarqueeMetrics(768)).toEqual(LOGO_MARQUEE_DESKTOP);
    expect(logoMarqueeMetrics(1830)).toEqual(LOGO_MARQUEE_DESKTOP);
  });

  test("breakpoint is 768", () => {
    expect(LOGO_MARQUEE_BREAKPOINT_PX).toBe(768);
    expect(logoMarqueeMetrics(LOGO_MARQUEE_BREAKPOINT_PX - 1)).toEqual(LOGO_MARQUEE_COMPACT);
    expect(logoMarqueeMetrics(LOGO_MARQUEE_BREAKPOINT_PX)).toEqual(LOGO_MARQUEE_DESKTOP);
  });

  test("three BR integration cells", () => {
    expect(LOGO_MARQUEE_CELL_COUNT).toBe(3);
  });

  test("click slop is 6px", () => {
    expect(LOGO_MARQUEE_CLICK_SLOP_PX).toBe(6);
  });

  test("autoplay speed is a positive Kubo drift rate", () => {
    expect(LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC).toBeGreaterThan(0);
  });
});

describe("cell origins (desktop −1, 270, 541…)", () => {
  test("desktop first cells match step-271 geometry", () => {
    const m = LOGO_MARQUEE_DESKTOP;
    expect(cellOriginX(0, m)).toBe(-1);
    expect(cellOriginX(1, m)).toBe(270);
    expect(cellOriginX(2, m)).toBe(541);
  });

  test("desktop last cell right edge is sequenceWidth relative to track origin 0", () => {
    const m = LOGO_MARQUEE_DESKTOP;
    const lastLeft = cellOriginX(LOGO_MARQUEE_CELL_COUNT - 1, m);
    const lastRight = lastLeft + m.cell;
    expect(lastRight).toBe(m.sequenceWidth);
  });

  test("compact origins are 0, 160, 320…", () => {
    const m = LOGO_MARQUEE_COMPACT;
    expect(cellOriginX(0, m)).toBe(0);
    expect(cellOriginX(1, m)).toBe(160);
    expect(cellOriginX(2, m)).toBe(320);
  });
});

describe("normalizeMarqueeOffset", () => {
  const W = LOGO_MARQUEE_DESKTOP.sequenceWidth;

  test("identity in (−W, 0]", () => {
    expect(normalizeMarqueeOffset(0, W)).toBe(0);
    expect(normalizeMarqueeOffset(-1, W)).toBe(-1);
    expect(normalizeMarqueeOffset(-W + 1, W)).toBe(-W + 1);
  });

  test("wraps past one sequence without visual jump (modulo)", () => {
    expect(normalizeMarqueeOffset(-W, W)).toBe(0);
    expect(normalizeMarqueeOffset(-W - 50, W)).toBe(-50);
    expect(normalizeMarqueeOffset(-2 * W - 100, W)).toBe(-100);
  });

  test("wraps positive drag into (−W, 0]", () => {
    expect(normalizeMarqueeOffset(50, W)).toBe(50 - W);
    expect(normalizeMarqueeOffset(W, W)).toBe(0);
    expect(normalizeMarqueeOffset(W + 80, W)).toBe(80 - W);
  });

  test("compact sequence uses cell-count step", () => {
    const c = LOGO_MARQUEE_COMPACT.sequenceWidth;
    expect(normalizeMarqueeOffset(-c - 10, c)).toBe(-10);
    expect(normalizeMarqueeOffset(10, c)).toBe(10 - c);
  });
});

describe("shipped markup + assets", () => {
  test("home page mounts LogoMarquee after hero", () => {
    const page = readFileSync(join(webRoot, "src/app/(home)/page.tsx"), "utf8");
    expect(page).toContain('import LogoMarquee from "./_components/logo-marquee"');
    expect(page).toMatch(/<HeroSection \/>\s*<LogoMarquee \/>/);
  });

  test("component lists AbacatePay, Guara Cloud, GetMonitor", () => {
    const src = readFileSync(join(webRoot, "src/app/(home)/_components/logo-marquee.tsx"), "utf8");
    expect(src).toContain("AbacatePay");
    expect(src).toContain("Guara Cloud");
    expect(src).toContain("GetMonitor");
    expect(src).toContain("/integrations/abacatepay.svg");
    expect(src).toContain("/integrations/guaracloud.png");
    expect(src).toContain("/integrations/getmonitor.svg");
    expect(src).toContain("TRACK_COPIES = 3");
    expect(src).toContain("LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC");
    expect(src).toContain("requestAnimationFrame");
    expect(src).toContain("prefersReducedMotion");
  });

  test("integration icons exist under public/integrations", () => {
    const dir = join(webRoot, "public/integrations");
    expect(readFileSync(join(dir, "abacatepay.svg"), "utf8").length).toBeGreaterThan(100);
    expect(readFileSync(join(dir, "getmonitor.svg"), "utf8").length).toBeGreaterThan(50);
    // PNG is binary — just ensure readable non-empty
    expect(readFileSync(join(dir, "guaracloud.png")).byteLength).toBeGreaterThan(100);
  });

  test("global CSS ships desktop 272 / compact 160 and −1px cell overlap", () => {
    const css = readFileSync(join(webRoot, "src/app/global.css"), "utf8");
    expect(css).toContain(".logo-marquee__viewport");
    expect(css).toContain("height: 160px");
    expect(css).toContain("height: 272px");
    expect(css).toContain("width: 272px");
    expect(css).toContain("margin-left: -1px");
    expect(css).toContain("max-width: 112px");
    expect(css).toContain("max-height: 60px");
    expect(css).toContain("filter: grayscale(1)");
    expect(css).toContain("500ms ease-in-out");
    expect(css).toContain("touch-action: pan-x");
    expect(css).toContain("cursor: grab");
  });
});
