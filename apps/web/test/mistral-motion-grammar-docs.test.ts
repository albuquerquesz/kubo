/**
 * Durable proof for the Mistral motion grammar skill + change-map spec.
 * Drives real repo files (not re-implemented parameters).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "../../..");

function readRepo(rel: string): string {
  const path = join(repoRoot, rel);
  expect(existsSync(path)).toBe(true);
  return readFileSync(path, "utf8");
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
    // measurable outcomes, not vague polish
    expect(spec).toMatch(/0\.47|scale/);
    expect(spec).toMatch(/yPercent|100/);
    expect(spec).toMatch(/power4\.inOut|play-once|scrub/);
  });

  test("states brand-safe identical mechanics split", () => {
    expect(spec).toMatch(/Identical ≠ brand|not.*brand clone|Forbidden/i);
  });
});

describe("shipped motion tokens match skill Family A", () => {
  test("eases.ts exports identical duration/ease/stagger numbers", async () => {
    // Import real module (shipped entry), not a hard-coded reimplementation
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

  test("scroll-reveal-icons timeline uses yPercent 100→0 scrub", () => {
    const src = readRepo("apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts");
    expect(src).toContain("yPercent: 100");
    expect(src).toContain("yPercent: 0");
    expect(src).toContain("scrub");
    expect(src).toContain('ease: "none"');
    expect(src).toContain("ScrollTrigger");
  });
});
