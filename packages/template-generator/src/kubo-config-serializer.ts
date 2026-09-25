import type { KuboConfig, ProjectConfig } from "@kubojs/types";

export function serializeKuboConfigFile(config: KuboConfig): string {
  const { reproducibleCommand: _ignored, ...persisted } = config;
  const payload = JSON.stringify(persisted, null, 2);
  return `export default ${payload};\n`;
}

export function buildKuboConfigFromProject(
  projectConfig: ProjectConfig,
  version: string,
): KuboConfig {
  return {
    version,
    createdAt: new Date().toISOString(),
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
