import path from "node:path";

import { isBinaryFile, VirtualFileSystem } from "@kubojs/template-generator";
import fs from "fs-extra";

const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".turbo",
  "artifacts",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

/**
 * Imports the editable text surface of an existing project into the VFS.
 * Generated/dependency directories and binary files remain owned by the filesystem.
 */
export async function loadProjectTextFiles(
  vfs: VirtualFileSystem,
  projectDir: string,
): Promise<void> {
  await loadDirectory(vfs, projectDir, projectDir);
}

async function loadDirectory(
  vfs: VirtualFileSystem,
  projectDir: string,
  currentDir: string,
): Promise<void> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;

    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) continue;
      await loadDirectory(vfs, projectDir, absolutePath);
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = path.relative(projectDir, absolutePath);
    if (isBinaryFile(relativePath)) continue;

    const content = await fs.readFile(absolutePath);
    if (isBinaryContent(content)) continue;

    vfs.loadFile(relativePath, content.toString("utf-8"));
  }
}

function isBinaryContent(content: Uint8Array): boolean {
  if (content.includes(0)) return true;

  try {
    new TextDecoder("utf-8", { fatal: true }).decode(content);
    return false;
  } catch {
    return true;
  }
}
