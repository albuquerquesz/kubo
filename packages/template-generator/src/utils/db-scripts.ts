import type { ProjectConfig } from "@kubojs/types";

export type DbScriptSupport = {
  hasDbScripts: boolean;
  hasDbPush: boolean;
  hasDbGenerate: boolean;
  hasDbMigrate: boolean;
  hasDbStudio: boolean;
  isD1Alchemy: boolean;
};

const unsupportedBackends: readonly ProjectConfig["backend"][] = ["convex", "none"];
const unsupportedOrms: readonly ProjectConfig["orm"][] = ["none", "mongoose"];

export function getDbScriptSupport(config: ProjectConfig): DbScriptSupport {
  const isD1Alchemy =
    config.dbSetup === "d1" &&
    (config.serverDeploy === "cloudflare" ||
      (config.backend === "self" && config.webDeploy === "cloudflare"));
  const hasDbScripts =
    !unsupportedBackends.includes(config.backend) &&
    config.database !== "none" &&
    !unsupportedOrms.includes(config.orm);

  if (!hasDbScripts) {
    return {
      hasDbScripts: false,
      hasDbPush: false,
      hasDbGenerate: false,
      hasDbMigrate: false,
      hasDbStudio: false,
      isD1Alchemy,
    };
  }

  const hasDbPush = !isD1Alchemy;
  const hasDbMigrate = config.orm === "prisma" || (config.orm === "drizzle" && !isD1Alchemy);
  const hasDbStudio = !isD1Alchemy;

  return {
    hasDbScripts: true,
    hasDbPush,
    hasDbGenerate: true,
    hasDbMigrate,
    hasDbStudio,
    isD1Alchemy,
  };
}
