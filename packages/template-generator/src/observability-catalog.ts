import {
  hasReactFrontend,
  hasWebFrontend,
  type ObservabilityProvider,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "./core/virtual-fs";
import type { AvailableDependencies } from "./utils/add-deps";

export type ObservabilityTarget =
  | "web"
  | "vite"
  | "vite-react"
  | "vite-browser"
  | "next"
  | "nuxt"
  | "node-server";

export type ObservabilityArtifact = {
  readonly target: ObservabilityTarget;
  readonly templatePath: string;
  readonly destinationPath: string;
};

export type ObservabilityDependency = {
  readonly target: ObservabilityTarget;
  readonly packagePath: string;
  readonly dependencies?: readonly AvailableDependencies[];
  readonly devDependencies?: readonly AvailableDependencies[];
};

export type ObservabilityCatalogEntry = {
  readonly provider: ObservabilityProvider;
  readonly artifacts: readonly ObservabilityArtifact[];
  readonly dependencies: readonly ObservabilityDependency[];
};

const hasPackage = (vfs: VirtualFileSystem, path: string): boolean => vfs.exists(path);

const hasWebTarget = (vfs: VirtualFileSystem, config: ProjectConfig): boolean =>
  hasWebFrontend(config.frontend) && hasPackage(vfs, "apps/web/package.json");

const hasViteTarget = (vfs: VirtualFileSystem, config: ProjectConfig): boolean =>
  hasWebTarget(vfs, config) &&
  !config.frontend.includes("next") &&
  !config.frontend.includes("nuxt");

const supportsNodeServer = (vfs: VirtualFileSystem, config: ProjectConfig): boolean =>
  hasPackage(vfs, "apps/server/package.json") &&
  !["none", "self", "convex"].includes(config.backend) &&
  config.serverDeploy !== "cloudflare" &&
  config.runtime !== "workers";

const OBSERVABILITY_TARGETS: Record<
  ObservabilityTarget,
  (vfs: VirtualFileSystem, config: ProjectConfig) => boolean
> = {
  web: hasWebTarget,
  vite: hasViteTarget,
  "vite-react": (vfs, config) => hasViteTarget(vfs, config) && hasReactFrontend(config.frontend),
  "vite-browser": (vfs, config) => hasViteTarget(vfs, config) && !hasReactFrontend(config.frontend),
  next: (vfs, config) => hasWebTarget(vfs, config) && config.frontend.includes("next"),
  nuxt: (vfs, config) => hasWebTarget(vfs, config) && config.frontend.includes("nuxt"),
  "node-server": supportsNodeServer,
};

export const OBSERVABILITY_CATALOG: readonly ObservabilityCatalogEntry[] = [
  {
    provider: "getmonitor",
    artifacts: [
      {
        target: "vite",
        templatePath: "observability/getmonitor/browser.ts",
        destinationPath: "apps/web/src/lib/getmonitor.ts",
      },
      {
        target: "next",
        templatePath: "observability/getmonitor/next.tsx",
        destinationPath: "apps/web/src/components/getmonitor.tsx",
      },
      {
        target: "nuxt",
        templatePath: "observability/getmonitor/nuxt.ts",
        destinationPath: "apps/web/app/plugins/getmonitor.client.ts",
      },
      {
        target: "node-server",
        templatePath: "observability/getmonitor/server.ts",
        destinationPath: "apps/server/src/shared/getmonitor.ts",
      },
    ],
    dependencies: [
      {
        target: "next",
        packagePath: "apps/web/package.json",
        dependencies: ["@getmonitor/browser", "@getmonitor/react"],
        devDependencies: ["@getmonitor/nextjs-config"],
      },
      {
        target: "nuxt",
        packagePath: "apps/web/package.json",
        dependencies: ["@getmonitor/browser"],
        devDependencies: ["@getmonitor/nuxt"],
      },
      {
        target: "vite-react",
        packagePath: "apps/web/package.json",
        dependencies: ["@getmonitor/browser", "@getmonitor/react"],
      },
      {
        target: "vite-browser",
        packagePath: "apps/web/package.json",
        dependencies: ["@getmonitor/browser"],
      },
      {
        target: "node-server",
        packagePath: "apps/server/package.json",
        dependencies: ["@getmonitor/node"],
      },
    ],
  },
  {
    provider: "himetrica",
    artifacts: [
      {
        target: "vite",
        templatePath: "observability/himetrica/browser.ts",
        destinationPath: "apps/web/src/lib/himetrica.ts",
      },
      {
        target: "next",
        templatePath: "observability/himetrica/next.tsx",
        destinationPath: "apps/web/src/components/himetrica.tsx",
      },
      {
        target: "nuxt",
        templatePath: "observability/himetrica/nuxt.ts",
        destinationPath: "apps/web/app/plugins/himetrica.client.ts",
      },
    ],
    dependencies: [
      {
        target: "web",
        packagePath: "apps/web/package.json",
        dependencies: ["@himetrica/tracker-js"],
      },
    ],
  },
];

export function matchesObservabilityTarget(
  target: ObservabilityTarget,
  vfs: VirtualFileSystem,
  config: ProjectConfig,
): boolean {
  return OBSERVABILITY_TARGETS[target](vfs, config);
}

export function getObservabilityCatalogEntry(
  provider: ObservabilityProvider,
): ObservabilityCatalogEntry {
  const entry = OBSERVABILITY_CATALOG.find((candidate) => candidate.provider === provider);
  if (!entry) throw new Error(`Missing observability catalog entry: ${provider}`);
  return entry;
}
