/**
 * Runtime checks against the shipped Family B/C motion helpers.
 * Curve samples must track the canonical probe fixture (not a reimplemented oracle).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { ease, duration, stagger } from "../src/lib/motion/eases.ts";
import {
  HERO_HOST_EASE,
  HERO_HOST_X_END_RATIO,
  HERO_HOST_Y_END_RATIO,
  HERO_LINE_X_END_RATIOS,
  HERO_STICKY_SCALE_FROM,
  HERO_STICKY_SCALE_TO,
  HERO_STICKY_SCROLL,
  HERO_TITLE_Y_END_RATIO,
  heroIconScrollRange,
  hostEaseProgress,
  hostTransformAtPinProgress,
  lineTranslateXAtPinProgress,
  pinTravelPx,
  titleExitYAtPinProgress,
} from "../src/lib/motion/timelines/hero-sticky-scale.ts";
import {
  SCROLL_REVEAL_ICONS_DEFAULTS,
  SCROLL_REVEAL_ICONS_HERO,
} from "../src/lib/motion/timelines/scroll-reveal-icons.ts";

const fixturePath = join(import.meta.dir, "fixtures/mistral-motion-probe-sample.json");

type Fixture = {
  familyB_hostTransform: Array<{
    scrollY: number;
    scale: number;
    translateX: number;
    translateY: number;
  }>;
  familyB_sentenceTranslateX: Array<{ scrollY: number; lines: number[] }>;
  familyC_riseWindow: {
    fullyClippedUntilScrollY: number;
    leaveRestApproxScrollY: number;
    doneApproxScrollY: number;
    hostScaleLocksApproxScrollY: number;
  };
  pin: { pinTravelPx: number; heroMinHeightPx: number; stickyHeightPx: number };
};

function loadFixture(): Fixture {
  expect(existsSync(fixturePath)).toBe(true);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Fixture;
}

/** Mistral probe **offset** host box at 1440×900 (type + padding, not painted rest). */
const PROBE_HOST_W = 924;
const PROBE_HOST_H = 396;
const PROBE_PIN = 900;
const PROBE_STICKY_H = 900;

describe("shipped Family A tokens", () => {
  test("intro ease/duration/stagger match skill", () => {
    expect(ease.standard).toBe("power4.inOut");
    expect(duration.intro).toBe(1);
    expect(stagger.charFactor).toBe(0.005);
    expect(stagger.line).toBe(0.7);
  });

  test("hero intro is play-once (not scroll-scrubbed)", () => {
    const src = readFileSync(
      join(import.meta.dir, "../src/lib/motion/timelines/hero-display-intro.ts"),
      "utf8",
    );
    expect(src).toContain("prefersReducedMotion");
    expect(src).toContain('y: "100%"');
    expect(src).not.toContain("scrollTrigger");
    expect(src).not.toContain("scrub");
  });
});

describe("reduced-motion branches exist on A/B/C shipped timelines", () => {
  test("each family timeline short-circuits scrub/split when reduced", () => {
    const root = join(import.meta.dir, "../src/lib/motion/timelines");
    for (const file of [
      "hero-display-intro.ts",
      "hero-sticky-scale.ts",
      "scroll-reveal-icons.ts",
    ]) {
      const src = readFileSync(join(root, file), "utf8");
      expect(src).toContain("prefersReducedMotion");
    }
  });
});

