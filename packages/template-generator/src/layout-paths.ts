import { expandLayoutConfig, type ProjectConfig } from "@kubojs/types";

export function getWebAppPath(config: ProjectConfig): string {
  return expandLayoutConfig(config.layout).apps.web;
}

export function getStoragePackagePath(config: ProjectConfig): string {
  return expandLayoutConfig(config.layout).packages.storage;
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
