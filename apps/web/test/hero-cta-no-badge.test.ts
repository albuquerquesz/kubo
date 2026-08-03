/**
 * Hero CTA ships the transparent Kubo mascot (not the "Stack em minutos" pill).
 * Intro animates the mascot node via the optional badge slot.
 */
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

    // Mascot mark (no plate) in the former badge slot.
    expect(hero).toContain("badgeRef");
    expect(hero).toContain("/assets/kubo-mark.png");
    expect(hero).not.toContain("/assets/kubo.png");

    // Content stack is mascot + title + body + CTA.
    expect(hero).toContain("titleRef");
    expect(hero).toContain("bodyRef");
    expect(hero).toContain("ctaRef");
    expect(hero).toContain("playHeroContentIntro({ root, badge, title, body, cta })");

    // Intro waits on the mascot node as the badge slot.
    expect(hero).toContain("if (!root || !badge || !title || !body || !cta) return");
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
