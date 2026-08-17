export * from "./types";
export * from "./core/virtual-fs";
export * from "./core/template-processor";
export * from "./generator";
export { processAddonTemplates } from "./template-handlers/addons";
export { processTestingTemplates } from "./template-handlers/testing";
export { processAddonsDeps } from "./processors/addons-deps";
export { processTurboConfig } from "./processors/turbo-generator";
export { processVitePlusConfig } from "./processors/vite-plus-generator";
export { processEnvVariables } from "./processors/env-vars";
export { processPackageConfigs, processVercelConfig } from "./post-process";
export { writeKubojsConfigToVfs } from "./kubojs-config";

export { EMBEDDED_TEMPLATES, TEMPLATE_COUNT } from "./templates.generated";
export { dependencyVersionMap, type AvailableDependencies } from "./utils/add-deps";
export { generateReproducibleCommand } from "./utils/reproducible-command";
