import { describe, expect, it } from "bun:test";

import { expandLayoutConfig } from "../src/layout";
import { LayoutConfigSchema, LayoutRelativePathSchema } from "../src/schemas";

describe("layout schema", () => {
  it("rejects absolute and parent-relative paths", () => {
    expect(LayoutRelativePathSchema.safeParse("/apps/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("../apps/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("apps/web").success).toBe(true);
  });

  it("defaults preset to standard", () => {
    const parsed = LayoutConfigSchema.parse({});
    expect(parsed.preset).toBe("standard");
  });

  it("expands standard preset paths", () => {
    const expanded = expandLayoutConfig({ preset: "standard" });
    expect(expanded.apps.web).toBe("apps/web");
    expect(expanded.packages.db).toBe("packages/db");
  });

  it("merges custom app overrides", () => {
    const expanded = expandLayoutConfig({
      preset: "standard",
      apps: { web: "packages/client" },
    });
    expect(expanded.apps.web).toBe("packages/client");
    expect(expanded.apps.server).toBe("apps/server");
  });
});
