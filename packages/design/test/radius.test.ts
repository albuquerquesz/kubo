import { describe, expect, test } from "bun:test";

import { kuboRadius } from "../src/index";

describe("kubo radius", () => {
  test("keeps the home and builder radii", () => {
    expect(kuboRadius.control).toBe("0.375rem");
    expect(kuboRadius.tile).toBe("0.5rem");
    expect(kuboRadius.panel).toBe("1rem");
    expect(kuboRadius.stage).toBe("1.5rem");
    expect(kuboRadius.shell).toBe("12px");
  });
});
