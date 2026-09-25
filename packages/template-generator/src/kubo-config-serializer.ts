import type { KuboConfig, ProjectConfig } from "@kubojs/types";

export function serializeKuboConfigFile(
  config: KuboConfig,
  options: { addCommand: string; cliVersion: string },
): string {
  const payload = JSON.stringify(config, null, 2);

  return `// KuboJS project config (not IPFS Kubo)
//
// Website: https://www.kubojs.dev/
// Stack Builder: https://www.kubojs.dev/new
//
// Add addons: ${options.addCommand}
// Optional: import { defineKuboConfig } from "@kubojs/config" for typed edits.
//
export default ${payload};
`;
}

export function buildKuboConfigFromProject(
  projectConfig: ProjectConfig,
  version: string,
  reproducibleCommand?: string,
): KuboConfig {
  return {
    version,
    createdAt: new Date().toISOString(),
    reproducibleCommand,
    layout: projectConfig.layout ?? { preset: "standard" },
    addonOptions: projectConfig.addonOptions,
    dbSetupOptions: projectConfig.dbSetupOptions,
    database: projectConfig.database,
    orm: projectConfig.orm,
    backend: projectConfig.backend,
    runtime: projectConfig.runtime,
    frontend: projectConfig.frontend,
    addons: projectConfig.addons,
    examples: projectConfig.examples,
    testing: projectConfig.testing,
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
}
