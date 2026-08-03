import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "..");

function readSrc(relative: string): string {
  return readFileSync(join(webRoot, relative), "utf8");
}

describe("hero CTA mascot above title", () => {
  test("shipped CTASection uses transparent mascot, not Stack em minutos pill", () => {
    const hero = readSrc("src/components/ui/hero-dithering-card.tsx");

    expect(hero).not.toContain("Stack em minutos");
    expect(hero).not.toMatch(
      /animate-ping[\s\S]*Stack em minutos|Stack em minutos[\s\S]*animate-ping/,
    );

    expect(hero).toContain("badgeRef");
    expect(hero).toContain("KuboMarkMotion");
    expect(hero).toContain("markRef");
    expect(hero).toContain("celebrate()");
    expect(hero).not.toContain("/assets/kubo-mark.png");
    expect(hero).not.toContain("/assets/kubo.png");

    expect(hero).toContain("titleRef");
    expect(hero).toContain("bodyRef");
    expect(hero).toContain("ctaRef");
    expect(hero).toContain("playHeroContentIntro({ root, badge, title, body, cta })");

    expect(hero).toContain("if (!root || !badge || !title || !body || !cta) return");
  });

  test("hero mark motion layers idle and celebrate without animating static brand mark", () => {
    const motion = readSrc("src/components/brand/kubo-mark-motion.tsx");
    const mark = readSrc("src/components/brand/kubo-mark.tsx");
    const idle = readSrc("src/lib/motion/timelines/kubo-mark-idle.ts");
    const celebrate = readSrc("src/lib/motion/timelines/kubo-mark-celebrate.ts");
    const paths = readSrc("src/lib/motion/timelines/kubo-mark-paths.ts");

    expect(motion).toContain("playKuboMarkIdle");
    expect(motion).toContain("playKuboMarkCelebrate");
    expect(motion).toContain("prefersReducedMotion");
    expect(motion).toContain("legLeftRef");
    expect(motion).toContain("legRightRef");
    expect(motion).toContain("bodyRef");
    expect(motion).toContain("clipPath");
    expect(motion).toContain("KUBO_MARK_BODY_PATH");
    expect(motion).toContain("KUBO_MARK_LEG_LEFT_PATH");
    expect(mark).not.toContain("playKuboMarkIdle");
    expect(idle).toContain("repeat: -1");
    expect(idle).toContain("KUBO_MARK_SVG_ORIGIN");
    expect(idle).toContain("KuboMarkIdleTargets");
    expect(idle).toContain("legLeft");
    expect(idle).toContain("svgOrigin");
    expect(paths).toContain("KUBO_MARK_BODY_PATH");
    expect(paths).toContain("KUBO_MARK_LEG_LEFT_PATH");
    expect(paths).toContain("KUBO_MARK_LEG_RIGHT_PATH");
    expect(celebrate).toContain("scale: 1.12");
  });

  test("playHeroContentIntro treats badge as optional", () => {
    const intro = readSrc("src/lib/motion/timelines/hero-content-intro.ts");

    expect(intro).toMatch(/badge\?:\s*HTMLElement\s*\|\s*null/);
    expect(intro).toContain("if (badge)");
    expect(intro).toContain("const stack = [title, body, cta, ...(badge ? [badge] : [])]");
    expect(intro).toContain("const titleAt = badge ? 0.1 : 0");
  });
});
