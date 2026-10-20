import fs from "node:fs";
import path from "node:path";

import {
  expandLayoutConfig,
  type Backend,
  type LayoutAppId,
  type LayoutConfig,
  type LayoutPackageId,
  type ResolvedLayout,
} from "@kubojs/types";
import { Result } from "better-result";

import { LayoutResolveError } from "./types";

export interface ResolveLayoutOptions {
  backend?: Backend;
  addonsToAdd?: readonly string[];
}

function collectRequiredPaths(
  expanded: ReturnType<typeof expandLayoutConfig>,
  options: ResolveLayoutOptions,
): string[] {
  const required = new Set<string>([expanded.apps.web]);

  const backend = options.backend ?? "none";
  if (backend === "convex") {
    required.add(expanded.packages.backend);
  } else if (backend !== "self" && backend !== "none") {
    required.add(expanded.apps.server);
  }

  return [...required];
}

export function resolveLayout(
  layout: LayoutConfig | undefined,
  projectDir: string,
  options: ResolveLayoutOptions = {},
): Result<ResolvedLayout, LayoutResolveError> {
  const expanded = expandLayoutConfig(layout);
  const pathOwners = new Map<string, string>();
  const missing: string[] = [];

  for (const [id, relativePath] of Object.entries(expanded.apps)) {
    const existingOwner = pathOwners.get(relativePath);
    const logicalId = `app:${id}`;
    if (existingOwner && existingOwner !== logicalId) {
      return Result.err(
        new LayoutResolveError({
          code: "path_collision",
          message: `Layout path collision: "${relativePath}" is used by ${existingOwner} and ${logicalId}`,
        }),
      );
    }
    pathOwners.set(relativePath, logicalId);
  }

  for (const [id, relativePath] of Object.entries(expanded.packages)) {
    const existingOwner = pathOwners.get(relativePath);
    const logicalId = `package:${id}`;
    if (existingOwner && existingOwner !== logicalId) {
      return Result.err(
        new LayoutResolveError({
          code: "path_collision",
          message: `Layout path collision: "${relativePath}" is used by ${existingOwner} and ${logicalId}`,
        }),
      );
    }
    pathOwners.set(relativePath, logicalId);
  }

  for (const relativePath of collectRequiredPaths(expanded, options)) {
    const absolute = path.join(projectDir, relativePath);
    if (!fs.existsSync(absolute)) {
      missing.push(relativePath);
    }
  }

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

  function resolvePath(logical: LayoutAppId | LayoutPackageId, kind: "app" | "package"): string {
    const paths: Partial<Record<string, string>> =
      kind === "app" ? expanded.apps : expanded.packages;
    const value = paths[logical];
    if (!value) throw new Error(`Unknown layout ${kind} id: ${logical}`);
    return value;
  }

  const resolver: ResolvedLayout = {
    preset: expanded.preset,
    apps: expanded.apps,
    packages: expanded.packages,
    path: resolvePath,
    file(logical, kind, ...segments) {
      return path.join(resolvePath(logical, kind), ...segments);
    },
    rootPackagePath() {
      return ".";
    },
  };

  return Result.ok(resolver);
}
