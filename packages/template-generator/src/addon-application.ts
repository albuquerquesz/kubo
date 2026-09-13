import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "./core/virtual-fs";
import { processAddonsDeps } from "./processors/addons-deps";
import { processTurboConfig } from "./processors/turbo-generator";
import { processVitePlusConfig } from "./processors/vite-plus-generator";
import { processAddonTemplates } from "./template-handlers/addons";
import type { TemplateData } from "./template-handlers/utils";

export interface AddonApplicationOptions {
  /** Configuration used only to select templates to write. */
  templateConfig?: ProjectConfig;
  /** Rebuild turbo.json when the task runner itself was added or replaced. */
  refreshTaskRunner?: boolean;
  /** Rebuild vite.config.ts when Vite+ itself was added. */
  refreshVitePlus?: boolean;
}

/**
 * Applies the addon catalog to an existing virtual project.
 *
 * Create uses the complete config for both template and processor selection. Add uses the
 * existing project's config for processors while limiting template writes to the newly selected
 * addons, so both paths share the same addon implementation without overwriting user files.
 */
export async function applyAddonCatalog(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
  options: AddonApplicationOptions = {},
): Promise<void> {
  await processAddonTemplates(vfs, templates, options.templateConfig ?? config);
  processAddonsDeps(vfs, config);

  if (options.refreshTaskRunner ?? true) {
    processTurboConfig(vfs, config);
  }

  if (options.refreshVitePlus ?? true) {
    processVitePlusConfig(vfs, config);
  }
}
