import path from "node:path";

import { Result } from "better-result";
import fs from "fs-extra";

import { normalizeObservability } from "../../utils/config-processing";
import { readKubojsConfig } from "../../utils/kubojs-config";

export async function detectProjectConfig(projectDir: string) {
  const result = await Result.tryPromise({
    try: async () => {
      const kubojsConfig = await readKubojsConfig(projectDir);
      if (kubojsConfig) {
        return {
          projectDir,
          projectName: path.basename(projectDir),
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
        };
      }

      return null;
    },
    catch: () => null,
  });

  return result.isOk() ? result.value : null;
}

export async function isKubojsProject(projectDir: string): Promise<boolean> {
  const result = await Result.tryPromise({
    try: () => fs.pathExists(path.join(projectDir, "kubojs.jsonrc")),
    catch: () => false,
  });

  return result.isOk() ? result.value : false;
}
