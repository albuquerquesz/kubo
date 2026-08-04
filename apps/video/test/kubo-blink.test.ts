import { describe, expect, test } from "bun:test";

import { getKuboEyeRect, getKuboEyeState } from "../src/compositions/kubo-launch/lib/kubo-blink";
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
