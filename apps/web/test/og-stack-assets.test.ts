import { describe, expect, test } from "bun:test";

import { loadStackOgFonts } from "../src/app/og/stack/_lib/fonts";

describe("stack OG assets", () => {
  test("loads every embedded font", async () => {
    const fonts = await loadStackOgFonts();

    expect(fonts).toHaveLength(4);
    expect(fonts.every((font) => font.data.byteLength > 0)).toBe(true);
  });
});
