import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "..");

function readSrc(relative: string): string {
  return readFileSync(join(webRoot, relative), "utf8");
}

describe("hero CTA with animated Kubo mark", () => {
  test("shipped CTASection wires KuboMarkMotion above the title (no pill badge)", () => {
    const hero = readSrc("src/components/ui/hero-dithering-card.tsx");

    expect(hero).not.toContain("Stack em minutos");
    expect(hero).not.toMatch(
      /animate-ping[\s\S]*Stack em minutos|Stack em minutos[\s\S]*animate-ping/,
    );

    expect(hero).toContain("KuboMarkMotion");
    expect(hero).toContain('from "@/components/brand/kubo-mark-motion"');
    expect(hero).toContain("markRef");
    expect(hero).toContain("badgeRef");
    expect(hero).toContain("celebrate()");
    expect(hero).not.toContain("/assets/kubo-mark.png");
    expect(hero).not.toContain("/assets/kubo.png");

    expect(hero).toContain("titleRef");
    expect(hero).toContain("bodyRef");
    expect(hero).toContain("ctaRef");
    expect(hero).toContain("playHeroContentIntro({ root, badge, title, body, cta })");
    expect(hero).toContain("if (!root || !badge || !title || !body || !cta) return");
  });

  test("KuboMarkMotion keeps video blink + celebrate + reduced motion", () => {
    const motion = readSrc("src/components/brand/kubo-mark-motion.tsx");
    const mark = readSrc("src/components/brand/kubo-mark.tsx");
    const celebrate = readSrc("src/lib/motion/timelines/kubo-mark-celebrate.ts");
    const paths = readSrc("src/lib/motion/timelines/kubo-mark-paths.ts");

    expect(motion).toContain("playKuboMarkCelebrate");
    expect(motion).toContain("prefersReducedMotion");
    expect(motion).toContain("repeatDelay: 2.5");
    expect(motion).toContain("eyeLeftRef");
    expect(motion).toContain("eyeRightRef");
    expect(motion).toContain("clipPath");
    expect(motion).toContain("KUBO_MARK_BODY_PATH");
    expect(motion).toContain("KUBO_MARK_LEG_LEFT_PATH");
    expect(mark).not.toContain("playKuboMarkIdle");
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

  test("site header BrandMark uses KuboMark, not wordmark text", () => {
    const header = readSrc("src/components/site/site-header.tsx");

    expect(header).toContain("KuboMark");
    expect(header).toContain('from "@/components/brand/kubo-mark"');
    expect(header).not.toMatch(/>\s*kubojs\s*</);
  });
});
