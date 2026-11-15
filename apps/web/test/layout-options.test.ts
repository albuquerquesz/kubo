import { describe, expect, test } from "bun:test";

import { layoutToDraft, validateLayoutDraft } from "../src/lib/layout-draft";
import { findLayoutOption, LAYOUT_OPTIONS } from "../src/lib/layout-options";
import { parseStackLayout } from "../src/lib/stack-layout";

describe("layout options", () => {
  test("every option is a valid layout without folder conflicts", () => {
    for (const option of LAYOUT_OPTIONS) {
      if (option.layout) expect(parseStackLayout(option.layout)).not.toBeNull();
      const validation = validateLayoutDraft(layoutToDraft(option.layout));
      expect(validation.conflicts).toEqual([]);
      expect(validation.layout).toBeDefined();
    }
  });

  test("ids are unique", () => {
    const ids = LAYOUT_OPTIONS.map((option) => option.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("finds the option of the current layout", () => {
    expect(findLayoutOption(undefined)?.id).toBe("standard");
    expect(findLayoutOption({ version: 1, preset: "standard" })?.id).toBe("standard");
    expect(findLayoutOption({ version: 1, preset: "libs" })?.id).toBe("libs");
    expect(
      findLayoutOption({ version: 1, preset: "standard", apps: { web: "apps/client" } })?.id,
    ).toBe("client-server");
    expect(findLayoutOption({ version: 1, preset: "standard", apps: { web: "web" } })).toBe(
      undefined,
    );
  });
});
