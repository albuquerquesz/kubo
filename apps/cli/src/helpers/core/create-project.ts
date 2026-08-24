import os from "node:os";
import path from "node:path";

import { log } from "@clack/prompts";
import { generate, EMBEDDED_TEMPLATES } from "@kubojs/template-generator";
import { writeTree } from "@kubojs/template-generator/fs-writer";
import { Result } from "better-result";
import { $ } from "execa";
import fs from "fs-extra";

import type { DbSetupOptions, ProjectConfig } from "../../types";
import { isSilent } from "../../utils/context";
import { ProjectCreationError } from "../../utils/errors";
import { formatProject } from "../../utils/file-formatter";
import { generateRouteTreeIfNeeded } from "../../utils/generate-route-tree";
import { getLatestCLIVersion } from "../../utils/get-latest-cli-version";
import { setupAddons } from "../addons/addons-setup";
import { setupDatabase } from "../core/db-setup";
import { installPlaywrightBrowsers, setupTesting } from "../testing/testing-setup";
import { initializeGit } from "./git";
import { installDependencies } from "./install-dependencies";
import { displayPostInstallInstructions } from "./post-installation";

export interface CreateProjectOptions {
  manualDb?: boolean;
  dbSetupOptions?: DbSetupOptions;
}

/**
 * Creates a new project with the given configuration.
 * Returns a Result with the project directory path on success, or an error on failure.
 */
export async function createProject(
  options: ProjectConfig,
  cliInput: CreateProjectOptions = {},
): Promise<Result<string, ProjectCreationError>> {
  return Result.gen(async function* () {
    const projectDir = options.projectDir;
    const isConvex = options.backend === "convex";

    // Ensure project directory exists
    yield* Result.await(
      Result.tryPromise({
        try: () => fs.ensureDir(projectDir),
        catch: (e) =>
          new ProjectCreationError({
            phase: "directory-setup",
            message: `Failed to create project directory: ${e instanceof Error ? e.message : String(e)}`,
            cause: e,
          }),
      }),
    );

    // Generate virtual project using Result-based API
    const tree = yield* Result.await(
      generate({
        config: options,
        templates: EMBEDDED_TEMPLATES,
        version: getLatestCLIVersion(),
      }).then((result) =>
        result.mapError(
          (e) =>
            new ProjectCreationError({
              phase: e.phase || "template-generation",
              message: e.message,
              cause: e,
            }),
        ),
      ),
    );

    // Write tree to filesystem using Result-based API
    yield* Result.await(
      writeTree(tree, projectDir).then((result) =>
        result.mapError(
          (e) =>
            new ProjectCreationError({
              phase: "file-writing",
              message: e.message,
              cause: e,
            }),
        ),
      ),
    );

    // Generate TanStack routeTree.gen.ts so typecheck works without a prior vite build
    yield* Result.await(generateRouteTreeIfNeeded(projectDir, options));

    // Set package manager version
    yield* Result.await(setPackageManagerVersion(projectDir, options.packageManager));

    // Setup database if needed
    if (!isConvex && options.database !== "none") {
      yield* Result.await(
        Result.tryPromise({
          try: () => setupDatabase(options, cliInput),
          catch: (e) =>
            new ProjectCreationError({
              phase: "database-setup",
              message: `Failed to setup database: ${e instanceof Error ? e.message : String(e)}`,
              cause: e,
            }),
        }),
      );
    }

    // Setup addons if any
    const hasAddons = options.addons.some((addon) => addon !== "none");
    const hasTesting = options.testing.some((tool) => tool !== "none");
    if (hasAddons) {
      yield* Result.await(
        Result.tryPromise({
          try: () => setupAddons(options),
          catch: (e) =>
            new ProjectCreationError({
              phase: "addons-setup",
              message: `Failed to setup addons: ${e instanceof Error ? e.message : String(e)}`,
              cause: e,
            }),
        }),
      );
    }
    if (hasTesting) {
      yield* Result.await(
        Result.tryPromise({
          try: () => setupTesting(projectDir, options.testing),
          catch: (e) =>
            new ProjectCreationError({ phase: "testing-setup", message: String(e), cause: e }),
        }),
      );
    }

    // Format project (skip oxfmt when Biome owns formatting)
    yield* Result.await(formatProject(projectDir, { addons: options.addons }));

    if (!isSilent()) log.success("Project template successfully scaffolded!");

    // Install dependencies if requested
    if (options.install) {
      yield* Result.await(
        installDependencies({
          projectDir,
          packageManager: options.packageManager,
        }),
      );

      if (options.testing.includes("playwright")) {
        await installPlaywrightBrowsers(projectDir, options.packageManager);
      }
    }

    // Initialize git if requested
    yield* Result.await(initializeGit(projectDir, options.git));

    // Display post-install instructions
    if (!isSilent()) {
      await displayPostInstallInstructions({
        ...options,
        depsInstalled: options.install,
      });
    }

    return Result.ok(projectDir);
  });
}

/**
 * Corepack/Turbo require `name@x.y.z`. Placeholders like `@latest` are invalid.
 */
function isValidPackageManagerField(value: string): boolean {
  return /^(bun|npm|pnpm|yarn)@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

function normalizePackageManagerVersion(version: string): string | null {
  const cleaned = version.replace(/^v/i, "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

async function resolveInstalledPackageManagerVersion(
  packageManager: ProjectConfig["packageManager"],
): Promise<string | null> {
  // Prefer the runtime bun version when available — no shell required, always semver.
  if (
    packageManager === "bun" &&
    typeof process.versions.bun === "string" &&
    process.versions.bun.length > 0
  ) {
    return normalizePackageManagerVersion(process.versions.bun);
  }

  const versionResult = await Result.tryPromise({
    try: async () => {
      // Run in a neutral directory to avoid local package manager shims affecting lookup.
      const { stdout } = await $({ cwd: os.tmpdir() })`${packageManager} -v`;
      return normalizePackageManagerVersion(stdout);
    },
    catch: () => null as string | null,
  });

  return versionResult.isOk() ? versionResult.value : null;
}

async function setPackageManagerVersion(
  projectDir: string,
  packageManager: ProjectConfig["packageManager"],
): Promise<Result<void, ProjectCreationError>> {
  const pkgJsonPath = path.join(projectDir, "package.json");

  if (!(await fs.pathExists(pkgJsonPath))) {
    return Result.ok(undefined);
  }

  const version = await resolveInstalledPackageManagerVersion(packageManager);

  return Result.tryPromise({
    try: async () => {
      const pkgJson = await fs.readJson(pkgJsonPath);

      if (version) {
        const packageManagerField = `${packageManager}@${version}`;
        if (isValidPackageManagerField(packageManagerField)) {
          pkgJson.packageManager = packageManagerField;
        } else {
          delete pkgJson.packageManager;
        }
      } else {
        // Prefer omitting the field over writing an invalid pin (e.g. `@latest`).
        delete pkgJson.packageManager;
      }

      await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
    },
    catch: (e) =>
      new ProjectCreationError({
        phase: "package-manager-version",
        message: `Failed to set package manager version: ${e instanceof Error ? e.message : String(e)}`,
        cause: e,
      }),
  });
}
