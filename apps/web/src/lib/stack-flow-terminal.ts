import { DEFAULT_PACKAGE_MANAGER, getCreateCommand } from "./create-commands";

export const STACK_FLOW_TERMINAL_COMMAND = getCreateCommand(DEFAULT_PACKAGE_MANAGER);
export const STACK_FLOW_TERMINAL_PROJECT_NAME = "my-kubo-app";
export const STACK_FLOW_TERMINAL_LOOP_DURATION_MS = 16_000;

export const STACK_FLOW_TERMINAL_TIMELINE = {
  commandEndMs: 1_600,
  bannerAtMs: 1_600,
  introAtMs: 2_300,
  projectNameAtMs: 2_700,
  projectNameSubmittedAtMs: 3_800,
  projectTypeAtMs: 4_100,
  projectTypeSubmittedAtMs: 5_100,
  webAtMs: 5_400,
  webSubmittedAtMs: 6_800,
  summaryAtMs: 7_100,
  reproducibleCommandAtMs: 10_300,
  successAtMs: 12_700,
} as const;

export const KUBO_CLI_BANNER = `
██╗  ██╗██╗   ██╗██████╗  ██████╗
██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝`;

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

export type TerminalPlaybackPhase =
  | "command"
  | "intro"
  | "project-name"
  | "project-type"
  | "web-framework"
  | "summary"
  | "reproducible-command"
  | "success";

export type TerminalPlaybackState = {
  elapsedMs: number;
  phase: TerminalPlaybackPhase;
  visibleCommand: string;
  commandComplete: boolean;
  commandTyping: boolean;
  commandCursorVisible: boolean;
  showBanner: boolean;
  showIntro: boolean;
  showProjectName: boolean;
  visibleProjectName: string;
  projectNameComplete: boolean;
  projectNameTyping: boolean;
  projectNameCursorVisible: boolean;
  showProjectType: boolean;
  projectTypeComplete: boolean;
  showWebFramework: boolean;
  webFrameworkComplete: boolean;
  showSummary: boolean;
  showReproducibleCommand: boolean;
  showSuccess: boolean;
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
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.successAtMs) return "success";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.reproducibleCommandAtMs) {
    return "reproducible-command";
  }
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.summaryAtMs) return "summary";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.webAtMs) return "web-framework";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectTypeAtMs) return "project-type";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectNameAtMs) return "project-name";
  if (elapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.introAtMs) return "intro";
  return "command";
}

export function getStackFlowTerminalState(
  elapsedMs: number,
  reducedMotion = false,
): TerminalPlaybackState {
  const normalizedElapsedMs = normalizeElapsedTime(elapsedMs, reducedMotion);
  const { commandEndMs, projectNameAtMs, projectNameSubmittedAtMs } = STACK_FLOW_TERMINAL_TIMELINE;
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
    showIntro: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.introAtMs,
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
    showProjectType: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectTypeAtMs,
    projectTypeComplete:
      normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.projectTypeSubmittedAtMs,
    showWebFramework: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.webAtMs,
    webFrameworkComplete: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.webSubmittedAtMs,
    showSummary: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.summaryAtMs,
    showReproducibleCommand:
      normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.reproducibleCommandAtMs,
    showSuccess: normalizedElapsedMs >= STACK_FLOW_TERMINAL_TIMELINE.successAtMs,
  };
}
