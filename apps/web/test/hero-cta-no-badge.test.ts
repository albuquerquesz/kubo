/**
 * Hero CTA ships without the "Stack em minutos" status chip.
 * Intro must not require a badge node (would leave content pending forever).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "..");

function readSrc(relative: string): string {
  return readFileSync(join(webRoot, relative), "utf8");
}

describe("hero CTA without status badge", () => {
  test("shipped CTASection has no Stack em minutos pill markup", () => {
    const hero = readSrc("src/components/ui/hero-dithering-card.tsx");

    expect(hero).not.toContain("Stack em minutos");
    expect(hero).not.toContain("badgeRef");
    expect(hero).not.toMatch(
      /animate-ping[\s\S]*Stack em minutos|Stack em minutos[\s\S]*animate-ping/,
    );

    // Content stack is title + body + CTA only.
    expect(hero).toContain("titleRef");
    expect(hero).toContain("bodyRef");
    expect(hero).toContain("ctaRef");
    expect(hero).toContain("playHeroContentIntro({ root, title, body, cta })");

    // Early return must not hard-require a badge node.
    expect(hero).toContain("if (!root || !title || !body || !cta) return");
    expect(hero).not.toContain("!badge");
  });

  test("playHeroContentIntro treats badge as optional", () => {
    const intro = readSrc("src/lib/motion/timelines/hero-content-intro.ts");

    expect(intro).toMatch(/badge\?:\s*HTMLElement\s*\|\s*null/);
    expect(intro).toContain("if (badge)");
    // Stack always includes title/body/cta even when badge is omitted.
    expect(intro).toContain("const stack = [title, body, cta, ...(badge ? [badge] : [])]");
    // Title can lead the timeline when there is no badge.
    expect(intro).toContain("const titleAt = badge ? 0.1 : 0");
  });
});
