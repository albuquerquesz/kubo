import { describe, expect, test } from "bun:test";

import { DEFAULT_STACK } from "../src/lib/constant";
import {
  draftToLayout,
  getConventionPath,
  layoutToDraft,
  validateLayoutDraft,
} from "../src/lib/layout-draft";
import { parseStackLayout } from "../src/lib/stack-layout";
import { normalizeStackState } from "../src/lib/stack-state";
import { generateStackCommand, generateStackUrlFromState } from "../src/lib/stack-utils";

describe("layout draft", () => {
  test("round-trips a layout through the draft", () => {
    const layout = { version: 1 as const, preset: "libs" as const, apps: { web: "web" } };
    expect(draftToLayout(layoutToDraft(layout))).toEqual(layout);
  });

  test("drops empty fields and dirs equal to the preset", () => {
    const draft = layoutToDraft(undefined);
    draft.dirs.apps = "apps";
    draft.apps.web = "  ";
    expect(draftToLayout(draft)).toEqual({ version: 1, preset: "standard" });
  });

  test("reports per-field path errors", () => {
    const draft = layoutToDraft(undefined);
    draft.apps.web = "../web";
    draft.dirs.packages = "/abs";
    const result = validateLayoutDraft(draft);
    expect(result.layout).toBeUndefined();
    expect(result.fieldErrors["apps.web"]).toBeDefined();
    expect(result.fieldErrors["dirs.packages"]).toBeDefined();
  });

  test("reports folder conflicts", () => {
    const draft = layoutToDraft(undefined);
    draft.apps.web = "packages/ui";
    const result = validateLayoutDraft(draft);
    expect(result.layout).toBeUndefined();
    expect(result.conflicts[0]?.code).toBe("path_collision");
  });

  test("placeholder follows the convention dir", () => {
    const draft = layoutToDraft({ preset: "libs" });
    expect(getConventionPath(draft, "packages", "ui")).toBe("libs/ui");
    draft.dirs.apps = ".";
    expect(getConventionPath(draft, "apps", "web")).toBe("web");
  });
});

describe("stack layout state", () => {
  test("parseStackLayout drops standard and invalid layouts", () => {
    expect(parseStackLayout({ preset: "standard" })).toBeNull();
    expect(parseStackLayout({ apps: { web: "packages/ui" } })).toBeNull();
    expect(parseStackLayout("libs")).toBeNull();
    expect(parseStackLayout({ preset: "libs" })).toEqual({ version: 1, preset: "libs" });
  });

  test("normalizeStackState keeps a valid layout", () => {
    const stack = normalizeStackState({ ...DEFAULT_STACK, layout: { preset: "libs" } });
    expect(stack?.layout).toEqual({ version: 1, preset: "libs" });
    expect(normalizeStackState({ ...DEFAULT_STACK, layout: { apps: { web: "../x" } } })?.layout).toBe(
      undefined,
    );
  });

  test("the command carries --layout only for non-standard layouts", () => {
    const base = normalizeStackState(DEFAULT_STACK)!;
    expect(generateStackCommand(base)).not.toContain("--layout");
    const libs = normalizeStackState({ ...DEFAULT_STACK, layout: { preset: "libs" } })!;
    expect(generateStackCommand(libs)).toContain("--layout libs");
    const custom = normalizeStackState({
      ...DEFAULT_STACK,
      layout: { preset: "libs", apps: { web: "web" } },
    })!;
    expect(generateStackCommand(custom)).toContain(`--layout '{"preset":"libs","apps":{"web":"web"}}'`);
  });

  test("the share URL includes the layout", () => {
    const libs = normalizeStackState({ ...DEFAULT_STACK, layout: { preset: "libs" } })!;
    const url = new URL(generateStackUrlFromState(libs));
    expect(JSON.parse(url.searchParams.get("lay") ?? "null")).toEqual({ version: 1, preset: "libs" });
  });
});
