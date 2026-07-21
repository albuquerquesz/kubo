/**
 * Contract tests for the screen-occupancy gap-spec + fixture samples.
 * Proves the documented gap is evidence-backed (fixture numbers), not fluff.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  areaGrowthRatio,
  occupancyShares,
  paintedSizeAtScale,
} from "../src/lib/motion/occupancy.ts";
import {
  HERO_HOST_X_END_RATIO,
  HERO_HOST_Y_END_RATIO,
  HERO_TITLE_Y_END_RATIO,
  hostTransformAtPinProgress,
  titleExitYAtPinProgress,
} from "../src/lib/motion/timelines/hero-sticky-scale.ts";

const repoRoot = join(import.meta.dir, "../../..");
const fixturePath = join(import.meta.dir, "fixtures/mistral-motion-probe-sample.json");
const gapSpecPath = join(repoRoot, "docs/spec-hero-sticky-scale-screen-occupancy.md");

function loadFixture() {
  expect(existsSync(fixturePath)).toBe(true);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as {
    occupancy: {
      mistral: {
        hostOffset: { w: number; h: number };
        rest: {
          scale: number;
          painted: { w: number; h: number };
          stickyShareArea: number;
          stickyShareW: number;
        };
        endPin: {
          scale: number;
          painted: { w: number; h: number };
          stickyShareArea: number;
          stickyShareW: number;
        };
      };
      kuboLocalGapSample: {
        hostOffset: { w: number; h: number };
        rest: { stickyShareArea: number; stickyShareW: number; painted: { w: number; h: number } };
        endPin: {
          stickyShareArea: number;
          stickyShareW: number;
          painted: { w: number; h: number };
        };
      };
      targetsAfterFix: {
        endStickyShareW_min: number;
        endStickyShareArea_min: number;
        paintedAreaGrowthRatio: { min: number; max: number };
        strategy: string;
      };
      kuboLocalAfterFix?: {
        strategy: string;
        hostOffsetShare: { w: number; h: number };
      };
    };
  };
}

describe("spec-hero-sticky-scale-screen-occupancy", () => {
  test("gap-spec exists with probe summary, deltas, change map, non-goals", () => {
    expect(existsSync(gapSpecPath)).toBe(true);
    const spec = readFileSync(gapSpecPath, "utf8");
    expect(spec).toMatch(/occupancy|sticky share|screen space/i);
    expect(spec).toContain("1440");
    expect(spec).toContain("900");
    expect(spec).toMatch(/Change map|what.?s missing/i);
    expect(spec).toContain("hero-section.tsx");
    expect(spec).toContain("hero-sticky-scale.ts");
    expect(spec).toMatch(/Do not|Out of scope|Non-goals|brand/i);
    expect(spec).toMatch(/0\.55|sticky width share/i);
    expect(spec).toMatch(/layout host|offset/i);
    // Evidence numbers from dual-site probe
    expect(spec).toContain("351");
    expect(spec).toContain("924");
    expect(spec).toMatch(/5\.4%|0\.054|5\.4/);
    expect(spec).toMatch(/28\.2%|0\.282|28\.2/);
  });

  test("gap-spec links skill and parent motion map", () => {
    const spec = readFileSync(gapSpecPath, "utf8");
    expect(spec).toContain("kubo-motion-grammar");
    expect(spec).toContain("spec-mistral-identical-home-motion");
    expect(spec).toContain("probe-hero-occupancy");
  });
});

describe("occupancy fixture samples (shipped evidence)", () => {
  test("mistral end occupancy exceeds kubo gap sample; targets above kubo end", () => {
    const { occupancy } = loadFixture();
    const m = occupancy.mistral;
    const k = occupancy.kuboLocalGapSample;
    const t = occupancy.targetsAfterFix;

    // Layout host is the primary gap (not scale)
    expect(m.hostOffset.w / k.hostOffset.w).toBeGreaterThan(2);
    expect(m.hostOffset.h / k.hostOffset.h).toBeGreaterThan(1.5);

    // Same scale physics → similar area growth from rest painted → end painted
    const mGrowth =
      (m.endPin.painted.w * m.endPin.painted.h) / (m.rest.painted.w * m.rest.painted.h);
    const kGrowth =
      (k.endPin.painted.w * k.endPin.painted.h) / (k.rest.painted.w * k.rest.painted.h);
    expect(mGrowth).toBeCloseTo(areaGrowthRatio(m.rest.scale, m.endPin.scale), 1);
    expect(kGrowth).toBeCloseTo(mGrowth, 1);

    // Occupancy gap
    expect(m.endPin.stickyShareArea).toBeGreaterThan(k.endPin.stickyShareArea * 3);
    expect(m.endPin.stickyShareW).toBeGreaterThan(k.endPin.stickyShareW * 2);

    // Fix targets are above current Kubo end shares
    expect(t.endStickyShareW_min).toBeGreaterThan(k.endPin.stickyShareW);
    expect(t.endStickyShareArea_min).toBeGreaterThan(k.endPin.stickyShareArea);
    expect(t.endStickyShareW_min).toBeLessThanOrEqual(m.endPin.stickyShareW + 0.05);
  });
});

describe("shipped occupancy helpers", () => {
  test("occupancyShares and paintedSizeAtScale match fixture scale physics", () => {
    const { occupancy } = loadFixture();
    const m = occupancy.mistral;
    const sticky = { width: 1440, height: 900 };

    const restPainted = paintedSizeAtScale(
      { width: m.hostOffset.w, height: m.hostOffset.h },
      m.rest.scale,
    );
    expect(restPainted.width).toBeCloseTo(m.rest.painted.w, 0);
    expect(restPainted.height).toBeCloseTo(m.rest.painted.h, 0);

    const endShares = occupancyShares(
      { width: m.endPin.painted.w, height: m.endPin.painted.h },
      sticky,
    );
    expect(endShares.widthShare).toBeCloseTo(m.endPin.stickyShareW, 2);
    expect(endShares.areaShare).toBeCloseTo(m.endPin.stickyShareArea, 2);

    expect(areaGrowthRatio(0.4664, 1)).toBeCloseTo(4.6, 1);
  });

  test("kubo gap sample fails post-fix occupancy floors (documents pre-fix debt)", () => {
    const { occupancy } = loadFixture();
    const k = occupancy.kuboLocalGapSample;
    const t = occupancy.targetsAfterFix;
    expect(k.endPin.stickyShareW).toBeLessThan(t.endStickyShareW_min);
    expect(k.endPin.stickyShareArea).toBeLessThan(t.endStickyShareArea_min);
  });
});

describe("remap: in-flow host + title exit tokens", () => {
  test("host offset ratios and title exit match Mistral probe", () => {
    expect(HERO_HOST_X_END_RATIO).toBeCloseTo(258 / 924, 5);
    expect(HERO_HOST_Y_END_RATIO).toBeCloseTo(-252 / 396, 5);
    // Title exit at least as strong as Mistral (−0.5 sticky H)
    expect(HERO_TITLE_Y_END_RATIO).toBeLessThanOrEqual(-0.5);
    const end = hostTransformAtPinProgress(1, 924, 396);
    expect(end.x).toBeCloseTo(258, 1);
    expect(end.y).toBeCloseTo(-252, 1);
    expect(titleExitYAtPinProgress(1, 900)).toBeLessThanOrEqual(-450);
  });

  test("area growth physics still ~4.6× under pure scale", () => {
    const { occupancy } = loadFixture();
    expect(areaGrowthRatio(0.4664, 1)).toBeGreaterThanOrEqual(
      occupancy.targetsAfterFix.paintedAreaGrowthRatio.min,
    );
    expect(areaGrowthRatio(0.4664, 1)).toBeLessThanOrEqual(
      occupancy.targetsAfterFix.paintedAreaGrowthRatio.max,
    );
  });

  test("remap spec exists and rejects absolute stage host", () => {
    const remapPath = join(repoRoot, "docs/spec-hero-sticky-stage-remap.md");
    expect(existsSync(remapPath)).toBe(true);
    const remap = readFileSync(remapPath, "utf8");
    expect(remap).toMatch(/title exit|Family B2|translateY/i);
    expect(remap).toMatch(/in-flow|type \+ padding|type\+pad/i);
    expect(remap).toMatch(/absolute|rejected|false-positive/i);
  });
});
