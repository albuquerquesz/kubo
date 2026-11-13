import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";
import { appDir, pkgDir } from "../layout-paths";

export async function processBackendTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.backend === "none") return;

  if (config.backend === "convex") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      "backend/convex/packages/backend",
      pkgDir(config, "backend"),
      config,
    );
    return;
  }

  if (config.backend === "self") return;

  processTemplatesFromPrefix(vfs, templates, "backend/server/base", appDir(config, "server"), config);
  processTemplatesFromPrefix(
    vfs,
    templates,
    `backend/server/${config.backend}`,
    appDir(config, "server"),
    config,
  );
}
