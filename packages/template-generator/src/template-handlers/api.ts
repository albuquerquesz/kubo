import {
  findFrontend,
  hasReactFrontend,
  reactWebFrontends,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { appDir, appFile } from "../layout-paths";
import { type TemplateData, processTemplatesFromPrefix, processSingleTemplate } from "./utils";

export async function processApiTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.api === "none") return;
  if (config.backend === "convex") return;

  processTemplatesFromPrefix(
    vfs,
    templates,
    `api/${config.api}/server`,
    appDir(config, "api"),
    config,
  );
  if (config.api === "orval") {
    vfs.moveFile(
      appFile(config, "api", "src/generated/routes.ts"),
      appFile(config, "server", "src/generated/routes.ts"),
    );
    vfs.moveFile(
      appFile(config, "api", "src/generated/handlers/health.ts"),
      appFile(config, "server", "src/generated/handlers/health.ts"),
    );
    return;
  }
  // src/routers/index.ts moves up one level to src/router.ts, so its parent-relative
  // imports (e.g. "../index") must become sibling-relative ("./index").
  vfs.moveFile(
    appFile(config, "api", "src/routers/index.ts"),
    appFile(config, "api", "src/router.ts"),
    (content) => content.replace(/(from\s+["'])\.\.\//g, "$1./"),
  );
  vfs.writeFile(appFile(config, "api", "src/routers/index.ts"), 'export * from "../router";\n');

  const hasReactWeb = hasReactFrontend(config.frontend);
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");

  if (hasReactWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `api/${config.api}/web/react/base`,
      appDir(config, "web"),
      config,
    );

    const reactFramework = findFrontend(config.frontend, reactWebFrontends);
    if (
      config.backend === "self" &&
      (reactFramework === "next" || reactFramework === "tanstack-start")
    ) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/${reactFramework}`,
        appDir(config, "web"),
        config,
      );
    }
  } else if (hasNuxtWeb && config.api === "orpc") {
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/nuxt`,
        appDir(config, "web"),
        config,
      );
      processSingleTemplate(
        vfs,
        templates,
        `api/${config.api}/web/nuxt/app/plugins/vue-query.ts`,
        appFile(config, "web", "app/plugins/vue-query.ts"),
        config,
      );
    } else {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/web/nuxt`,
        appDir(config, "web"),
        config,
      );
    }
  } else if (hasSvelteWeb && config.api === "orpc") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `api/${config.api}/web/svelte`,
      appDir(config, "web"),
      config,
    );
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/svelte`,
        appDir(config, "web"),
        config,
      );
      if (config.auth !== "better-auth") {
        vfs.writeFile(
          appFile(config, "web", "src/hooks.server.ts"),
          'import "./lib/orpc.server";\n',
        );
      }
    }
  } else if (hasSolidWeb && config.api === "orpc") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `api/${config.api}/web/solid`,
      appDir(config, "web"),
      config,
    );
  } else if (hasAstroWeb && config.api === "orpc") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `api/${config.api}/web/astro`,
      appDir(config, "web"),
      config,
    );
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/astro`,
        appDir(config, "web"),
        config,
      );
    }
  }
}
