import path from "node:path";

import { $ } from "execa";
import fs from "fs-extra";
import pc from "picocolors";

import type { PackageManager } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";
import { shouldSkipExternalCommands } from "../../utils/external-commands";
import { getPackageExecutionArgs } from "../../utils/package-runner";
import { cliLog, createSpinner } from "../../utils/terminal-output";

async function updateScripts(projectDir: string, scripts: Record<string, string>) {
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return;
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.scripts = { ...packageJson.scripts, ...scripts };
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

export async function setupTesting(projectDir: string, testing: readonly string[]): Promise<void> {
  if (testing.includes("vitest")) {
    await addPackageDependency({ devDependencies: ["vitest"], projectDir });
    await updateScripts(projectDir, { test: "vitest run", "test:watch": "vitest" });
  }
  if (testing.includes("playwright")) {
    await addPackageDependency({ devDependencies: ["@playwright/test"], projectDir });
    await updateScripts(projectDir, { "test:e2e": "playwright test" });
  }
}

/** Best-effort browser install after deps; never fails project creation. */
export async function installPlaywrightBrowsers(
  projectDir: string,
  packageManager: PackageManager,
): Promise<void> {
  if (shouldSkipExternalCommands()) return;

  const s = createSpinner();
  s.start("Installing Playwright browsers...");
  const args = getPackageExecutionArgs(packageManager, "playwright install");

  try {
    await $({ cwd: projectDir })`${args}`;
    s.stop(pc.green("Playwright browsers installed"));
  } catch (e) {
    s.stop(pc.yellow("Playwright browser install skipped (run playwright install later)"));
    cliLog.info(
      pc.dim(
        `Playwright browsers were not installed automatically: ${e instanceof Error ? e.message : String(e)}`,
      ),
    );
  }
}
