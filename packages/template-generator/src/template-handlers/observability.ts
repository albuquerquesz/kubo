import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getObservabilityCatalogEntry, matchesObservabilityTarget } from "../observability-catalog";
import { type TemplateData, processSingleTemplate } from "./utils";

export function processObservabilityTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): void {
  for (const provider of config.observability) {
    const entry = getObservabilityCatalogEntry(provider);
    for (const artifact of entry.artifacts) {
      if (!matchesObservabilityTarget(artifact.target, vfs, config)) continue;

      processSingleTemplate(
        vfs,
        templates,
        artifact.templatePath,
        artifact.destinationPath,
        config,
      );
    }
  }
}
