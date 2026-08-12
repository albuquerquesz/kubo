import path from "node:path";

import { configSchema, Generator } from "@tanstack/router-generator";
import { Result } from "better-result";
import fs from "fs-extra";

import type { Frontend, ProjectConfig } from "../types";
import { ProjectCreationError } from "./errors";

const TANSTACK_ROUTE_TREE_FRONTENDS = [
  "tanstack-router",
  "tanstack-start",
  "solid",
] as const satisfies readonly Frontend[];

function resolveRouteTreeTarget(frontend: readonly Frontend[]): "react" | "solid" | null {
  if (frontend.includes("solid")) return "solid";
  if (frontend.includes("tanstack-router") || frontend.includes("tanstack-start")) {
    return "react";
  }
  return null;
}

function needsRouteTree(frontend: readonly Frontend[]): boolean {
  return frontend.some((value) =>
    (TANSTACK_ROUTE_TREE_FRONTENDS as readonly string[]).includes(value),
  );
}

/**
 * Generate apps/web/src/routeTree.gen.ts from the scaffolded file routes.
 * TanStack recommends committing this file (runtime source, not a build artifact).
 * Running at create-time makes `check-types` pass without a prior vite build.
 */
export async function generateRouteTreeIfNeeded(
  projectDir: string,
  config: Pick<ProjectConfig, "frontend">,
): Promise<Result<void, ProjectCreationError>> {
  if (!needsRouteTree(config.frontend)) {
    return Result.ok(undefined);
  }

  const target = resolveRouteTreeTarget(config.frontend);
  if (!target) {
    return Result.ok(undefined);
  }

  const webAppDir = path.join(projectDir, "apps/web");
  const routesDir = path.join(webAppDir, "src/routes");

  if (!(await fs.pathExists(routesDir))) {
    return Result.ok(undefined);
  }

  return Result.tryPromise({
    try: async () => {
      // configSchema absolutizes relative paths against process.cwd() — always pass
      // absolute paths so generation works when the CLI CWD is not the web app.
      const configParsed = configSchema.parse({
        target,
        routesDirectory: path.join(webAppDir, "src/routes"),
        generatedRouteTree: path.join(webAppDir, "src/routeTree.gen.ts"),
        // tmpDir also absolutizes against cwd; pin under the web app
        tmpDir: path.join(webAppDir, ".tanstack/tmp"),
        autoCodeSplitting: true,
        disableLogging: true,
        enableRouteTreeFormatting: true,
        quoteStyle: "single",
        semicolons: false,
      });

      const generator = new Generator({
        config: configParsed,
        root: webAppDir,
      });

      await generator.run();
    },
    catch: (e) =>
      new ProjectCreationError({
        phase: "route-tree-generation",
        message: `Failed to generate TanStack route tree: ${e instanceof Error ? e.message : String(e)}`,
        cause: e,
      }),
  });
}
