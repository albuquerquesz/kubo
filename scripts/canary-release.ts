import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { confirm, isCancel, multiselect, spinner } from "@clack/prompts";
import { $ } from "bun";
import semver from "semver";

const CLI_PACKAGE_JSON_PATH = join(process.cwd(), "apps/cli/package.json");
const ALIAS_PACKAGE_JSON_PATH = join(process.cwd(), "packages/create-bts/package.json");
const TYPES_PACKAGE_JSON_PATH = join(process.cwd(), "packages/types/package.json");
const TEMPLATE_GENERATOR_PACKAGE_JSON_PATH = join(
  process.cwd(),
  "packages/template-generator/package.json",
);

function isCanaryVersion(version: string): boolean {
  return version.includes("-canary.") || version.includes("+canary.");
}

async function getPublishedVersions(packageName: string): Promise<string[]> {
  const versionsJson = await $`npm view ${packageName} versions --json`.text();
  const versions = JSON.parse(versionsJson) as string[];
  return Array.isArray(versions) ? versions : [];
}

async function isDeprecated(packageName: string, version: string): Promise<boolean> {
  try {
    const deprecatedJson =
      await $`npm view ${`${packageName}@${version}`} deprecated --json`.text();
    const deprecatedMsg = deprecatedJson ? JSON.parse(deprecatedJson) : null;
    return Boolean(deprecatedMsg);
  } catch {
    return false;
  }
}

