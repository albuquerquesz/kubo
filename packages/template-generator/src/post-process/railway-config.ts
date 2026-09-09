/**
 * Railway configuration post-processor.
 * Each Railway service reads a config file from its own application directory.
 */

import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";

const railwayConfig = {
  $schema: "https://railway.com/railway.schema.json",
  build: { builder: "RAILPACK" },
  deploy: {
    restartPolicyType: "ON_FAILURE",
    restartPolicyMaxRetries: 10,
  },
} as const;

export function processRailwayConfig(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (config.webDeploy === "railway") {
    vfs.writeJson("apps/web/railway.json", railwayConfig);
  }

  if (config.serverDeploy === "railway" && config.backend !== "self") {
    vfs.writeJson("apps/server/railway.json", railwayConfig);
  }
}
