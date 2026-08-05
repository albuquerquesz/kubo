import { describe, expect, test } from "bun:test";

import { getKuboEyeRect, getKuboEyeState } from "../src/compositions/kubo-launch/lib/kubo-blink";
import {
  getKuboIdlePose,
  getKuboVerticalOffset,
  KUBO_IDLE,
} from "../src/compositions/kubo-launch/lib/kubo-idle";
import { KUBO_MARK_EYE_LEFT } from "../src/compositions/kubo-launch/lib/mark-paths";

describe("Kubo blink", () => {
  test("keeps the eyes open outside the blink beats", () => {
    expect(getKuboEyeState(0)).toBe("open");
    expect(getKuboEyeState(80)).toBe("open");
  });

  test("uses a short closing, closed, and opening sequence", () => {
    expect(getKuboEyeState(45)).toBe("closing");
    expect(getKuboEyeState(46)).toBe("closed");
    expect(getKuboEyeState(47)).toBe("closed");
    expect(getKuboEyeState(48)).toBe("opening");
    expect(getKuboEyeState(49)).toBe("open");
    expect(getKuboEyeState(95)).toBe("closing");
    expect(getKuboEyeState(98)).toBe("opening");
    expect(getKuboEyeState(145)).toBe("closing");
    expect(getKuboEyeState(195)).toBe("closing");
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

describe("Kubo pixel idle", () => {
  test("holds each leg pose for the configured frame range", () => {
    const expected = [
      ...Array(18).fill("rest"),
      ...Array(6).fill("rise"),
      ...Array(18).fill("rest"),
      ...Array(6).fill("fall"),
    ];

    expect(expected).toHaveLength(KUBO_IDLE.cycleFrames);
    expect(expected.map((_, frame) => getKuboIdlePose(frame))).toEqual(expected);
  });

  test("uses a larger vertical pixel offset without changing the x position", () => {
    expect(getKuboVerticalOffset("rest")).toBe(0);
    expect(getKuboVerticalOffset("rise")).toBe(-18);
    expect(getKuboVerticalOffset("fall")).toBe(18);
  });

  test("repeats without changing the cycle", () => {
    for (let frame = 0; frame < KUBO_IDLE.cycleFrames; frame += 1) {
      expect(getKuboIdlePose(frame + KUBO_IDLE.cycleFrames)).toBe(getKuboIdlePose(frame));
    }
  });
});
