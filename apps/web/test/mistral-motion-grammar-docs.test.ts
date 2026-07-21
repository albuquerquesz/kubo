/**
 * Durable proof for the Mistral motion grammar skill + change-map spec.
 * Drives real repo files and the canonical probe fixture (not re-implemented math).
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "../../..");
const fixturePath = join(import.meta.dir, "fixtures/mistral-motion-probe-sample.json");

function readRepo(rel: string): string {
  const path = join(repoRoot, rel);
  expect(existsSync(path)).toBe(true);
  return readFileSync(path, "utf8");
}

type ProbeSample = {
  date: string;
  familyB_sectionScale: Array<{ scrollY: number; scale: number }>;
  familyB_hostTransform?: Array<{
    scrollY: number;
    scale: number;
    translateX: number;
    translateY: number;
  }>;
  familyB_sentenceTranslateX?: Array<{ scrollY: number; lines: number[] }>;
  familyC_iconYPercent: Array<{ scrollY: number; icons: number[] }>;
  familyC_riseWindow?: {
    fullyClippedUntilScrollY: number;
    leaveRestApproxScrollY: number;
    nearDoneUnder5PercentScrollY: number;
    doneApproxScrollY: number;
    hostScaleLocksApproxScrollY: number;
  };
};

function loadFixture(): ProbeSample {
  expect(existsSync(fixturePath)).toBe(true);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as ProbeSample;
}

/** Skill mentions a numeric probe value (full or 2-decimal short form). */
function skillMentionsProbeValue(skill: string, value: number, decimals = 2): boolean {
  const rounded = value.toFixed(decimals);
  const compact = String(value);
  return (
    skill.includes(rounded) || skill.includes(compact) || skill.includes(String(Math.round(value)))
  );
}

describe("mistral-motion-grammar skill", () => {
  const skill = readRepo(".agents/skills/mistral-motion-grammar/SKILL.md");

  test("covers text and scroll families with measurable params", () => {
    expect(skill).toContain("Family A");
    expect(skill).toContain("Family B");
    expect(skill).toContain("Family C");
    expect(skill).toContain("y: 100%");
    expect(skill).toContain("power4.inOut");
    expect(skill).toContain("yPercent");
    expect(skill).toContain("overflow");
    expect(skill).toMatch(/scrub/i);
    expect(skill).toMatch(/0\.47|0\.4664/);
    expect(skill).toMatch(/reduced motion/i);
    // Compound host transform (not scale-only)
    expect(skill).toMatch(/translateX|translate/i);
    expect(skill).toMatch(/Not scale alone|scale \+ translate|compound transform/i);
  });

  test("forbids shipping Mistral brand assets", () => {
    expect(skill.toLowerCase()).toMatch(/not in scope|never|do not/);
    expect(skill).toMatch(/ALTMistral|CMS SVG|bag\.svg|brand/i);
    expect(skill).toContain("GSAP");
    expect(skill).toContain("2026-07-20");
  });

  test("Family B/C probe samples match canonical fixture (not contradicted)", () => {
    const fixture = loadFixture();
    expect(fixture.date).toBe("2026-07-20");

    // Family B scales must appear in skill
    for (const row of fixture.familyB_sectionScale) {
      expect(skill).toContain(String(row.scale));
    }

    // Host end translate (~258 / ~-252) documented
    expect(skill).toMatch(/258/);
    expect(skill).toMatch(/-252|−252/);

    // Key Family C rows: rest, mid-rise at 300, done by 800
    const byY = Object.fromEntries(fixture.familyC_iconYPercent.map((r) => [r.scrollY, r.icons]));
    expect(byY[0]).toEqual([100, 100, 100]);
    expect(byY[150]).toEqual([100, 100, 100]);

    // Mid-rise: first icon leads (lower Y% than third)
    expect(byY[300][0]).toBeLessThan(byY[300][2]);
    expect(skillMentionsProbeValue(skill, byY[300][0], 2)).toBe(true); // 36.40
    expect(skillMentionsProbeValue(skill, byY[300][1], 2)).toBe(true);
    expect(skillMentionsProbeValue(skill, byY[300][2], 2)).toBe(true);

    // Done by 800 (0 residual) — skill must NOT claim ~83% mid-rise at 900
    expect(byY[800][0]).toBeLessThan(5);
    expect(skill).not.toMatch(/83\s*%/);
    expect(skill).not.toMatch(/~83/);

    // Stale mid-curve must not reappear as current truth
    expect(skill).not.toContain("54.91");
    expect(skill).not.toContain("72.23");
    expect(skill).not.toContain("93.67");

    // Explicit scrollY markers from fixture
    for (const y of [0, 150, 300, 450, 600, 800, 1000]) {
      expect(skill).toContain(String(y));
    }
  });

  test("documents sentence translateX and scale non-linearity", () => {
    expect(skill).toMatch(/sentence|line index|middle line/i);
    expect(skill).toMatch(/not linear/i);
    expect(skill).toMatch(/bottom left|origin-bottom-left|transform-origin/i);
  });
});

