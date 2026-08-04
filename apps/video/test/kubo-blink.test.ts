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

  test("keeps a closed eye centered on the original eye box", () => {
    expect(getKuboEyeRect(KUBO_MARK_EYE_LEFT, "closed")).toEqual({
      x: 213,
      y: 331,
      width: 85,
      height: 8,
    });
  });
});

describe("Kubo presence pulse", () => {
  test("scales from the minimum to the maximum and back", () => {
    expect(getKuboScale(0)).toBeCloseTo(KUBO_PULSE.minScale);
    expect(getKuboScale(KUBO_PULSE.cycleFrames / 4)).toBeCloseTo(1);
    expect(getKuboScale(KUBO_PULSE.cycleFrames / 2)).toBeCloseTo(KUBO_PULSE.maxScale);
    expect(getKuboScale((KUBO_PULSE.cycleFrames * 3) / 4)).toBeCloseTo(1);
    expect(getKuboScale(KUBO_PULSE.cycleFrames)).toBeCloseTo(KUBO_PULSE.minScale);
  });

  test("repeats without leaving the configured range", () => {
    for (let frame = 0; frame < KUBO_PULSE.cycleFrames * 4; frame += 1) {
      const scale = getKuboScale(frame);
      expect(scale).toBeGreaterThanOrEqual(KUBO_PULSE.minScale);
      expect(scale).toBeLessThanOrEqual(KUBO_PULSE.maxScale);
    }
  });
});
