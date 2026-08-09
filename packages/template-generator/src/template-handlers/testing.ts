import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processTestingTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.testing || config.testing.length === 0) return;

  for (const item of config.testing) {
    if (item === "none") continue;

    processTemplatesFromPrefix(vfs, templates, `testing/${item}`, "", config);
  }
}
