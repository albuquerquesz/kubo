import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { rewriteImports } from "./imports";
import { planArchitectureMoves } from "./rules";

const SOURCE_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|vue|svelte|astro)$/;

/**
 * Reorganizes the generated API and web app for `config.architecture` (feature, layered or
 * clean): moves files and rewrites the imports that point at them. Without an architecture the
 * output is left exactly as generated.
 */
export function processArchitecture(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!config.architecture) return;
  const oldFiles = vfs.getAllFiles();
  const plan = planArchitectureMoves(config, oldFiles);
  if (plan.moves.size === 0 && !plan.componentsAlias) return;

  const oldFileSet = new Set(oldFiles);
  const rewritten = new Set<string>();
  // Most specific app first, so a web app at the project root does not claim the API's files.
  const apps = [...plan.apps].sort((a, b) => b.dir.length - a.dir.length);
  for (const app of apps) {
    const prefix = app.dir === "" || app.dir === "." ? "" : `${app.dir}/`;
    const context = {
      oldFiles: oldFileSet,
      moves: plan.moves,
      aliasRoot: app.aliasRoot,
      libRoot: app.libRoot,
    };
    for (const oldPath of oldFiles) {
      if (prefix && !oldPath.startsWith(prefix)) continue;
      if (!SOURCE_FILE.test(oldPath) || rewritten.has(oldPath)) continue;
      rewritten.add(oldPath);
      const newPath = plan.moves.get(oldPath) ?? oldPath;
      const content = vfs.readFile(oldPath);
      if (content === undefined) continue;
      const next = rewriteImports(content, oldPath, newPath, context);
      if (next !== content) vfs.writeFile(oldPath, next);
    }
  }

  for (const [from, to] of plan.moves) vfs.moveFile(from, to);

  if (plan.componentsAlias) {
    const json = vfs.readJson<{ aliases?: Record<string, string> }>(plan.componentsAlias.file);
    if (json?.aliases) {
      json.aliases.components = plan.componentsAlias.value;
      vfs.writeJson(plan.componentsAlias.file, json);
    }
  }
}
