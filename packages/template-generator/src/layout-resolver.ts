import fs from "node:fs";
import path from "node:path";

import {
  expandLayoutConfig,
  findLayoutConflicts,
  getLayoutPackagePath,
  relativeLayoutPath,
  type Backend,
  type ExpandedLayoutConfig,
  type LayoutAppId,
  type LayoutConfig,
  type ResolvedLayout,
} from "@kubojs/types";
import { Result } from "better-result";

import { LayoutResolveError } from "./types";

export interface ResolveLayoutOptions {
  backend?: Backend;
  addonsToAdd?: readonly string[];
}

function collectRequiredPaths(
  expanded: ExpandedLayoutConfig,
  options: ResolveLayoutOptions,
): string[] {
  const required = new Set<string>([expanded.apps.web]);

  const backend = options.backend ?? "none";
  if (backend === "convex") {
    required.add(expanded.packages.backend ?? getLayoutPackagePath(expanded, "backend"));
  } else if (backend !== "self" && backend !== "none") {
    required.add(expanded.apps.server);
  }

  return [...required];
}

function isLayoutAppId(expanded: ExpandedLayoutConfig, id: string): id is LayoutAppId {
  return Object.hasOwn(expanded.apps, id);
}

function toResolver(expanded: ExpandedLayoutConfig): ResolvedLayout {
  function resolvePath(logical: string, kind: "app" | "package"): string {
    if (kind === "package") return getLayoutPackagePath(expanded, logical);
    if (!isLayoutAppId(expanded, logical)) throw new Error(`Unknown layout app id: ${logical}`);
    return expanded.apps[logical];
  }

  return {
    preset: expanded.preset,
    dirs: expanded.dirs,
    apps: expanded.apps,
    packages: expanded.packages,
    path: resolvePath,
    file(logical: string, kind: "app" | "package", ...segments: string[]) {
      return path.posix.join(resolvePath(logical, kind), ...segments);
    },
    relative: relativeLayoutPath,
    rootPackagePath() {
      return ".";
    },
  };
}

/**
 * Validates a layout (collisions, case-only collisions, nested folders) and returns
 * a resolver. Pure: does not touch the filesystem. Used when creating projects.
 */
export function createLayoutResolver(
  layout: LayoutConfig | undefined,
): Result<ResolvedLayout, LayoutResolveError> {
  const expanded = expandLayoutConfig(layout);
  const [conflict] = findLayoutConflicts(expanded);
  if (conflict) {
    return Result.err(new LayoutResolveError({ code: conflict.code, message: conflict.message }));
  }
  return Result.ok(toResolver(expanded));
}

/**
 * Resolves the layout of an existing project: validates it and checks that the
 * folders the stack needs exist on disk. Used by `kubo add`.
 */
export function resolveLayout(
  layout: LayoutConfig | undefined,
  projectDir: string,
  options: ResolveLayoutOptions = {},
): Result<ResolvedLayout, LayoutResolveError> {
  const resolverResult = createLayoutResolver(layout);
  if (resolverResult.isErr()) return resolverResult;

  const expanded = expandLayoutConfig(layout);
  const missing = collectRequiredPaths(expanded, options).filter(
    (relativePath) => !fs.existsSync(path.join(projectDir, relativePath)),
  );

  if (missing.length > 0) {
    return Result.err(
      new LayoutResolveError({
        code: "missing_paths",
        message: [
          "The following paths from kubo.config.ts layout do not exist on disk:",
          ...missing.map((entry) => `  - ${entry}`),
          "",
          "If you moved or renamed app or package folders, update layout.apps and layout.packages in kubo.config.ts to match, then run add again.",
        ].join("\n"),
      }),
    );
  }

  return resolverResult;
}