describe("shipped Family B hostTransformAtPinProgress", () => {
  test("exports probe scale bounds and power2.out ease token", () => {
    expect(HERO_STICKY_SCALE_FROM).toBeCloseTo(0.4664, 4);
    expect(HERO_STICKY_SCALE_TO).toBe(1);
    expect(HERO_HOST_EASE).toBe("power2.out");
    expect(hostEaseProgress(0)).toBe(0);
    expect(hostEaseProgress(1)).toBe(1);
    // power2.out mid is > linear mid
    expect(hostEaseProgress(0.5)).toBeCloseTo(0.75, 4);
  });

  test("host curve matches fixture scale+tx+ty at sample scrollYs (offset host box)", () => {
    const fixture = loadFixture();
    for (const row of fixture.familyB_hostTransform) {
      // Map scrollY to pin progress (scale phase ends ~900 on 900px pin)
      const progress = Math.min(1, row.scrollY / PROBE_PIN);
      const got = hostTransformAtPinProgress(progress, PROBE_HOST_W, PROBE_HOST_H);

      // After scale lock, fixture may still drift ty (pure translate) — only gate scale phase
      if (row.scrollY <= 900) {
        expect(got.scale).toBeCloseTo(row.scale, 2);
        // translate within ~12% of probe end magnitude (ratios + ease fit)
        const tolX = Math.max(12, Math.abs(row.translateX) * 0.12 + 8);
        const tolY = Math.max(12, Math.abs(row.translateY) * 0.12 + 8);
        expect(Math.abs(got.x - row.translateX)).toBeLessThan(tolX);
        expect(Math.abs(got.y - row.translateY)).toBeLessThan(tolY);
      }
    }
  });

  test("rest and end endpoints match skill mechanics (offset ratios)", () => {
    expect(HERO_HOST_X_END_RATIO).toBeCloseTo(258 / 924, 5);
    expect(HERO_HOST_Y_END_RATIO).toBeCloseTo(-252 / 396, 5);

    const rest = hostTransformAtPinProgress(0, PROBE_HOST_W, PROBE_HOST_H);
    expect(rest.scale).toBeCloseTo(0.4664, 4);
    expect(rest.x).toBeCloseTo(0, 10);
    expect(rest.y).toBeCloseTo(0, 10);

    const end = hostTransformAtPinProgress(1, PROBE_HOST_W, PROBE_HOST_H);
    expect(end.scale).toBe(1);
    expect(end.x).toBeCloseTo(258, 1);
    expect(end.y).toBeCloseTo(-252, 1);
    expect(end.y).toBeLessThan(0);
    expect(end.x).toBeGreaterThan(0);
  });

  test("Family B2 title exit clears upper band (≤ −50% sticky height)", () => {
    expect(HERO_TITLE_Y_END_RATIO).toBeLessThanOrEqual(-0.5);
    expect(titleExitYAtPinProgress(0, PROBE_STICKY_H)).toBeCloseTo(0, 10);
    expect(titleExitYAtPinProgress(1, PROBE_STICKY_H)).toBeLessThanOrEqual(-450);
    expect(titleExitYAtPinProgress(0.5, PROBE_STICKY_H)).toBeLessThan(0);
  });

  test("sentence translateX: outer lines move, middle stays 0", () => {
    const fixture = loadFixture();
    const at900 = fixture.familyB_sentenceTranslateX.find((r) => r.scrollY === 900)!;
    expect(HERO_LINE_X_END_RATIOS[1]).toBe(0);

    for (let i = 0; i < 3; i++) {
      const x = lineTranslateXAtPinProgress(1, PROBE_HOST_W, i);
      if (i === 1) {
        expect(x).toBe(0);
      } else {
        // ratios are of offset width; fixture lines are absolute px from Mistral
        expect(x).toBeCloseTo(at900.lines[i], 0);
      }
    }

    // Mid progress: outer > 0, middle 0
    expect(lineTranslateXAtPinProgress(0.5, PROBE_HOST_W, 0)).toBeGreaterThan(0);
    expect(lineTranslateXAtPinProgress(0.5, PROBE_HOST_W, 1)).toBe(0);
    expect(lineTranslateXAtPinProgress(0.5, PROBE_HOST_W, 2)).toBeGreaterThan(
      lineTranslateXAtPinProgress(0.5, PROBE_HOST_W, 0),
    );
  });
});

