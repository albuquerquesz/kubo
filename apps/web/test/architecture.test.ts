import { describe, expect, test } from "bun:test";

import { ARCHITECTURE_VALUES } from "@kubojs/types";

import { ARCHITECTURE_OPTIONS, findArchitectureOption } from "../src/lib/architecture-options";
import { DEFAULT_STACK } from "../src/lib/constant";
import { normalizeStackState } from "../src/lib/stack-state";
import { generateStackCommand, generateStackUrlFromState } from "../src/lib/stack-utils";

describe("architecture in the stack builder", () => {
  test("normalizeStackState keeps a known architecture and drops anything else", () => {
    expect(normalizeStackState({ ...DEFAULT_STACK, architecture: "clean" })?.architecture).toBe(
      "clean",
    );
    expect(
      normalizeStackState({ ...DEFAULT_STACK, architecture: "hexagonal" })?.architecture,
    ).toBeUndefined();
    expect(normalizeStackState(DEFAULT_STACK)?.architecture).toBeUndefined();
  });

  test("the command carries --architecture only when one is chosen", () => {
    const base = normalizeStackState(DEFAULT_STACK)!;
    expect(generateStackCommand(base)).not.toContain("--architecture");
    expect(generateStackCommand(base)).toContain("--yes");

    const layered = normalizeStackState({ ...DEFAULT_STACK, architecture: "layered" })!;
    expect(generateStackCommand(layered)).toContain("--yes --architecture layered");

    const custom = normalizeStackState({
      ...DEFAULT_STACK,
      architecture: "clean",
      auth: "none",
    })!;
    expect(generateStackCommand(custom)).toContain("--auth none");
    expect(generateStackCommand(custom)).toContain("--architecture clean");
  });

  test("the share URL includes the architecture", () => {
    const feature = normalizeStackState({ ...DEFAULT_STACK, architecture: "feature" })!;
    const url = new URL(generateStackUrlFromState(feature));
    expect(url.searchParams.get("arch")).toBe("feature");
  });

  test("the dialog offers the default plus every architecture", () => {
    const offered = ARCHITECTURE_OPTIONS.map((option) => option.architecture);
    expect(offered).toEqual([undefined, ...ARCHITECTURE_VALUES]);
    expect(findArchitectureOption(undefined).id).toBe("default");
    expect(findArchitectureOption("clean").id).toBe("clean");
  });
});
