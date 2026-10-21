import { hasWebFrontend, type ObservabilityProvider, type ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "./core/virtual-fs";
import type { AvailableDependencies } from "./utils/add-deps";

export type ObservabilityTarget = "web" | "vite" | "next" | "nuxt";

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

const OBSERVABILITY_TARGETS: Record<
  ObservabilityTarget,
  (vfs: VirtualFileSystem, config: ProjectConfig) => boolean
> = {
  web: hasWebTarget,
  vite: hasViteTarget,
  next: (vfs, config) => hasWebTarget(vfs, config) && config.frontend.includes("next"),
  nuxt: (vfs, config) => hasWebTarget(vfs, config) && config.frontend.includes("nuxt"),
};

export const OBSERVABILITY_CATALOG: readonly ObservabilityCatalogEntry[] = [
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
