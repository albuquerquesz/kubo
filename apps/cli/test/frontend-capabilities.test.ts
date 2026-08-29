import { describe, expect, it } from "bun:test";

import { getPublicEnvKey, hasReactFrontend, hasWebFrontend } from "@kubojs/types";

describe("frontend capabilities", () => {
  it.each([
    [["next"], "NEXT_PUBLIC_GETMONITOR_API_KEY"],
    [["nuxt"], "NUXT_PUBLIC_GETMONITOR_API_KEY"],
    [["svelte"], "PUBLIC_GETMONITOR_API_KEY"],
    [["astro"], "PUBLIC_GETMONITOR_API_KEY"],
    [["tanstack-router"], "VITE_GETMONITOR_API_KEY"],
  ])("resolves the public env key for %j", (frontends, expected) => {
    expect(getPublicEnvKey(frontends, "GETMONITOR_API_KEY")).toBe(expected);
  });

  it("preserves the existing precedence for mixed frontend configurations", () => {
    expect(getPublicEnvKey(["svelte", "nuxt", "next"], "HIMETRICA_API_KEY")).toBe(
      "NEXT_PUBLIC_HIMETRICA_API_KEY",
    );
    expect(getPublicEnvKey(["astro", "tanstack-router"], "STRIPE_PUBLISHABLE_KEY")).toBe(
      "PUBLIC_STRIPE_PUBLISHABLE_KEY",
    );
  });

  it("exposes frontend capabilities without type assertions", () => {
    expect(hasWebFrontend(["native-bare", "astro"])).toBe(true);
    expect(hasWebFrontend(["native-bare", "none"])).toBe(false);
    expect(hasReactFrontend(["astro", "tanstack-start"])).toBe(true);
    expect(hasReactFrontend(["astro", "solid"])).toBe(false);
  });
});
