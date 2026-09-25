import path from "node:path";

import { KUBO_CONFIG_FILE, serializeKuboConfigFile } from "@kubojs/template-generator";
import {
  KuboConfigFileSchema,
  KubojsConfigFileSchema,
  normalizeLegacyKuboConfig,
  type KuboConfig,
} from "@kubojs/types";
import fs from "fs-extra";
import { createJiti } from "jiti";
import { parse } from "jsonc-parser";

export { KUBO_CONFIG_FILE };

const LEGACY_CONFIG_FILE = "kubojs.jsonrc";

const CONFIG_CANDIDATES = [
  "kubo.config.ts",
  "kubo.config.mts",
  "kubo.config.js",
  "kubo.config.mjs",
] as const;

async function findConfigFile(projectDir: string): Promise<string | null> {
  for (const candidate of CONFIG_CANDIDATES) {
    const absolute = path.join(projectDir, candidate);
    if (await fs.pathExists(absolute)) {
      return absolute;
    }
  }
  return null;
}

async function loadTypeScriptConfig(projectDir: string): Promise<KuboConfig | null> {
  const configPath = await findConfigFile(projectDir);
  if (!configPath) {
    return null;
  }

  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    moduleCache: false,
  });

  const loaded = await jiti.import(configPath);
  const exported = (loaded as { default?: unknown }).default ?? loaded;
  const parsed = KuboConfigFileSchema.safeParse(exported);

  if (!parsed.success) {
    throw new Error(
      `Invalid ${path.basename(configPath)}: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`,
    );
  }

  return normalizeLegacyKuboConfig(parsed.data);
}

async function loadLegacyJsonConfig(projectDir: string): Promise<KuboConfig | null> {
  const configPath = path.join(projectDir, LEGACY_CONFIG_FILE);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const configContent = await fs.readFile(configPath, "utf-8");
  const raw = parse(configContent);
  const parsed = KubojsConfigFileSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Invalid ${LEGACY_CONFIG_FILE}: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`,
    );
  }

  return normalizeLegacyKuboConfig(parsed.data);
}

export async function loadProjectKuboConfig(projectDir: string): Promise<KuboConfig | null> {
  const tsConfig = await loadTypeScriptConfig(projectDir);
  if (tsConfig) {
    const hasLegacy = await fs.pathExists(path.join(projectDir, LEGACY_CONFIG_FILE));
    if (hasLegacy) {
      // TS wins; legacy file is ignored for reads.
    }
    return tsConfig;
  }

  return loadLegacyJsonConfig(projectDir);
}

export async function readKubojsConfig(projectDir: string): Promise<KuboConfig | null> {
  return loadProjectKuboConfig(projectDir);
}

export type KuboConfigPatch = Partial<
  Pick<
    KuboConfig,
    | "addons"
    | "addonOptions"
    | "dbSetupOptions"
    | "webDeploy"
    | "serverDeploy"
    | "testing"
    | "layout"
  >
>;

export async function updateProjectKuboConfig(
  projectDir: string,
  updates: KuboConfigPatch,
): Promise<void> {
  const existing = await loadProjectKuboConfig(projectDir);
  if (!existing) {
    return;
  }

  const merged: KuboConfig = {
    ...existing,
    ...updates,
    addonOptions: updates.addonOptions ?? existing.addonOptions,
    dbSetupOptions: updates.dbSetupOptions ?? existing.dbSetupOptions,
  };

  const configPath = (await findConfigFile(projectDir)) ?? path.join(projectDir, KUBO_CONFIG_FILE);
  const content = serializeKuboConfigFile(merged);

  await fs.writeFile(configPath, content, "utf-8");
}

/** @deprecated Use {@link updateProjectKuboConfig}. */
export async function updateKubojsConfig(
  projectDir: string,
  updates: KuboConfigPatch,
): Promise<void> {
  await updateProjectKuboConfig(projectDir, updates);
}

export async function isKubojsProject(projectDir: string): Promise<boolean> {
  if (await findConfigFile(projectDir)) {
    return true;
  }
  return fs.pathExists(path.join(projectDir, LEGACY_CONFIG_FILE));
}