async function deprecateVersion(
  packageName: string,
  version: string,
  replacementVersion: string,
): Promise<boolean> {
  try {
    await $`npm deprecate -f ${`${packageName}@${version}`} "Deprecated canary; use ${packageName}@canary (currently ${replacementVersion})"`;
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const deprecateOld = args.includes("--deprecate-old") || args.includes("--prune-old");
  const autoYes = args.includes("--yes");

  const packageJson = JSON.parse(await readFile(CLI_PACKAGE_JSON_PATH, "utf-8"));
  const currentVersion = packageJson.version;
  const packageName: string = packageJson.name || "kubojs";
  const baseVersion = semver.coerce(currentVersion)?.version ?? currentVersion;
  console.log(`Current version: ${currentVersion}`);
  if (baseVersion !== currentVersion) {
    console.log(`Sanitized base version: ${baseVersion}`);
  }

  const commitHash = (await $`git rev-parse --short HEAD`.text()).trim();
  const canaryVersion = `${baseVersion}-canary.${commitHash}`;

  console.log(`Canary version: ${canaryVersion}`);
  console.log(`Commit: ${commitHash}`);

  if (isDryRun) {
    console.log(`✅ Would release canary v${canaryVersion} (dry run)`);
    return;
  }

  if (deprecateOld) {
    try {
      const versions = await getPublishedVersions(packageName);
      const canaryVersions = versions.filter(isCanaryVersion);

      if (!canaryVersions.length) {
        console.log("ℹ️ No canary versions found to deprecate.");
        return;
      }

      const nonDeprecated: string[] = [];
      for (const v of canaryVersions) {
        if (!(await isDeprecated(packageName, v))) {
          nonDeprecated.push(v);
        }
      }

      if (autoYes) {
        const depSpin = spinner();
        depSpin.start(`Deprecating ${nonDeprecated.length} canary version(s)...`);
        let count = 0;
        for (const v of nonDeprecated) {
          if (await deprecateVersion(packageName, v, canaryVersion)) {
            count++;
          }
        }
        depSpin.stop(`Deprecated ${count} version(s).`);
        return;
      }

      const selected = (await multiselect({
        message: "Select canary versions to deprecate:",
        options: nonDeprecated
          .sort()
          .reverse()
          .map((v) => ({ value: v, label: v })),
      })) as unknown as string[] | symbol;

      if (isCancel(selected) || !Array.isArray(selected) || selected.length === 0) {
        console.log("❌ No selections made. Aborting.");
        return;
      }

      const depSpin = spinner();
      depSpin.start(`Deprecating ${selected.length} canary version(s)...`);
      let count = 0;
      for (const v of selected) {
        if (await deprecateVersion(packageName, v, canaryVersion)) {
          count++;
        }
      }
      depSpin.stop(`Deprecated ${count} version(s).`);
      return;
    } catch (err) {
      console.error("❌ Failed to fetch versions from npm:", err);
      return;
    }
  }

  try {
    const versions = await getPublishedVersions(packageName);
    if (Array.isArray(versions) && versions.includes(canaryVersion)) {
      console.error(
        `❌ ${packageName}@${canaryVersion} is already published on npm. Make a new commit (or clean your workspace) and try again.`,
      );
      return;
    }
  } catch {}

  if (!autoYes) {
    const proceed = await confirm({
      message: `Publish ${packageName}@${canaryVersion} with dist-tag "canary"${deprecateOld ? ", then deprecate older canaries" : ""}?`,
    });
    if (isCancel(proceed) || proceed === false) {
      console.log("❌ Canceled by user.");
      return;
    }
  }

  const originalPackageJsonString = await readFile(CLI_PACKAGE_JSON_PATH, "utf-8");
  const aliasPackageJson = JSON.parse(await readFile(ALIAS_PACKAGE_JSON_PATH, "utf-8"));
  const originalAliasPackageJsonString = await readFile(ALIAS_PACKAGE_JSON_PATH, "utf-8");
  const typesPackageJson = JSON.parse(await readFile(TYPES_PACKAGE_JSON_PATH, "utf-8"));
  const originalTypesPackageJsonString = await readFile(TYPES_PACKAGE_JSON_PATH, "utf-8");
  const templateGeneratorPackageJson = JSON.parse(
    await readFile(TEMPLATE_GENERATOR_PACKAGE_JSON_PATH, "utf-8"),
  );
  const originalTemplateGeneratorPackageJsonString = await readFile(
    TEMPLATE_GENERATOR_PACKAGE_JSON_PATH,
    "utf-8",
  );
  let restored = false;

  try {
    // Update types package version, build, and publish first
    typesPackageJson.version = canaryVersion;
    await writeFile(TYPES_PACKAGE_JSON_PATH, `${JSON.stringify(typesPackageJson, null, 2)}\n`);

    const typesBuildSpin = spinner();
    typesBuildSpin.start("Building types package...");
    try {
      await $`cd packages/types && bun run build`;
      typesBuildSpin.stop("Types build complete");
    } catch (err) {
      typesBuildSpin.stop("Types build failed");
      throw err;
    }

    const typesPubSpin = spinner();
    typesPubSpin.start(`Publishing @kubo/types@${canaryVersion} (canary)...`);
    try {
      await $`cd packages/types && bun publish --access public --tag canary`;
      typesPubSpin.stop("Types package published");
    } catch (err) {
      typesPubSpin.stop("Types publish failed");
      throw err;
    }

    // Update template-generator package version and types dependency, build, and publish
    templateGeneratorPackageJson.version = canaryVersion;
    templateGeneratorPackageJson.dependencies["@kubo/types"] = canaryVersion;
    await writeFile(
      TEMPLATE_GENERATOR_PACKAGE_JSON_PATH,
      `${JSON.stringify(templateGeneratorPackageJson, null, 2)}\n`,
    );

    const templateGeneratorBuildSpin = spinner();
    templateGeneratorBuildSpin.start("Building template-generator package...");
    try {
      await $`cd packages/template-generator && bun run build`;
      templateGeneratorBuildSpin.stop("Template-generator build complete");
    } catch (err) {
      templateGeneratorBuildSpin.stop("Template-generator build failed");
      throw err;
    }

    const templateGeneratorPubSpin = spinner();
    templateGeneratorPubSpin.start(
      `Publishing @kubo/template-generator@${canaryVersion} (canary)...`,
    );
    try {
      await $`cd packages/template-generator && bun publish --access public --tag canary`;
      templateGeneratorPubSpin.stop("Template-generator package published");
    } catch (err) {
      templateGeneratorPubSpin.stop("Template-generator publish failed");
      throw err;
    }

    // Update CLI package version and dependencies
    packageJson.version = canaryVersion;
    packageJson.dependencies["@kubo/types"] = canaryVersion;
    packageJson.dependencies["@kubo/template-generator"] = canaryVersion;
    await writeFile(CLI_PACKAGE_JSON_PATH, `${JSON.stringify(packageJson, null, 2)}\n`);

    // Update alias package version
    aliasPackageJson.version = canaryVersion;
    aliasPackageJson.dependencies["kubojs"] = canaryVersion;
    await writeFile(ALIAS_PACKAGE_JSON_PATH, `${JSON.stringify(aliasPackageJson, null, 2)}\n`);

    const buildSpin = spinner();
    buildSpin.start("Building CLI...");
    try {
      await $`bun run build:cli`;
      buildSpin.stop("Build complete");
    } catch (err) {
      buildSpin.stop("Build failed");
      throw err;
    }

    const pubSpin = spinner();
    pubSpin.start(
      `Publishing ${packageName}@${canaryVersion} and create-bts@${canaryVersion} (canary)...`,
    );
    try {
      await $`cd apps/cli && bun publish --access public --tag canary`;
      await $`cd packages/create-bts && bun publish --access public --tag canary`;
      pubSpin.stop("Publish complete for all packages");
    } catch (err) {
      pubSpin.stop("Publish failed");
      throw err;
    }

    if (deprecateOld) {
      console.log("🔎 Cleaning up older canary versions (deprecating)...");
      try {
        const versions = await getPublishedVersions(packageName);
        for (const v of versions) {
          if (!isCanaryVersion(v) || v === canaryVersion) continue;
          console.log(`➡️ Deprecating ${packageName}@${v}`);
          await deprecateVersion(packageName, v, canaryVersion);
        }
        console.log("🧹 Older canaries deprecated.");
      } catch (err) {
        console.warn("⚠️ Failed to deprecate older canaries:", err);
      }
    }

    await writeFile(CLI_PACKAGE_JSON_PATH, originalPackageJsonString);
    await writeFile(ALIAS_PACKAGE_JSON_PATH, originalAliasPackageJsonString);
    await writeFile(TYPES_PACKAGE_JSON_PATH, originalTypesPackageJsonString);
    await writeFile(
      TEMPLATE_GENERATOR_PACKAGE_JSON_PATH,
      originalTemplateGeneratorPackageJsonString,
    );
    restored = true;

    console.log(`✅ Published canary v${canaryVersion} for all packages`);
    console.log(`📦 NPM: https://www.npmjs.com/package/${packageName}/v/${canaryVersion}`);
    console.log(`📦 NPM: https://www.npmjs.com/package/create-bts/v/${canaryVersion}`);
    console.log(`📦 NPM: https://www.npmjs.com/package/@kubo/types/v/${canaryVersion}`);
    console.log(
      `📦 NPM: https://www.npmjs.com/package/@kubo/template-generator/v/${canaryVersion}`,
    );
  } finally {
    if (!restored) {
      await writeFile(CLI_PACKAGE_JSON_PATH, originalPackageJsonString);
      await writeFile(ALIAS_PACKAGE_JSON_PATH, originalAliasPackageJsonString);
      await writeFile(TYPES_PACKAGE_JSON_PATH, originalTypesPackageJsonString);
      await writeFile(
        TEMPLATE_GENERATOR_PACKAGE_JSON_PATH,
        originalTemplateGeneratorPackageJsonString,
      );
    }
  }
}

main().catch(console.error);
