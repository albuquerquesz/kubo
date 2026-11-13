import path from "node:path";

import { $ } from "execa";

import type { PackageManager, ProjectConfig } from "../../types";
import { pkgDir } from "../../utils/layout-paths";
import { getPackageExecutionArgs } from "../../utils/package-runner";

// having problems running this in convex + better-auth
export async function runConvexCodegen(
  projectDir: string,
  packageManager: PackageManager | null | undefined,
  layout?: ProjectConfig["layout"],
) {
  const backendDir = path.join(projectDir, pkgDir({ layout }, "backend"));
  const args = getPackageExecutionArgs(packageManager, "convex codegen");
  await $({ cwd: backendDir })`${args}`;
}
