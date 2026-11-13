import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";
import { pkgFile } from "../layout-paths";

export function processInfraDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const infraPath = pkgFile(config, "infra", "package.json");
  if (!vfs.exists(infraPath)) return;

  const { serverDeploy, webDeploy } = config;
  if (serverDeploy === "cloudflare" || webDeploy === "cloudflare") {
    addPackageDependency({ vfs, packagePath: infraPath, devDependencies: ["alchemy"] });
  }
}
