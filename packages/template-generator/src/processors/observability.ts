import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getObservabilityCatalogEntry, matchesObservabilityTarget } from "../observability-catalog";
import { addPackageDependency } from "../utils/add-deps";

export function processObservability(vfs: VirtualFileSystem, config: ProjectConfig): void {
  for (const provider of config.observability) {
    const entry = getObservabilityCatalogEntry(provider);
    for (const dependency of entry.dependencies) {
      if (!matchesObservabilityTarget(dependency.target, vfs, config)) continue;

      addPackageDependency({
        vfs,
        packagePath: dependency.packagePath,
        dependencies: dependency.dependencies ? [...dependency.dependencies] : undefined,
        devDependencies: dependency.devDependencies ? [...dependency.devDependencies] : undefined,
      });
    }
  }
}
