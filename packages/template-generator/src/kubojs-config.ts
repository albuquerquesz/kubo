import type { KubojsConfig, ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "./core/virtual-fs";

const KUBOJS_CONFIG_FILE = "kubojs.jsonrc";

/**
 * Writes the kubojs configuration file to the VFS (for new project creation).
 * This is browser-safe as it only writes to VFS, not the real filesystem.
 */
export function writeKubojsConfigToVfs(
  vfs: VirtualFileSystem,
  projectConfig: ProjectConfig,
  version: string,
  reproducibleCommand?: string,
): void {
  const kubojsConfig: KubojsConfig = {
    version,
    createdAt: new Date().toISOString(),
    reproducibleCommand,
    addonOptions: projectConfig.addonOptions,
    dbSetupOptions: projectConfig.dbSetupOptions,
    database: projectConfig.database,
    orm: projectConfig.orm,
    backend: projectConfig.backend,
    runtime: projectConfig.runtime,
    frontend: projectConfig.frontend,
    addons: projectConfig.addons,
    examples: projectConfig.examples,
    auth: projectConfig.auth,
    payments: projectConfig.payments,
    observability: projectConfig.observability,
    communication: projectConfig.communication,
    packageManager: projectConfig.packageManager,
    dbSetup: projectConfig.dbSetup,
    api: projectConfig.api,
    webDeploy: projectConfig.webDeploy,
    serverDeploy: projectConfig.serverDeploy,
  };

  const baseContent = {
    $schema: "https://r2.kubojs.dev/schema.json",
    ...kubojsConfig,
  };

  const jsonContent = JSON.stringify(baseContent, null, 2);

  const addCommand =
    projectConfig.packageManager === "npm"
      ? "npx kubojs add"
      : projectConfig.packageManager === "pnpm"
        ? "pnpm dlx kubojs add"
        : "bun create kubojs add";

  const finalContent = `// kubojs
//
// Website: https://www.kubojs.dev/
// Stack Builder: https://www.kubojs.dev/new
// Analytics: https://www.kubojs.dev/analytics
// Showcase: https://www.kubojs.dev/showcase
//
// Add new addons with: ${addCommand}
// This file is safe to delete

${jsonContent}`;

  vfs.writeFile(KUBOJS_CONFIG_FILE, finalContent);
}
