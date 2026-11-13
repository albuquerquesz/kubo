import { describe, expect, it } from "bun:test";

import { getLayoutConfigJsonSchema } from "../src/json-schema";
import {
  expandLayoutConfig,
  findLayoutConflicts,
  getLayoutPackagePath,
  getLayoutWorkspaceGlobs,
} from "../src/layout";
import {
  getLayoutPathIssue,
  layoutPathDepth,
  normalizeLayoutPath,
  relativeLayoutPath,
} from "../src/layout-path";
import { LayoutConfigSchema, LayoutDirSchema, LayoutRelativePathSchema } from "../src/schemas";

describe("layout path validation", () => {
  it("rejects absolute, parent, reserved and malformed paths", () => {
    expect(LayoutRelativePathSchema.safeParse("/apps/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("C:/apps/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("../apps/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("apps/node_modules/web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse(".git").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("apps/my web").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse("").success).toBe(false);
    expect(LayoutRelativePathSchema.safeParse(".").success).toBe(false);
  });

  it("accepts normal and un-normalized relative paths", () => {
    expect(LayoutRelativePathSchema.safeParse("apps/web").success).toBe(true);
    expect(LayoutRelativePathSchema.safeParse("./apps/web/").success).toBe(true);
    expect(LayoutRelativePathSchema.safeParse("apps\\web").success).toBe(true);
    expect(LayoutRelativePathSchema.safeParse("libs/@acme.ui_core-1").success).toBe(true);
  });

  it("allows the project root only for convention dirs", () => {
    expect(LayoutDirSchema.safeParse(".").success).toBe(true);
    expect(getLayoutPathIssue(".", { allowRoot: false })).toBe("empty");
  });

  it("normalizes separators, ./ segments and trailing slashes", () => {
    expect(normalizeLayoutPath("./apps\\web//")).toBe("apps/web");
    expect(normalizeLayoutPath(".")).toBe("");
  });

  it("computes relative paths and depth", () => {
    expect(relativeLayoutPath("apps/web", "packages/ui/src")).toBe("../../packages/ui/src");
    expect(relativeLayoutPath("web", "packages/env")).toBe("../packages/env");
    expect(relativeLayoutPath("apps/frontend/web", "apps/server/.env")).toBe("../../server/.env");
    expect(relativeLayoutPath("apps/web", "apps/web")).toBe(".");
    expect(relativeLayoutPath(".", "apps/web")).toBe("apps/web");
    expect(layoutPathDepth("apps/web")).toBe(2);
    expect(layoutPathDepth(".")).toBe(0);
  });
});

describe("layout schema", () => {
  it("defaults preset to standard and accepts version 1", () => {
    expect(LayoutConfigSchema.parse({}).preset).toBe("standard");
    expect(LayoutConfigSchema.parse({ version: 1, preset: "libs" }).preset).toBe("libs");
    expect(LayoutConfigSchema.safeParse({ version: 2 }).success).toBe(false);
  });

  it("accepts convention dirs and integration package ids", () => {
    const parsed = LayoutConfigSchema.safeParse({
      dirs: { apps: "apps", packages: "libs" },
      packages: { ui: "libs/design-system", arara: "libs/integrations/arara" },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unknown top-level keys, unknown apps and bad package ids", () => {
    expect(LayoutConfigSchema.safeParse({ folders: {} }).success).toBe(false);
    expect(LayoutConfigSchema.safeParse({ apps: { mobile: "apps/mobile" } }).success).toBe(false);
    expect(LayoutConfigSchema.safeParse({ packages: { UI: "packages/ui" } }).success).toBe(false);
  });

  it("still accepts the deprecated server-separated preset", () => {
    expect(LayoutConfigSchema.safeParse({ preset: "server-separated" }).success).toBe(true);
  });

  it("generates a JSON schema", () => {
    expect(getLayoutConfigJsonSchema()).toMatchObject({ type: "object" });
  });
});

describe("expandLayoutConfig", () => {
  it("keeps the standard paths unchanged", () => {
    const expanded = expandLayoutConfig({ preset: "standard" });
    expect(expanded.apps.web).toBe("apps/web");
    expect(expanded.apps.server).toBe("apps/server");
    expect(expanded.packages.db).toBe("packages/db");
    expect(expanded.packages.millionsend).toBe("packages/millionsend");
    expect(expandLayoutConfig(undefined)).toEqual(expanded);
  });

  it("derives paths from convention dirs", () => {
    const expanded = expandLayoutConfig({ preset: "libs" });
    expect(expanded.apps.web).toBe("apps/web");
    expect(expanded.packages.ui).toBe("libs/ui");

    const custom = expandLayoutConfig({ dirs: { apps: ".", packages: "shared" } });
    expect(custom.apps.web).toBe("web");
    expect(custom.packages.env).toBe("shared/env");
  });

  it("lets overrides win over convention dirs", () => {
    const expanded = expandLayoutConfig({
      preset: "libs",
      apps: { web: "./apps/client/" },
      packages: { ui: "libs/design-system" },
    });
    expect(expanded.apps.web).toBe("apps/client");
    expect(expanded.packages.ui).toBe("libs/design-system");
    expect(expanded.packages.db).toBe("libs/db");
  });

  it("upgrades server-separated to standard with apps/client", () => {
    const expanded = expandLayoutConfig({ preset: "server-separated" });
    expect(expanded.preset).toBe("standard");
    expect(expanded.apps.web).toBe("apps/client");
    expect(expanded.apps.server).toBe("apps/server");
  });

  it("resolves integration packages not present in the layout", () => {
    const expanded = expandLayoutConfig({ preset: "libs" });
    expect(getLayoutPackagePath(expanded, "some-provider")).toBe("libs/some-provider");
  });
});

describe("findLayoutConflicts", () => {
  it("finds no conflicts in the official presets", () => {
    expect(findLayoutConflicts(expandLayoutConfig({ preset: "standard" }))).toEqual([]);
    expect(findLayoutConflicts(expandLayoutConfig({ preset: "libs" }))).toEqual([]);
  });

  it("detects exact collisions", () => {
    const conflicts = findLayoutConflicts(expandLayoutConfig({ apps: { web: "packages/ui" } }));
    expect(conflicts.map((c) => c.code)).toContain("path_collision");
  });

  it("detects case-only collisions", () => {
    const conflicts = findLayoutConflicts(expandLayoutConfig({ apps: { web: "apps/Server" } }));
    expect(conflicts.map((c) => c.code)).toContain("case_collision");
  });

  it("detects nested folders", () => {
    const conflicts = findLayoutConflicts(expandLayoutConfig({ apps: { docs: "apps/web/docs" } }));
    expect(conflicts[0]).toMatchObject({ code: "path_overlap", owners: ["app:web", "app:docs"] });
  });

  it("flags flat layouts where an app and a package share a name", () => {
    const conflicts = findLayoutConflicts(
      expandLayoutConfig({ dirs: { apps: ".", packages: "." } }),
    );
    expect(
      conflicts.some((c) => c.owners.includes("app:api") && c.owners.includes("package:api")),
    ).toBe(true);
  });
});

describe("getLayoutWorkspaceGlobs", () => {
  it("returns the standard globs", () => {
    expect(getLayoutWorkspaceGlobs(expandLayoutConfig({ preset: "standard" }))).toEqual([
      "apps/*",
      "packages/*",
    ]);
  });

  it("adds exact entries for paths outside convention dirs", () => {
    const expanded = expandLayoutConfig({ preset: "libs", packages: { ui: "design/ui" } });
    expect(getLayoutWorkspaceGlobs(expanded, ["apps/web", "libs/db", "design/ui"])).toEqual([
      "apps/*",
      "libs/*",
      "design/ui",
    ]);
  });
});
