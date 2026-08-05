import { describe, expect, test } from "bun:test";

import { getKuboEyeRect, getKuboEyeState } from "../src/compositions/kubo-launch/lib/kubo-blink";
import {
  getKuboIdlePose,
  getKuboLegOffsets,
  KUBO_IDLE,
} from "../src/compositions/kubo-launch/lib/kubo-idle";
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

describe("Kubo pixel idle", () => {
  test("holds each leg pose for the configured frame range", () => {
    const expected = [
      ...Array(10).fill("rest"),
      ...Array(4).fill("left-step"),
      ...Array(10).fill("rest"),
      ...Array(4).fill("right-step"),
    ];

    expect(expected).toHaveLength(KUBO_IDLE.cycleFrames);
    expect(expected.map((_, frame) => getKuboIdlePose(frame))).toEqual(expected);
  });

  test("moves only one side outward in each step pose", () => {
    expect(getKuboLegOffsets("rest")).toEqual({ left: 0, right: 0 });
    expect(getKuboLegOffsets("left-step")).toEqual({ left: -8, right: 5 });
    expect(getKuboLegOffsets("right-step")).toEqual({ left: -5, right: 8 });
  });

  test("repeats without changing the cycle", () => {
    for (let frame = 0; frame < KUBO_IDLE.cycleFrames; frame += 1) {
      expect(getKuboIdlePose(frame + KUBO_IDLE.cycleFrames)).toBe(getKuboIdlePose(frame));
    }
  });
});
