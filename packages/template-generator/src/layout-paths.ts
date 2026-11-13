import {
  expandLayoutConfig,
  getLayoutPackagePath,
  getLayoutWorkspaceGlobs,
  type ProjectConfig,
} from "@kubojs/types";

export function getWebAppPath(config: ProjectConfig): string {
  return expandLayoutConfig(config.layout).apps.web;
}

export function getStoragePackagePath(config: ProjectConfig): string {
  return getLayoutPackagePath(expandLayoutConfig(config.layout), "storage");
}

export function getCatalogPackagePaths(config: ProjectConfig): string[] {
  const expanded = expandLayoutConfig(config.layout);
  const paths = new Set<string>([
    ".",
    ...Object.values(expanded.apps),
    ...Object.values(expanded.packages),
  ]);
  return [...paths];
}

/** Workspace globs (package.json `workspaces`, pnpm-workspace.yaml) for the project layout. */
export function getWorkspaceGlobs(config: ProjectConfig): string[] {
  return getLayoutWorkspaceGlobs(expandLayoutConfig(config.layout));
}
