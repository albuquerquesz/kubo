import { describe, expect, it } from "bun:test";

import { KUBO_GOLD, kuboGold } from "../src/utils/kubo-colors";

describe("Kubo CLI colors", () => {
  it("uses the video accent", () => {
    expect(KUBO_GOLD).toBe("#FFD84A");
  });

  it("renders the exact truecolor accent when colors are enabled", () => {
    expect(kuboGold("accent", true)).toBe("\u001b[38;2;255;216;74maccent\u001b[39m");
  });

  it("keeps output plain when colors are disabled", () => {
    expect(kuboGold("accent", false)).toBe("accent");
  });
});
