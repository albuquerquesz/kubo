import { describe, expect, it } from "bun:test";

import { parseLayoutProfile } from "../shared/layout-profile";

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
