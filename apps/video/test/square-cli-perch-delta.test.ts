/**
 * Guards the documented delta between the square CLI-perch promo grammar
 * (skill `kubo-square-cli-perch`) and the current kubo-launch composition.
 *
 * Fixture = measured reference (1080² / 6s / 30fps).
 * Live source = apps/video timing constants (not re-implemented here).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LAUNCH_DURATION_FRAMES,
  LAUNCH_FPS,
  LAUNCH_HEIGHT,
  LAUNCH_WIDTH,
} from "../src/compositions/kubo-launch/lib/timing";

const skillRoot = join(import.meta.dir, "../../../.agents/skills/kubo-square-cli-perch");

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(skillRoot, rel), "utf8")) as T;
}

type CanonicalMeta = {
  width: number;
  height: number;
  duration_s: number;
  fps: string;
  nb_frames: string;
  dar?: string;
};

type PlaywrightMeta = {
  meta: { videoWidth: number; videoHeight: number; duration: number };
};

describe("kubo-square-cli-perch reference fixture", () => {
  test("canonical meta is square 1080 @ 6s 30fps", () => {
    const meta = readJson<CanonicalMeta>("references/canonical-meta.json");
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1080);
    expect(meta.width / meta.height).toBe(1);
    expect(meta.duration_s).toBe(6);
    expect(meta.fps).toBe("30/1");
    expect(Number(meta.nb_frames)).toBe(180);
  });

  test("Playwright analysis agrees with canonical canvas", () => {
    const pw = readJson<PlaywrightMeta>("references/playwright-analysis.json");
    expect(pw.meta.videoWidth).toBe(1080);
    expect(pw.meta.videoHeight).toBe(1080);
    expect(pw.meta.duration).toBe(6);
  });

  test("SKILL.md documents 1080×1080 and forbids Claude brand shipping", () => {
    const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");
    expect(skill).toContain("name: kubo-square-cli-perch");
    expect(skill).toMatch(/1080\s*[×x]\s*1080/);
    expect(skill.toLowerCase()).toContain("never");
    expect(skill).toMatch(/Claude|Anthropic/);
    expect(skill).toContain("1920");
    expect(skill).toContain("16:9");
  });
});

describe("kubo-launch timing vs square reference (delta)", () => {
  test("current launch is landscape 1920×1080 @ 8s — not the square reference", () => {
    const meta = readJson<CanonicalMeta>("references/canonical-meta.json");

    // Drive real shipped constants
    expect(LAUNCH_FPS).toBe(30);
    expect(LAUNCH_WIDTH).toBe(1920);
    expect(LAUNCH_HEIGHT).toBe(1080);
    expect(LAUNCH_DURATION_FRAMES).toBe(8 * LAUNCH_FPS);

    // Documented mismatch agents must not paper over
    expect(LAUNCH_WIDTH).not.toBe(meta.width);
    expect(LAUNCH_WIDTH / LAUNCH_HEIGHT).toBeCloseTo(16 / 9, 5);
    expect(meta.width / meta.height).toBe(1);
    expect(LAUNCH_DURATION_FRAMES / LAUNCH_FPS).toBe(8);
    expect(meta.duration_s).toBe(6);
  });
});
