import {
  findFrontend,
  hasReactFrontend,
  reactWebFrontends,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix, processSingleTemplate } from "./utils";

function moveGeneratedFile(
  vfs: VirtualFileSystem,
  from: string,
  to: string,
  transform?: (content: string) => string,
): void {
  const content = vfs.readFile(from);
  if (content === undefined) return;
  vfs.writeFile(to, transform ? transform(content) : content);
  vfs.deleteFile(from);
}

export async function processApiTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.api === "none") return;
  if (config.backend === "convex") return;

  processTemplatesFromPrefix(vfs, templates, `api/${config.api}/server`, "apps/api", config);
  if (config.api === "orval") {
    moveGeneratedFile(
      vfs,
      "apps/api/src/generated/routes.ts",
      "apps/server/src/generated/routes.ts",
    );
    moveGeneratedFile(
      vfs,
      "apps/api/src/generated/handlers/health.ts",
      "apps/server/src/generated/handlers/health.ts",
    );
    return;
  }
  // src/routers/index.ts moves up one level to src/router.ts, so its parent-relative
  // imports (e.g. "../index") must become sibling-relative ("./index").
  moveGeneratedFile(vfs, "apps/api/src/routers/index.ts", "apps/api/src/router.ts", (content) =>
    content.replace(/(from\s+["'])\.\.\//g, "$1./"),
  );
  vfs.writeFile("apps/api/src/routers/index.ts", 'export * from "../router";\n');

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
      "apps/web",
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
        "apps/web",
        config,
      );
    }
  } else if (hasNuxtWeb && config.api === "orpc") {
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/nuxt`,
        "apps/web",
        config,
      );
      processSingleTemplate(
        vfs,
        templates,
        `api/${config.api}/web/nuxt/app/plugins/vue-query.ts`,
        "apps/web/app/plugins/vue-query.ts",
        config,
      );
    } else {
      processTemplatesFromPrefix(vfs, templates, `api/${config.api}/web/nuxt`, "apps/web", config);
    }
  } else if (hasSvelteWeb && config.api === "orpc") {
    processTemplatesFromPrefix(vfs, templates, `api/${config.api}/web/svelte`, "apps/web", config);
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/svelte`,
        "apps/web",
        config,
      );
      if (config.auth !== "better-auth") {
        vfs.writeFile("apps/web/src/hooks.server.ts", 'import "./lib/orpc.server";\n');
      }
    }
  } else if (hasSolidWeb && config.api === "orpc") {
    processTemplatesFromPrefix(vfs, templates, `api/${config.api}/web/solid`, "apps/web", config);
  } else if (hasAstroWeb && config.api === "orpc") {
    processTemplatesFromPrefix(vfs, templates, `api/${config.api}/web/astro`, "apps/web", config);
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `api/${config.api}/fullstack/astro`,
        "apps/web",
        config,
      );
    }
  }
}
