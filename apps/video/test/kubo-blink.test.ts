import { describe, expect, test } from "bun:test";

import { getKuboEyeRect, getKuboEyeState } from "../src/compositions/kubo-launch/lib/kubo-blink";
import { getKuboScale, KUBO_PULSE } from "../src/compositions/kubo-launch/lib/kubo-pulse";
import { KUBO_MARK_EYE_LEFT } from "../src/compositions/kubo-launch/lib/mark-paths";

describe("Kubo blink", () => {
  test("keeps the eyes open outside the blink beats", () => {
    expect(getKuboEyeState(0)).toBe("open");
    expect(getKuboEyeState(80)).toBe("open");
  });

  test("uses a short closing, closed, and opening sequence", () => {
    expect(getKuboEyeState(71)).toBe("closing");
    expect(getKuboEyeState(72)).toBe("closed");
    expect(getKuboEyeState(73)).toBe("closed");
    expect(getKuboEyeState(74)).toBe("opening");
    expect(getKuboEyeState(75)).toBe("open");
  });

  test("snaps the eyelid between open and closed pixel states", () => {
    expect(getKuboEyeRect(KUBO_MARK_EYE_LEFT, "closing")).toEqual({
      x: 213,
      y: 331,
      width: 85,
      height: 8,
    });
    expect(getKuboEyeRect(KUBO_MARK_EYE_LEFT, "closed")).toEqual({
      x: 213,
      y: 331,
      width: 85,
      height: 8,
    });
    expect(getKuboEyeRect(KUBO_MARK_EYE_LEFT, "opening")).toEqual(KUBO_MARK_EYE_LEFT);
  });
});

describe("Kubo presence pulse", () => {
  test("holds discrete scale states instead of interpolating", () => {
    const expected = [
      ...Array(8).fill(0.96),
      ...Array(4).fill(0.98),
      ...Array(4).fill(1.02),
      ...Array(8).fill(1.04),
      ...Array(4).fill(1.02),
      ...Array(4).fill(0.98),
      ...Array(16).fill(0.96),
    ];

    expect(expected).toHaveLength(KUBO_PULSE.cycleFrames);
    expect(expected.map((_, frame) => getKuboScale(frame))).toEqual(expected);
  });

  test("repeats without leaving the configured range", () => {
    for (let frame = 0; frame < KUBO_PULSE.cycleFrames * 4; frame += 1) {
      const scale = getKuboScale(frame);
      expect(scale).toBeGreaterThanOrEqual(KUBO_PULSE.minScale);
      expect(scale).toBeLessThanOrEqual(KUBO_PULSE.maxScale);
    }
  });

  test("repeats the same stepped cycle", () => {
    for (let frame = 0; frame < KUBO_PULSE.cycleFrames; frame += 1) {
      expect(getKuboScale(frame + KUBO_PULSE.cycleFrames)).toBe(getKuboScale(frame));
    }
  });
});
