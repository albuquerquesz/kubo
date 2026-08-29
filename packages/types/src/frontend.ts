import { FRONTEND_VALUES } from "./schemas";
import type { Frontend } from "./types";

export type FrontendCapabilities = {
  isWeb: boolean;
  isReact: boolean;
  publicEnvPrefix: string | null;
};

export const FRONTEND_CAPABILITIES = {
  "tanstack-router": { isWeb: true, isReact: true, publicEnvPrefix: "VITE_" },
  "react-router": { isWeb: true, isReact: true, publicEnvPrefix: "VITE_" },
  "tanstack-start": { isWeb: true, isReact: true, publicEnvPrefix: "VITE_" },
  next: { isWeb: true, isReact: true, publicEnvPrefix: "NEXT_PUBLIC_" },
  nuxt: { isWeb: true, isReact: false, publicEnvPrefix: "NUXT_PUBLIC_" },
  "native-bare": { isWeb: false, isReact: false, publicEnvPrefix: null },
  "native-uniwind": { isWeb: false, isReact: false, publicEnvPrefix: null },
  "native-unistyles": { isWeb: false, isReact: false, publicEnvPrefix: null },
  svelte: { isWeb: true, isReact: false, publicEnvPrefix: "PUBLIC_" },
  solid: { isWeb: true, isReact: false, publicEnvPrefix: "VITE_" },
  astro: { isWeb: true, isReact: false, publicEnvPrefix: "PUBLIC_" },
  none: { isWeb: false, isReact: false, publicEnvPrefix: null },
} as const satisfies Record<Frontend, FrontendCapabilities>;

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

export function getPublicEnvKey(frontends: readonly string[], suffix: string): string {
  const prioritizedFrontend = publicEnvFrontendPriority.find((frontend) =>
    frontends.includes(frontend),
  );
  const prefix = prioritizedFrontend
    ? FRONTEND_CAPABILITIES[prioritizedFrontend].publicEnvPrefix
    : "VITE_";

  return `${prefix}${suffix}`;
}
