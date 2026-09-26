import path from "node:path";

import { Result } from "better-result";

import { normalizeObservability } from "../../utils/config-processing";
import type { KuboConfigInvalidError } from "../../utils/errors";
import { isKubojsProject as detectKuboProject, readKubojsConfig } from "../../utils/kubojs-config";

export async function detectProjectConfig(projectDir: string) {
  const loadResult = await readKubojsConfig(projectDir);
  if (loadResult.isErr()) {
    return Result.err(loadResult.error);
  }

  const kubojsConfig = loadResult.value;
  if (!kubojsConfig) {
    return Result.ok(null);
  }

  return Result.ok({
    projectDir,
    projectName: path.basename(projectDir),
    layout: kubojsConfig.layout,
    addonOptions: kubojsConfig.addonOptions,
    dbSetupOptions: kubojsConfig.dbSetupOptions,
    database: kubojsConfig.database,
    orm: kubojsConfig.orm,
    backend: kubojsConfig.backend,
    runtime: kubojsConfig.runtime,
    frontend: kubojsConfig.frontend,
    addons: kubojsConfig.addons,
    examples: kubojsConfig.examples,
    testing: kubojsConfig.testing,
    auth: kubojsConfig.auth,
    payments: kubojsConfig.payments,
    observability: normalizeObservability(kubojsConfig.observability),
    communication: kubojsConfig.communication ?? "none",
    packageManager: kubojsConfig.packageManager,
    dbSetup: kubojsConfig.dbSetup,
    api: kubojsConfig.api,
    webDeploy: kubojsConfig.webDeploy,
    serverDeploy: kubojsConfig.serverDeploy,
  });
}

export type DetectProjectConfigError = KuboConfigInvalidError;

export async function isKubojsProject(projectDir: string): Promise<boolean> {
  return detectKuboProject(projectDir);
}
