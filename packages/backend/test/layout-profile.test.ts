import { describe, expect, it } from "bun:test";

import {
  getLayoutProfileName,
  isSameLayoutProfileName,
  LAYOUT_PROFILE_NAME_MAX_LENGTH,
  parseLayoutProfile,
  parseLayoutProfileName,
} from "../shared/layout-profile";

describe("parseLayoutProfile", () => {
  it("accepts valid layouts and stamps version 1", () => {
    expect(parseLayoutProfile({ preset: "libs", apps: { web: "web" } })).toEqual({
      ok: true,
      layout: { version: 1, preset: "libs", apps: { web: "web" } },
    });
  });

  it("rejects invalid paths with the offending field", () => {
    const result = parseLayoutProfile({ apps: { web: "../web" } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("apps.web");
  });

  it("rejects folder conflicts", () => {
    const result = parseLayoutProfile({ apps: { web: "packages/ui" } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("collision");
  });

  it("rejects non-objects and unknown keys", () => {
    expect(parseLayoutProfile("libs").ok).toBe(false);
    expect(parseLayoutProfile({ owner: "someone-else" }).ok).toBe(false);
  });
});

describe("layout profile names", () => {
  it("trims and collapses whitespace", () => {
    expect(parseLayoutProfileName("  Work   monorepo ")).toEqual({
      ok: true,
      name: "Work monorepo",
    });
  });

  it("rejects empty, too long and non-string names", () => {
    expect(parseLayoutProfileName("   ").ok).toBe(false);
    expect(parseLayoutProfileName("a".repeat(LAYOUT_PROFILE_NAME_MAX_LENGTH + 1)).ok).toBe(false);
    expect(parseLayoutProfileName(undefined).ok).toBe(false);
  });

  it("names legacy profiles and compares names case-insensitively", () => {
    expect(getLayoutProfileName({})).toBe("Meu layout");
    expect(getLayoutProfileName({ name: "Libs" })).toBe("Libs");
    expect(isSameLayoutProfileName("Work", "work")).toBe(true);
    expect(isSameLayoutProfileName("Work", "Home")).toBe(false);
  });
});
