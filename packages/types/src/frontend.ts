import { FRONTEND_VALUES } from "./schemas";
import type { Frontend } from "./types";

export type FrontendCapabilities = {
  isWeb: boolean;
  isReact: boolean;
  isNative: boolean;
  publicEnvPrefix: string | null;
};

export const FRONTEND_CAPABILITIES = {
  "tanstack-router": { isWeb: true, isReact: true, isNative: false, publicEnvPrefix: "VITE_" },
  "react-router": { isWeb: true, isReact: true, isNative: false, publicEnvPrefix: "VITE_" },
  "tanstack-start": { isWeb: true, isReact: true, isNative: false, publicEnvPrefix: "VITE_" },
  next: { isWeb: true, isReact: true, isNative: false, publicEnvPrefix: "NEXT_PUBLIC_" },
  nuxt: { isWeb: true, isReact: false, isNative: false, publicEnvPrefix: "NUXT_PUBLIC_" },
  "native-bare": { isWeb: false, isReact: false, isNative: true, publicEnvPrefix: null },
  "native-uniwind": { isWeb: false, isReact: false, isNative: true, publicEnvPrefix: null },
  "native-unistyles": { isWeb: false, isReact: false, isNative: true, publicEnvPrefix: null },
  svelte: { isWeb: true, isReact: false, isNative: false, publicEnvPrefix: "PUBLIC_" },
  solid: { isWeb: true, isReact: false, isNative: false, publicEnvPrefix: "VITE_" },
  astro: { isWeb: true, isReact: false, isNative: false, publicEnvPrefix: "PUBLIC_" },
  none: { isWeb: false, isReact: false, isNative: false, publicEnvPrefix: null },
} as const satisfies Record<Frontend, FrontendCapabilities>;

export const reactWebFrontends = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
] as const;

const publicEnvFrontendPriority = ["next", "nuxt", "svelte", "astro"] as const;

export function isFrontend(value: string): value is Frontend {
  return FRONTEND_VALUES.some((frontend) => frontend === value);
}

export function hasWebFrontend(frontends: readonly string[]): boolean {
  return frontends.some(
    (frontend) => isFrontend(frontend) && FRONTEND_CAPABILITIES[frontend].isWeb,
  );
}

export function hasReactFrontend(frontends: readonly string[]): boolean {
  return frontends.some(
    (frontend) => isFrontend(frontend) && FRONTEND_CAPABILITIES[frontend].isReact,
  );
}

export function hasNativeFrontend(frontends: readonly string[]): boolean {
  return frontends.some(
    (frontend) => isFrontend(frontend) && FRONTEND_CAPABILITIES[frontend].isNative,
  );
}

export function hasAnyFrontend(
  frontends: readonly string[],
  candidates: readonly string[],
): boolean {
  return frontends.some((frontend) => candidates.includes(frontend));
}

export function findFrontend(
  frontends: readonly string[],
  candidates: readonly string[],
): string | undefined {
  return frontends.find((frontend) => candidates.includes(frontend));
}

export function getPublicEnvKey(frontends: readonly string[], suffix: string): string {
  const prioritizedFrontend = publicEnvFrontendPriority.find((frontend) =>
    frontends.includes(frontend),
  );
  const prefix = prioritizedFrontend
    ? FRONTEND_CAPABILITIES[prioritizedFrontend].publicEnvPrefix
    : "VITE_";

  return `${prefix}${suffix}`;
}
