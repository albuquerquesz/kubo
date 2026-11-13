import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";
import { pkgDir } from "../layout-paths";

export async function processDbTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.database === "none" || config.orm === "none") return;
  if (config.backend === "convex") return;

  processTemplatesFromPrefix(vfs, templates, "db/base", pkgDir(config, "db"), config);
  processTemplatesFromPrefix(vfs, templates, `db/${config.orm}/base`, pkgDir(config, "db"), config);
  processTemplatesFromPrefix(
    vfs,
    templates,
    `db/${config.orm}/${config.database}`,
    pkgDir(config, "db"),
    config,
  );

  // With a Docker deploy target, the database service lives in the root
  // docker-compose.yml instead of a separate packages/db compose file.
  const hasDockerDeploy = config.webDeploy === "docker" || config.serverDeploy === "docker";
  if (config.dbSetup === "docker" && !hasDockerDeploy) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `db-setup/docker-compose/${config.database}`,
      pkgDir(config, "db"),
      config,
    );
  }
}
