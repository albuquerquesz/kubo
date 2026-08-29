import {
  findFrontend,
  hasNativeFrontend,
  hasReactFrontend,
  reactWebFrontends,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate, processTemplatesFromPrefix } from "./utils";

function moveGeneratedFile(vfs: VirtualFileSystem, from: string, to: string): void {
  const content = vfs.readFile(from);
  if (content === undefined) return;
  vfs.writeFile(to, content);
  vfs.deleteFile(from);
}

export async function processExampleTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.examples || config.examples.length === 0 || config.examples[0] === "none") return;

  const hasReactWeb = hasReactFrontend(config.frontend);
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");
  const hasNativeBare = config.frontend.includes("native-bare");
  const hasUniwind = config.frontend.includes("native-uniwind");
  const hasUnistyles = config.frontend.includes("native-unistyles");
  const hasNative = hasNativeFrontend(config.frontend);

  for (const example of config.examples) {
    if (example === "none") continue;

    if (config.backend === "convex") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/convex/packages/backend`,
        "packages/backend",
        config,
      );
    } else if (config.backend !== "none" && config.api !== "none") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/server/${config.orm}/base`,
        "apps/api",
        config,
      );

      if (config.orm !== "none" && config.database !== "none") {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/server/${config.orm}/${config.database}`,
          "packages/db",
          config,
        );
      }

      if (example === "todo") {
        moveGeneratedFile(
          vfs,
          "apps/api/src/routers/todo.ts",
          "apps/api/src/modules/todo/index.ts",
        );
        processSingleTemplate(
          vfs,
          templates,
          `api/${config.api}/server/src/modules/todo/model.ts`,
          "apps/api/src/modules/todo/model.ts",
          config,
        );
        processSingleTemplate(
          vfs,
          templates,
          `api/${config.api}/server/src/modules/todo/service.ts`,
          "apps/api/src/modules/todo/service.ts",
          config,
        );
      }
    }

    if (hasReactWeb) {
      const reactFramework = findFrontend(config.frontend, reactWebFrontends);
      if (reactFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/web/react/${reactFramework}`,
          "apps/web",
          config,
        );

        if (
          config.backend === "self" &&
          (reactFramework === "next" || reactFramework === "tanstack-start")
        ) {
          processTemplatesFromPrefix(
            vfs,
            templates,
            `examples/${example}/fullstack/${reactFramework}`,
            "apps/web",
            config,
          );
        }
      }
    } else if (hasNuxtWeb) {
      if (config.backend === "self") {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/fullstack/nuxt`,
          "apps/web",
          config,
        );
      }
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/web/nuxt`,
        "apps/web",
        config,
      );
    } else if (hasSvelteWeb) {
      if (config.backend === "self") {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/fullstack/svelte`,
          "apps/web",
          config,
        );
      }
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/web/svelte`,
        "apps/web",
        config,
      );
    } else if (hasSolidWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/web/solid`,
        "apps/web",
        config,
      );
    } else if (hasAstroWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `examples/${example}/web/astro`,
        "apps/web",
        config,
      );
    }

    if (hasNative) {
      let nativeFramework = "";
      if (hasNativeBare) nativeFramework = "bare";
      else if (hasUniwind) nativeFramework = "uniwind";
      else if (hasUnistyles) nativeFramework = "unistyles";

      if (nativeFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `examples/${example}/native/${nativeFramework}`,
          "apps/native",
          config,
        );
      }
    }
  }
}
