/**
 * Guards alignment between the square CLI-perch promo grammar
 * (skill `kubo-square-cli-perch`) and the shipped kubo-launch composition.
 *
 * Fixture = measured reference (1080² / 6s / 30fps).
 * Live source = apps/video timing + layout constants.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CLI_PHASES,
  LAUNCH_DURATION_FRAMES,
  LAUNCH_FPS,
  LAUNCH_HEIGHT,
  LAUNCH_WIDTH,
  SQUARE_LAYOUT,
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
  });
});

describe("kubo-launch matches square CLI-perch contract", () => {
  test("canvas is 1080×1080 @ 6s 30fps (matches reference)", () => {
    const meta = readJson<CanonicalMeta>("references/canonical-meta.json");

    expect(LAUNCH_FPS).toBe(30);
    expect(LAUNCH_WIDTH).toBe(1080);
    expect(LAUNCH_HEIGHT).toBe(1080);
    expect(LAUNCH_DURATION_FRAMES).toBe(6 * LAUNCH_FPS);
    expect(LAUNCH_WIDTH).toBe(meta.width);
    expect(LAUNCH_HEIGHT).toBe(meta.height);
    expect(LAUNCH_WIDTH / LAUNCH_HEIGHT).toBe(1);
    expect(LAUNCH_DURATION_FRAMES / LAUNCH_FPS).toBe(meta.duration_s);
  });

  test("layout tokens sit in skill ranges (panel top, mark size)", () => {
    // Panel top ≈ 31–36% of height
    const panelTopPct = (SQUARE_LAYOUT.panelTop / LAUNCH_HEIGHT) * 100;
    expect(panelTopPct).toBeGreaterThanOrEqual(31);
    expect(panelTopPct).toBeLessThanOrEqual(36);

    // Panel left inset ≈ 5–8%
    const insetPct = (SQUARE_LAYOUT.insetX / LAUNCH_WIDTH) * 100;
    expect(insetPct).toBeGreaterThanOrEqual(5);
    expect(insetPct).toBeLessThanOrEqual(8);

    // Mark width ≈ 10–13% of canvas
    const markPct = (SQUARE_LAYOUT.markWidth / LAUNCH_WIDTH) * 100;
    expect(markPct).toBeGreaterThanOrEqual(10);
    expect(markPct).toBeLessThanOrEqual(13);

    // Mark right inset ~6–10%
    const markRightPct = (SQUARE_LAYOUT.markRight / LAUNCH_WIDTH) * 100;
    expect(markRightPct).toBeGreaterThanOrEqual(6);
    expect(markRightPct).toBeLessThanOrEqual(12);
  });

  test("CLI phases fit 6s and surface selection by mid-clip", () => {
    expect(CLI_PHASES.webAt).toBeLessThan(LAUNCH_DURATION_FRAMES);
    expect(CLI_PHASES.projectTypeAt).toBeLessThanOrEqual(LAUNCH_DURATION_FRAMES / 2);
    expect(CLI_PHASES.projectTypeAt).toBe(CLI_PHASES.nameSubmitted);
    expect(CLI_PHASES.webAt).toBe(CLI_PHASES.projectTypeSubmitted);
  });
});
