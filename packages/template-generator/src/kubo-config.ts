import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "./core/virtual-fs";
import { buildKuboConfigFromProject, serializeKuboConfigFile } from "./kubo-config-serializer";

export const KUBO_CONFIG_FILE = "kubo.config.ts";

type PackageJson = {
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

function ensureConfigDevDependency(vfs: VirtualFileSystem, cliVersion: string): void {
  const pkg = vfs.readJson<PackageJson>("package.json");
  if (!pkg) return;

  pkg.devDependencies = {
    ...pkg.devDependencies,
    "@kubojs/config": cliVersion,
  };
  vfs.writeJson("package.json", pkg);
}

/**
 * Writes kubo.config.ts to the VFS (browser-safe).
 */
export function writeKuboConfigToVfs(
  vfs: VirtualFileSystem,
  projectConfig: ProjectConfig,
  version: string,
): void {
  const kuboConfig = buildKuboConfigFromProject(projectConfig, version);
  const content = serializeKuboConfigFile(kuboConfig);

  vfs.writeFile(KUBO_CONFIG_FILE, content);
  ensureConfigDevDependency(vfs, version);
}

/** @deprecated Use {@link writeKuboConfigToVfs}. */
export function writeKubojsConfigToVfs(
  vfs: VirtualFileSystem,
  projectConfig: ProjectConfig,
  version: string,
  _reproducibleCommand?: string,
): void {
  writeKuboConfigToVfs(vfs, projectConfig, version);
}
