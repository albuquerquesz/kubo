import { describe, expect, it } from "bun:test";

import { cliColors, KUBO_COLORS } from "../src/utils/cli-colors";
import { KUBO_TITLE_COLORS } from "../src/utils/render-title";

describe("CLI color palette", () => {
  it("uses the Kubo LP colors as the CLI palette source", () => {
    expect(KUBO_COLORS).toEqual({
      signal: "#c49314",
      bright: "#d6a72b",
      orange: "#e08a2e",
      cream: "#f2ede0",
    });
  });

  it("keeps color helpers safe for plain terminal output", () => {
    expect(cliColors.signal("Kubo")).toContain("Kubo");
    expect(cliColors.bright("Kubo")).toContain("Kubo");
    expect(cliColors.orange("Kubo")).toContain("Kubo");
    expect(cliColors.cream("Kubo")).toContain("Kubo");
  });

  it("uses the warm Kubo gradient for the CLI title", () => {
    expect(KUBO_TITLE_COLORS).toEqual([
      "#D6A72B",
      "#F5D76E",
      "#E0B43E",
      "#E08A2E",
      "#E0B43E",
      "#D97724",
      "#E08A2E",
      "#E08A2E",
      "#C49314",
      "#E8C978",
      "#E5D3A5",
    ]);
  });
});
