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
  familyC_iconYPercent: Array<{ scrollY: number; icons: number[] }>;
};

function loadFixture(): ProbeSample {
  expect(existsSync(fixturePath)).toBe(true);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as ProbeSample;
}

/** First matching number cell after a scrollY marker in a markdown table row. */
function skillMentionsProbeValue(skill: string, value: number, decimals = 2): boolean {
  // Skill tables use shortened forms like 54.91 from 54.9058
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

    // Key Family C rows: rest, mid-rise at 300, near-done at 800
    const byY = Object.fromEntries(fixture.familyC_iconYPercent.map((r) => [r.scrollY, r.icons]));
    expect(byY[0]).toEqual([100, 100, 100]);
    expect(byY[150]).toEqual([100, 100, 100]);

    // Mid-rise: first icon leads (lower Y% than third)
    expect(byY[300][0]).toBeLessThan(byY[300][2]);
    expect(skillMentionsProbeValue(skill, byY[300][0], 2)).toBe(true); // 54.91
    expect(skillMentionsProbeValue(skill, byY[300][1], 2)).toBe(true);
    expect(skillMentionsProbeValue(skill, byY[300][2], 2)).toBe(true);

    // Near fully visible by 800 — skill must NOT claim ~83% mid-rise at 900
    expect(byY[800][0]).toBeLessThan(5);
    expect(skillMentionsProbeValue(skill, byY[800][0], 2)).toBe(true); // 2.74
    expect(skill).not.toMatch(/83\s*%/);
    expect(skill).not.toMatch(/~83/);

    // Explicit scrollY markers from fixture
    for (const y of [0, 150, 300, 450, 600, 800, 1000]) {
      expect(skill).toContain(String(y));
    }
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
    expect(spec).toContain("center top");
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

  test("scroll-reveal-icons timeline defaults + hero wiring overrides", () => {
    const timeline = readRepo("apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts");
    expect(timeline).toContain("yPercent: 100");
    expect(timeline).toContain("yPercent: 0");
    expect(timeline).toContain("scrub");
    expect(timeline).toContain('ease: "none"');
    expect(timeline).toContain('start = "top 75%"');
    expect(timeline).toContain('end = "top 35%"');

    const component = readRepo("apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx");
    expect(component).toContain('"top top"');
    expect(component).toContain('"center top"');
    expect(component).toContain("usingSectionTrigger");
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
  });
});
