import type { DesktopWebFrontend } from "./types";

export const desktopWebFrontends = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
  "nuxt",
  "svelte",
  "solid",
  "astro",
] as const satisfies readonly DesktopWebFrontend[];

export function getWebPort(frontends: readonly string[] = []): string {
  if (frontends.includes("react-router") || frontends.includes("svelte")) return "5173";
  if (frontends.includes("astro")) return "4321";
  return "3001";
}
