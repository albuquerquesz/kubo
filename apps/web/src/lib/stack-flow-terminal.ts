import { KUBO_CLI_TITLE } from "@kubojs/types";

import { DEFAULT_PACKAGE_MANAGER, getCreateCommand } from "./create-commands";

export const STACK_FLOW_TERMINAL_COMMAND = getCreateCommand(DEFAULT_PACKAGE_MANAGER);
export const STACK_FLOW_TERMINAL_PROJECT_NAME = "my-kubo-app";
export const STACK_FLOW_TERMINAL_LOOP_DURATION_MS = 7_800;

export const STACK_FLOW_TERMINAL_TIMELINE = {
  commandEndMs: 1_600,
  bannerAtMs: 1_600,
  projectNameAtMs: 2_300,
  projectNameSubmittedAtMs: 3_800,
  projectTypeAtMs: 4_100,
  projectTypeSubmittedAtMs: 5_100,
  webAtMs: 5_400,
  webSubmittedAtMs: 6_800,
} as const;

export const KUBO_CLI_BANNER = KUBO_CLI_TITLE;

export type TerminalOption = {
  label: string;
  hint: string;
  selected?: boolean;
};

export const PROJECT_TYPE_OPTIONS = [
  { label: "Web", hint: "React, Vue or Svelte Web Application", selected: true },
  { label: "Native", hint: "Create a React Native/Expo app" },
] as const satisfies readonly TerminalOption[];

export const WEB_OPTIONS = [
  {
    label: "TanStack Router",
    hint: "Modern and scalable routing for React Applications",
    selected: true,
  },
  {
    label: "React Router",
    hint: "A user-obsessed, standards-focused, multi-strategy router",
  },
  { label: "Next.js", hint: "The React Framework for the Web" },
  { label: "Nuxt", hint: "The Progressive Web Framework for Vue.js" },
  { label: "Svelte", hint: "web development for the rest of us" },
  { label: "Solid", hint: "Simple and performant reactivity for building user interfaces" },
  { label: "Astro", hint: "The web framework for content-driven websites" },
  {
    label: "TanStack Start",
    hint: "SSR, Server Functions, API Routes and more with TanStack Router",
  },
] as const satisfies readonly TerminalOption[];

export const BACKEND_OPTIONS = [
  {
    label: "Hono",
    hint: "Lightweight, ultrafast web framework",
  },
  {
    label: "Express",
    hint: "Fast, unopinionated, minimalist web framework for Node.js",
  },
  {
    label: "Fastify",
    hint: "Fast, low-overhead web framework for Node.js",
  },
  {
    label: "Elysia",
    hint: "Ergonomic web framework for building backend servers",
    selected: true,
  },
  {
    label: "NestJS",
    hint: "Opinionated TypeScript framework for scalable server applications",
  },
  {
    label: "Convex",
    hint: "Reactive backend-as-a-service platform",
  },
  { label: "None", hint: "No backend server" },
] as const satisfies readonly TerminalOption[];

export const CORE_STACK_SUMMARY = [
  ["Project Name", STACK_FLOW_TERMINAL_PROJECT_NAME],
  ["Frontend", "tanstack-router"],
  ["Backend", "hono"],
  ["Runtime", "bun"],
  ["API", "trpc"],
  ["Database", "sqlite"],
  ["ORM", "drizzle"],
  ["Auth", "better-auth"],
  ["Observability", "getmonitor"],
  ["Addons", "turborepo"],
] as const satisfies readonly (readonly [string, string])[];

export const REPRODUCIBLE_COMMAND =
  "bun create kubojs@latest my-kubo-app --frontend tanstack-router --backend hono --runtime bun --database sqlite --orm drizzle --api trpc --auth better-auth --payments none --observability getmonitor --communication none --addons turborepo --examples none --testing none --db-setup none --web-deploy none --server-deploy none --git --package-manager bun --install";

export type TerminalPlaybackPhase = "command" | "project-name" | "project-type" | "web-framework";

export type TerminalPlaybackState = {
  elapsedMs: number;
  phase: TerminalPlaybackPhase;
  visibleCommand: string;
  commandComplete: boolean;
  commandTyping: boolean;
  commandCursorVisible: boolean;
  showBanner: boolean;
  showProjectName: boolean;
  visibleProjectName: string;
  projectNameComplete: boolean;
  projectNameTyping: boolean;
  projectNameCursorVisible: boolean;
  showProjectType: boolean;
  projectTypeComplete: boolean;
  showWebFramework: boolean;
  webFrameworkComplete: boolean;
};

function normalizeElapsedTime(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return STACK_FLOW_TERMINAL_LOOP_DURATION_MS - 1;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  return elapsedMs % STACK_FLOW_TERMINAL_LOOP_DURATION_MS;
}

function getVisibleCharacters(value: string, startMs: number, endMs: number, elapsedMs: number) {
  if (elapsedMs <= startMs) return "";
  if (elapsedMs >= endMs) return value;

  const progress = (elapsedMs - startMs) / (endMs - startMs);
  return value.slice(0, Math.floor(progress * value.length));
}

function getPhase(elapsedMs: number): TerminalPlaybackPhase {
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.webAtMs) return "web-framework";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectTypeAtMs) return "project-type";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectNameAtMs) return "project-name";
  return "command";
}

export function getStackFlowTerminalState(
  elapsedMs: number,
  reducedMotion = false,
): TerminalPlaybackState {
  const normalizedElapsedMs = normalizeElapsedTime(elapsedMs, reducedMotion);
  const {
    commandEndMs,
    projectNameAtMs,
    projectNameSubmittedAtMs,
    projectTypeAtMs,
    projectTypeSubmittedAtMs,
    webAtMs,
    webSubmittedAtMs,
  } = STACK_FLOW_TERMINAL_TIMELINE;
  const commandComplete = normalizedElapsedMs >= commandEndMs;
  const projectNameComplete = normalizedElapsedMs >= projectNameSubmittedAtMs;

  return {
    elapsedMs: normalizedElapsedMs,
    phase: getPhase(normalizedElapsedMs),
    visibleCommand: getVisibleCharacters(
      STACK_FLOW_TERMINAL_COMMAND,
      0,
      commandEndMs,
      normalizedElapsedMs,
    ),
    commandComplete,
    commandTyping: !commandComplete,
    commandCursorVisible: Math.floor(normalizedElapsedMs / 360) % 2 === 0,
    showBanner: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.bannerAtMs,
    showProjectName: normalizedElapsedMs >= projectNameAtMs,
    visibleProjectName: getVisibleCharacters(
      STACK_FLOW_TERMINAL_PROJECT_NAME,
      projectNameAtMs,
      projectNameSubmittedAtMs,
      normalizedElapsedMs,
    ),
    projectNameComplete,
    projectNameTyping: normalizedElapsedMs >= projectNameAtMs && !projectNameComplete,
    projectNameCursorVisible: Math.floor(normalizedElapsedMs / 360) % 2 === 0,
    showProjectType: normalizedElapsedMs >= projectTypeAtMs,
    projectTypeComplete: normalizedElapsedMs >= projectTypeSubmittedAtMs,
    showWebFramework: normalizedElapsedMs >= webAtMs,
    webFrameworkComplete: normalizedElapsedMs >= webSubmittedAtMs,
  };
}
