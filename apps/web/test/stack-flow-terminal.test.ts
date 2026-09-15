import { describe, expect, test } from "bun:test";

import {
  CORE_STACK_SUMMARY,
  getStackFlowTerminalState,
  STACK_FLOW_TERMINAL_COMMAND,
  STACK_FLOW_TERMINAL_LOOP_DURATION_MS,
  STACK_FLOW_TERMINAL_TIMELINE,
} from "../src/lib/stack-flow-terminal";

describe("stack flow terminal playback", () => {
  test("uses the canonical home create command", () => {
    expect(STACK_FLOW_TERMINAL_COMMAND).toBe("bun create kubojs@latest");
  });

  test("reveals the demonstrative Create Path in order", () => {
    const commandState = getStackFlowTerminalState(0);
    const promptState = getStackFlowTerminalState(STACK_FLOW_TERMINAL_TIMELINE.projectTypeAtMs);
    const webState = getStackFlowTerminalState(STACK_FLOW_TERMINAL_TIMELINE.webAtMs);
    const completedWebState = getStackFlowTerminalState(
      STACK_FLOW_TERMINAL_TIMELINE.webSubmittedAtMs,
    );

    expect(commandState.phase).toBe("command");
    expect(commandState.commandTyping).toBe(true);
    expect(promptState.phase).toBe("project-type");
    expect(promptState.projectTypeComplete).toBe(false);
    expect(webState.phase).toBe("web-framework");
    expect(webState.webFrameworkComplete).toBe(false);
    expect(completedWebState.phase).toBe("web-framework");
    expect(completedWebState.webFrameworkComplete).toBe(true);
  });

  test("loops back to the first frame without accumulating state", () => {
    const firstFrame = getStackFlowTerminalState(250);
    const wrappedFrame = getStackFlowTerminalState(STACK_FLOW_TERMINAL_LOOP_DURATION_MS + 250);

    expect(wrappedFrame).toEqual(firstFrame);
  });

  test("freezes on the complete transcript for reduced motion", () => {
    const state = getStackFlowTerminalState(0, true);

    expect(state.phase).toBe("web-framework");
    expect(state.commandComplete).toBe(true);
    expect(state.projectNameComplete).toBe(true);
    expect(state.projectTypeComplete).toBe(true);
    expect(state.webFrameworkComplete).toBe(true);
  });

  test("keeps the core-stack parity fixture aligned with CLI defaults", () => {
    expect(Object.fromEntries(CORE_STACK_SUMMARY)).toEqual({
      "Project Name": "my-kubo-app",
      Frontend: "tanstack-router",
      Backend: "hono",
      Runtime: "bun",
      API: "trpc",
      Database: "sqlite",
      ORM: "drizzle",
      Auth: "better-auth",
      Observability: "getmonitor",
      Addons: "turborepo",
    });
  });
});
