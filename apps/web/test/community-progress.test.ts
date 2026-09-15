import { describe, expect, test } from "bun:test";

import { parseScaleX } from "../src/app/(home)/_components/community-progress";

describe("community progress scale parsing", () => {
  test("reads scaleX from a 2d matrix", () => {
    expect(parseScaleX("matrix(0.42, 0, 0, 1, 0, 0)")).toBe(0.42);
  });

  test("reads scaleX from a compositor matrix3d used on Linux Firefox/Zen", () => {
    expect(parseScaleX("matrix3d(0.57, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)")).toBe(0.57);
  });

  test("ignores missing transforms", () => {
    expect(parseScaleX("none")).toBeNull();
    expect(parseScaleX("")).toBeNull();
  });
});
