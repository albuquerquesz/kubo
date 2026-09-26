import path from "node:path";

import { KUBO_CONFIG_FILE, serializeKuboConfigFile } from "@kubojs/template-generator";
import {
  KuboConfigFileSchema,
  KubojsConfigFileSchema,
  normalizeLegacyKuboConfig,
  type KuboConfig,
} from "@kubojs/types";
import { Result } from "better-result";
import fs from "fs-extra";
import { createJiti } from "jiti";
import { parse } from "jsonc-parser";

import { KuboConfigInvalidError } from "./errors";

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

function configInvalid(
  file: string,
  detail: string,
  cause?: unknown,
): Result<never, KuboConfigInvalidError> {
  return Result.err(
    new KuboConfigInvalidError({
      file,
      message: `Invalid ${file}: ${detail}`,
      cause,
    }),
  );
}

async function loadTypeScriptConfig(
  projectDir: string,
): Promise<Result<KuboConfig | null, KuboConfigInvalidError>> {
  const configPath = await findConfigFile(projectDir);
  if (!configPath) {
    return Result.ok(null);
  }

  const fileName = path.basename(configPath);
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    moduleCache: false,
  });

  const importResult = await Result.tryPromise({
    try: () => jiti.import(configPath),
    catch: (e: unknown) =>
      new KuboConfigInvalidError({
        file: fileName,
        message: `Invalid ${fileName}: ${e instanceof Error ? e.message : String(e)}`,
        cause: e,
      }),
  });

  if (importResult.isErr()) {
    return Result.err(importResult.error);
  }

  const loaded = importResult.value;
  const exported = (loaded as { default?: unknown }).default ?? loaded;
  const parsed = KuboConfigFileSchema.safeParse(exported);

  if (!parsed.success) {
    return configInvalid(fileName, parsed.error.issues.map((issue) => issue.message).join("; "));
  }

  return Result.ok(normalizeLegacyKuboConfig(parsed.data));
}

async function loadLegacyJsonConfig(
  projectDir: string,
): Promise<Result<KuboConfig | null, KuboConfigInvalidError>> {
  const configPath = path.join(projectDir, LEGACY_CONFIG_FILE);
  if (!(await fs.pathExists(configPath))) {
    return Result.ok(null);
  }

  const configContent = await fs.readFile(configPath, "utf-8");
  const raw = parse(configContent);
  const parsed = KubojsConfigFileSchema.safeParse(raw);

  if (!parsed.success) {
    return configInvalid(
      LEGACY_CONFIG_FILE,
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  return Result.ok(normalizeLegacyKuboConfig(parsed.data));
}

export async function loadProjectKuboConfig(
  projectDir: string,
): Promise<Result<KuboConfig | null, KuboConfigInvalidError>> {
  const tsResult = await loadTypeScriptConfig(projectDir);
  if (tsResult.isErr()) {
    return tsResult;
  }
  if (tsResult.value) {
    return tsResult;
  }

  return loadLegacyJsonConfig(projectDir);
}

export async function readKubojsConfig(
  projectDir: string,
): Promise<Result<KuboConfig | null, KuboConfigInvalidError>> {
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
): Promise<Result<void, KuboConfigInvalidError>> {
  const existingResult = await loadProjectKuboConfig(projectDir);
  if (existingResult.isErr()) {
    return Result.err(existingResult.error);
  }

  const existing = existingResult.value;
  if (!existing) {
    return Result.ok(undefined);
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
  return Result.ok(undefined);
}

/** @deprecated Use {@link updateProjectKuboConfig}. */
export async function updateKubojsConfig(
  projectDir: string,
  updates: KuboConfigPatch,
): Promise<Result<void, KuboConfigInvalidError>> {
  return updateProjectKuboConfig(projectDir, updates);
}

export async function isKubojsProject(projectDir: string): Promise<boolean> {
  if (await findConfigFile(projectDir)) {
    return true;
  }
  return fs.pathExists(path.join(projectDir, LEGACY_CONFIG_FILE));
}
