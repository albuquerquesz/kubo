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
    expect(hero).toContain("KuboMark");
    expect(hero).not.toContain("/assets/kubo-mark.png");
    expect(hero).not.toContain("/assets/kubo.png");

    expect(hero).toContain("titleRef");
    expect(hero).toContain("bodyRef");
    expect(hero).toContain("ctaRef");
    expect(hero).toContain("playHeroContentIntro({ root, badge, title, body, cta })");

    expect(hero).toContain("if (!root || !badge || !title || !body || !cta) return");
  });

  test("playHeroContentIntro treats badge as optional", () => {
    const intro = readSrc("src/lib/motion/timelines/hero-content-intro.ts");

    expect(intro).toMatch(/badge\?:\s*HTMLElement\s*\|\s*null/);
    expect(intro).toContain("if (badge)");
    expect(intro).toContain("const stack = [title, body, cta, ...(badge ? [badge] : [])]");
    expect(intro).toContain("const titleAt = badge ? 0.1 : 0");
  });
});
