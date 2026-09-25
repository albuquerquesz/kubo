import { hasAnyFrontend, type ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getStoragePackagePath, getWebAppPath } from "../layout-paths";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processAddonTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.addons || config.addons.length === 0) return;

  for (const addon of config.addons) {
    if (addon === "none") continue;

    // Task runners are handled programmatically by generators.
    if (addon === "turborepo" || addon === "vite-plus") continue;

    if (addon === "pwa") {
      const webPath = getWebAppPath(config);
      if (config.frontend.includes("next")) {
        processTemplatesFromPrefix(vfs, templates, "addons/pwa/apps/web/next", webPath, config);
      } else if (hasAnyFrontend(config.frontend, ["tanstack-router", "react-router", "solid"])) {
        processTemplatesFromPrefix(vfs, templates, "addons/pwa/apps/web/vite", webPath, config);
      }
      continue;
    }

    if (addon === "s3-storage") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "addons/s3-storage/packages/storage",
        getStoragePackagePath(config),
        config,
      );
      continue;
    }

    processTemplatesFromPrefix(vfs, templates, `addons/${addon}`, "", config);
  }
}