describe("spec-mistral-identical-home-motion change map", () => {
  const spec = readRepo("docs/spec-mistral-identical-home-motion.md");

  test("links skill and maps each family to Kubo paths", () => {
    expect(spec).toContain("mistral-motion-grammar");
    expect(spec).toContain("hero-display-title.tsx");
    expect(spec).toContain("hero-display-intro.ts");
    expect(spec).toContain("hero-section.tsx");
    expect(spec).toContain("scroll-reveal-icons");
    expect(spec).toContain("hero-sticky-scale");
    expect(spec).toMatch(/0\.47|scale/);
    expect(spec).toMatch(/yPercent|100/);
    expect(spec).toMatch(/power4\.inOut|play-once|scrub/);
    expect(spec).toMatch(/translate/i);
  });

  test("states brand-safe identical mechanics split", () => {
    expect(spec).toMatch(/Identical ≠ brand|not.*brand clone|Forbidden/i);
  });

  test("Family C Current distinguishes module defaults vs hero wiring", () => {
    expect(spec).toContain("Module defaults");
    expect(spec).toContain("top 75%");
    expect(spec).toContain("top 35%");
    expect(spec).toContain("Hero wiring");
    expect(spec).toContain("top top");
    expect(spec).toMatch(/sticky pin|Family B sticky|HERO_STICKY|SCROLL_REVEAL_ICONS_HERO/i);
  });

  test("Family B required includes compound translate not scale-only", () => {
    expect(spec).toMatch(/translateX|translateY|translate/i);
    expect(spec).toMatch(/scale-only|Not scale alone|compound|scale \+ translate/i);
  });
});

