import path from "node:path";

import fs from "fs-extra";

import { addPackageDependency } from "../../utils/add-package-deps";

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
