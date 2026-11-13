import {
  hasNativeFrontend,
  hasWebFrontend,
  hasReactFrontend,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix, processSingleTemplate } from "./utils";
import { pkgDir, pkgFile } from "../layout-paths";

export async function processConfigPackage(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  processTemplatesFromPrefix(vfs, templates, "packages/config", pkgDir(config, "config"), config);
}

export async function processEnvPackage(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  const hasWeb = hasWebFrontend(config.frontend);
  const hasNative = hasNativeFrontend(config.frontend);

  if (!hasWeb && !hasNative && config.backend === "none") return;

  processSingleTemplate(
    vfs,
    templates,
    "packages/env/package.json",
    pkgFile(config, "env", "package.json"),
    config,
  );
  processSingleTemplate(
    vfs,
    templates,
    "packages/env/tsconfig.json",
    pkgFile(config, "env", "tsconfig.json"),
    config,
  );

  if (hasWeb) {
    processSingleTemplate(
      vfs,
      templates,
      "packages/env/src/web.ts",
      pkgFile(config, "env", "src/web.ts"),
      config,
    );
  }

  if (hasNative) {
    processSingleTemplate(
      vfs,
      templates,
      "packages/env/src/native.ts",
      pkgFile(config, "env", "src/native.ts"),
      config,
    );
  }

  if (config.backend !== "none" && config.backend !== "convex") {
    processSingleTemplate(
      vfs,
      templates,
      "packages/env/src/server.ts",
      pkgFile(config, "env", "src/server.ts"),
      config,
    );

    if (
      config.serverDeploy === "cloudflare" ||
      (config.backend === "self" && config.webDeploy === "cloudflare")
    ) {
      processSingleTemplate(
        vfs,
        templates,
        "packages/env/src/cloudflare-local.ts",
        pkgFile(config, "env", "src/cloudflare-local.ts"),
        config,
      );
    }
  }
}

export async function processUiPackage(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  const hasReactWeb = hasReactFrontend(config.frontend);

  if (!hasReactWeb) return;

  processTemplatesFromPrefix(vfs, templates, "packages/ui", pkgDir(config, "ui"), config);
}