describe("shipped motion tokens match skill Family A", () => {
  test("eases.ts exports identical duration/ease/stagger numbers", async () => {
    const mod = await import("../src/lib/motion/eases.ts");
    expect(mod.ease.standard).toBe("power4.inOut");
    expect(mod.duration.intro).toBe(1);
    expect(mod.stagger.charFactor).toBe(0.005);
    expect(mod.stagger.line).toBe(0.7);
    expect(mod.duration.lineGrow).toBe(1.3);
  });

  test("hero-display-intro uses y 100% rise and skill eases", () => {
    const src = readRepo("apps/web/src/lib/motion/timelines/hero-display-intro.ts");
    expect(src).toContain('y: "100%"');
    expect(src).toContain("duration.intro");
    expect(src).toContain("ease.standard");
    expect(src).toContain("prefersReducedMotion");
  });

  test("scroll-reveal-icons timeline defaults + hero pin window", () => {
    const timeline = readRepo("apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts");
    expect(timeline).toContain("yPercent: 100");
    expect(timeline).toContain("yPercent: 0");
    expect(timeline).toContain("scrub");
    expect(timeline).toContain('ease: "none"');
    expect(timeline).toContain('start: "top 75%"');
    expect(timeline).toContain('end: "top 35%"');
    expect(timeline).toContain("SCROLL_REVEAL_ICONS_HERO");
    expect(timeline).toContain("playHeroScrollRevealIcons");
    expect(timeline).toContain("pinTravelPx");

    const component = readRepo("apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx");
    expect(component).toContain("size-14");
    expect(component).toContain("overflow-hidden");
    expect(component).toContain("getIcons");

    const hero = readRepo("apps/web/src/app/(home)/_components/hero-section.tsx");
    expect(hero).toContain("playHeroScrollRevealIcons");
  });

  test("hero-sticky-scale ships Family B compound scale+translate tokens", () => {
    const src = readRepo("apps/web/src/lib/motion/timelines/hero-sticky-scale.ts");
    expect(src).toContain("HERO_STICKY_SCALE_FROM = 0.4664");
    expect(src).toContain("HERO_STICKY_SCALE_TO = 1");
    expect(src).toContain('transformOrigin: "bottom left"');
    expect(src).toContain("HERO_HOST_EASE");
    expect(src).toContain("power2.out");
    expect(src).toContain("HERO_HOST_X_END_RATIO");
    expect(src).toContain("HERO_HOST_Y_END_RATIO");
    expect(src).toContain("HERO_LINE_X_END_RATIOS");
    expect(src).toContain("HERO_STAGE_HOST_WIDTH_SHARE");
    expect(src).toContain("hostEndTranslateForStage");
    expect(src).toContain("prefersReducedMotion");
    expect(src).toContain("matchMedia");
    expect(src).toContain("playHeroStickyScale");
    expect(src).toContain("hostTransformAtPinProgress");

    const hero = readRepo("apps/web/src/app/(home)/_components/hero-section.tsx");
    expect(hero).toContain("lg:min-h-[200dvh]");
    expect(hero).toContain("lg:sticky");
    expect(hero).toContain("playHeroStickyScale");
    expect(hero).toContain("origin-bottom-left");
    expect(hero).toContain("sentences");
    expect(hero).toContain("mission-line");
    // Sticky shell must be ~1 viewport — not flex-1 into the 200dvh track
    expect(hero).toContain('data-hero-motion="sticky-shell"');
    expect(hero).toContain("lg:h-[calc(100dvh-3rem)]");
    expect(hero).toContain("lg:max-h-[calc(100dvh-3rem)]");
    expect(hero).not.toMatch(/sticky-shell[\s\S]{0,200}flex-1/);
  });

  test("motion index exports sticky scale + scroll icons helpers", () => {
    const index = readRepo("apps/web/src/lib/motion/index.ts");
    expect(index).toContain("playHeroStickyScale");
    expect(index).toContain("HERO_STICKY_SCROLL");
    expect(index).toContain("playScrollRevealIcons");
    expect(index).toContain("playHeroScrollRevealIcons");
    expect(index).toContain("hostTransformAtPinProgress");
    expect(index).toContain("ScrollTrigger");
  });
});

describe("canonical probe fixture integrity", () => {
  test("fixture scale and icon samples are internally consistent with probe physics", () => {
    const fixture = loadFixture();
    // Scale rises monotonically toward 1
    const scales = fixture.familyB_sectionScale.map((r) => r.scale);
    for (let i = 1; i < scales.length; i++) {
      expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1] - 1e-9);
    }
    expect(scales[0]).toBeCloseTo(0.4664, 4);
    expect(scales.at(-1)).toBe(1.0);

    // Host transform includes non-zero translate mid-pin
    expect(fixture.familyB_hostTransform?.length).toBeGreaterThan(3);
    const at900 = fixture.familyB_hostTransform?.find((r) => r.scrollY === 900);
    expect(at900?.scale).toBe(1);
    expect(at900?.translateX).toBeGreaterThan(200);
    expect(at900?.translateY).toBeLessThan(-200);

    // Sentence: middle line stays ~0; outer lines positive at end
    const sentEnd = fixture.familyB_sentenceTranslateX?.find((r) => r.scrollY === 900);
    expect(sentEnd?.lines[1]).toBe(0);
    expect(sentEnd!.lines[0]).toBeGreaterThan(0);
    expect(sentEnd!.lines[2]).toBeGreaterThan(sentEnd!.lines[0]);

    // Icons leave 100% after 150 and first icon always ≤ third (stagger lag)
    for (const row of fixture.familyC_iconYPercent) {
      if (row.scrollY <= 150) {
        expect(row.icons.every((y) => y === 100)).toBe(true);
      } else {
        expect(row.icons[0]).toBeLessThanOrEqual(row.icons[2] + 1e-6);
      }
    }
    const at800 = fixture.familyC_iconYPercent.find((r) => r.scrollY === 800)!;
    expect(at800.icons[0]).toBeLessThan(5);
    expect(at800.icons.every((y) => y === 0)).toBe(true);

    // Rise window: icons done before scale locks
    const win = fixture.familyC_riseWindow!;
    expect(win.doneApproxScrollY).toBeLessThan(win.hostScaleLocksApproxScrollY);
    expect(win.leaveRestApproxScrollY).toBeGreaterThan(win.fullyClippedUntilScrollY);
  });
});
