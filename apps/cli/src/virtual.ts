/**
 * Virtual filesystem export for web preview
 * Re-exports from @kubojs/template-generator for browser-compatible usage
 */

export {
  generate,
  VirtualFileSystem,
  type VirtualFileTree,
  type VirtualFile,
  type VirtualDirectory,
  type VirtualNode,
  type GeneratorOptions,
  GeneratorError,
  EMBEDDED_TEMPLATES,
  TEMPLATE_COUNT,
} from "@kubojs/template-generator";

export { Result } from "better-result";

export type {
  Database,
  ORM,
  Backend,
  Runtime,
  Frontend,
  Addons,
  Examples,
  PackageManager,
  DatabaseSetup,
  API,
  Auth,
  Payments,
  WebDeploy,
  ServerDeploy,
  ProjectConfig,
} from "@kubojs/types";
