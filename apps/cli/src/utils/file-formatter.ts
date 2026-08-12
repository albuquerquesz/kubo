import path from "node:path";

import { Result } from "better-result";
import { $ } from "execa";
import fs from "fs-extra";
import { format, type FormatOptions } from "oxfmt";

import { ProjectCreationError } from "./errors";
import { shouldSkipExternalCommands } from "./external-commands";

const formatOptions: FormatOptions = {
  experimentalSortPackageJson: true,
  experimentalSortImports: {
    order: "asc",
  },
};

/** Files that must not be rewritten by post-scaffold formatters. */
const SKIP_FILE_NAMES = new Set([
  "kubojs.jsonrc",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "Cargo.lock",
  "composer.lock",
]);

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".wasm",
  ".zip",
  ".gz",
  ".tgz",
  ".br",
  ".pdf",
  ".db",
  ".sqlite",
]);

export type FormatProjectOptions = {
  /**
   * Project addons. When `biome` or `ultracite` is present, post-format with
   * Biome (`check --write`) so scaffold matches `biome check`.
   * Otherwise oxfmt is used (oxlint / no quality addon).
   */
  addons?: readonly string[];
};

function shouldSkipFile(fileName: string): boolean {
  if (SKIP_FILE_NAMES.has(fileName)) return true;
  const ext = path.extname(fileName).toLowerCase();
  return SKIP_EXTENSIONS.has(ext);
}

function shouldUseBiomeFormatter(addons: readonly string[] | undefined): boolean {
  if (!addons) return false;
  return addons.includes("biome") || addons.includes("ultracite");
}

export async function formatCode(filePath: string, content: string): Promise<string | null> {
  const result = await Result.tryPromise({
    try: async () => {
      const formatResult = await format(path.basename(filePath), content, formatOptions);

      if (formatResult.errors && formatResult.errors.length > 0) {
        return null;
      }

      return formatResult.code;
    },
    catch: () => null,
  });

  return result.isOk() ? result.value : null;
}

async function formatProjectWithOxfmt(projectDir: string): Promise<void> {
  async function formatDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist" ||
            entry.name === ".turbo"
          ) {
            return;
          }
          await formatDirectory(fullPath);
        } else if (entry.isFile()) {
          if (shouldSkipFile(entry.name)) return;

          const fileResult = await Result.tryPromise({
            try: async () => {
              const content = await fs.readFile(fullPath, "utf-8");
              const formatted = await formatCode(fullPath, content);
              if (formatted && formatted !== content) {
                await fs.writeFile(fullPath, formatted, "utf-8");
              }
            },
            catch: () => undefined,
          });
          void fileResult;
        }
      }),
    );
  }

  await formatDirectory(projectDir);
}

/**
 * Format with Biome so scaffold matches `biome check` (source of truth).
 * Uses bunx so it works before local install. Best-effort: failures are ignored
 * so offline CI/tests still scaffold.
 */
async function formatProjectWithBiome(projectDir: string): Promise<void> {
  if (shouldSkipExternalCommands()) {
    return;
  }

  const biomeResult = await Result.tryPromise({
    try: async () => {
      await $({
        cwd: projectDir,
        reject: false,
        stdio: "pipe",
      })`bunx --bun @biomejs/biome@2.5.8 check --write .`;
    },
    catch: () => undefined,
  });
  void biomeResult;
}

/**
 * Post-scaffold format.
 * - biome / ultracite → Biome `check --write` (not oxfmt)
 * - oxlint / none → oxfmt
 * Always skips kubojs.jsonrc, lockfiles, and binary extensions (oxfmt path).
 */
export async function formatProject(
  projectDir: string,
  options: FormatProjectOptions = {},
): Promise<Result<void, ProjectCreationError>> {
  return Result.tryPromise({
    try: async () => {
      if (shouldUseBiomeFormatter(options.addons)) {
        await formatProjectWithBiome(projectDir);
        return;
      }

      await formatProjectWithOxfmt(projectDir);
    },
    catch: (e) =>
      new ProjectCreationError({
        phase: "formatting",
        message: `Failed to format project: ${e instanceof Error ? e.message : String(e)}`,
        cause: e,
      }),
  });
}