describe("shipped Family C pin window", () => {
  test("icon range sits inside pin and ends before scale lock fraction", () => {
    const fixture = loadFixture();
    const trigger = { offsetHeight: fixture.pin.heroMinHeightPx };
    const range = heroIconScrollRange(trigger, fixture.pin.stickyHeightPx);

    expect(range.travel).toBe(fixture.pin.pinTravelPx);
    expect(range.startPx).toBeGreaterThan(0);
    expect(range.endPx).toBeGreaterThan(range.startPx);
    expect(range.endPx).toBeLessThan(range.travel);

    // Shape vs rise window: start near leave-rest; end before scale locks (icons finish first)
    expect(range.startPx).toBeGreaterThanOrEqual(
      fixture.familyC_riseWindow.fullyClippedUntilScrollY - 50,
    );
    expect(range.startPx).toBeLessThanOrEqual(
      fixture.familyC_riseWindow.leaveRestApproxScrollY + 50,
    );
    expect(range.endPx).toBeGreaterThan(range.startPx + 100);
    expect(range.endPx).toBeLessThan(fixture.familyC_riseWindow.hostScaleLocksApproxScrollY);
    expect(range.endPx / range.travel).toBeLessThanOrEqual(0.8);

    expect(range.start).toMatch(/^top\+=\d+ top$/);
    expect(range.end).toMatch(/^top\+=\d+ top$/);

    expect(HERO_STICKY_SCROLL.iconsStartPin).toBeLessThan(HERO_STICKY_SCROLL.iconsEndPin);
    expect(HERO_STICKY_SCROLL.iconsEndPin).toBeLessThan(1);
    expect(SCROLL_REVEAL_ICONS_HERO.scrub).toBe(HERO_STICKY_SCROLL.scrub);
    expect(SCROLL_REVEAL_ICONS_HERO.stagger).toBeGreaterThan(0);
    expect(SCROLL_REVEAL_ICONS_DEFAULTS.start).toBe("top 75%");
  });

  test("pinTravelPx uses section minus viewport", () => {
    expect(pinTravelPx({ offsetHeight: 1800 }, 900)).toBe(900);
    expect(pinTravelPx({ offsetHeight: 100 }, 900)).toBe(1);
  });
});

describe("hero sticky shell layout (shipped markup)", () => {
  test("shell is fixed ~1 viewport under header; section is 200dvh track", () => {
    const hero = readFileSync(
      join(import.meta.dir, "../src/app/(home)/_components/hero-section.tsx"),
      "utf8",
    );
    // Tall pin distance on the SECTION only
    expect(hero).toContain("lg:min-h-[200dvh]");
    // Shell: sticky + capped height (no flex-1 growth into 200dvh)
    expect(hero).toContain('data-hero-motion="sticky-shell"');
    expect(hero).toContain("lg:sticky");
    expect(hero).toContain("lg:top-12");
    expect(hero).toContain("lg:h-[calc(100dvh-3rem)]");
    expect(hero).toContain("lg:max-h-[calc(100dvh-3rem)]");
    // Guard regression: sticky-shell className must not include flex-1
    const shellMatch = hero.match(
      /data-hero-motion="sticky-shell"[\s\S]*?className=\{([\s\S]*?)\}/,
    );
    expect(shellMatch).toBeTruthy();
    expect(shellMatch![1]).not.toContain("flex-1");
  });

  test("Family B host is in-flow type+pad (remap); title exit wired", () => {
    const hero = readFileSync(
      join(import.meta.dir, "../src/app/(home)/_components/hero-section.tsx"),
      "utf8",
    );
    expect(hero).toContain('data-hero-occupancy-strategy="in-flow-type-pad"');
    expect(hero).toContain('data-hero-motion="title-exit"');
    expect(hero).toContain("titleWrapRef");
    expect(hero).toContain("lg:overflow-x-hidden");
    // Reject absolute empty stage host regression
    expect(hero).not.toContain("lg:w-[64%]");
    expect(hero).not.toContain("lg:left-[70%]");
    expect(hero).not.toContain('sticky-stage"');
  });
});
