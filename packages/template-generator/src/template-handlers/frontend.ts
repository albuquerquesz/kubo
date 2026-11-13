import {
  findFrontend,
  hasReactFrontend,
  hasWebFrontend,
  reactWebFrontends,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";
import { appDir } from "../layout-paths";

export async function processFrontendTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  const hasReactWeb = hasReactFrontend(config.frontend);
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");
  const hasNativeBare = config.frontend.includes("native-bare");
  const hasNativeUniwind = config.frontend.includes("native-uniwind");
  const hasUnistyles = config.frontend.includes("native-unistyles");
  const isConvex = config.backend === "convex";

  if (hasWebFrontend(config.frontend)) {
    if (hasReactWeb) {
      processTemplatesFromPrefix(vfs, templates, "frontend/react/web-base", appDir(config, "web"), config);

      const reactFramework = findFrontend(config.frontend, reactWebFrontends);
      if (reactFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `frontend/react/${reactFramework}`,
          appDir(config, "web"),
          config,
        );
      }
    } else if (hasNuxtWeb) {
      processTemplatesFromPrefix(vfs, templates, "frontend/nuxt", appDir(config, "web"), config);
    } else if (hasSvelteWeb) {
      processTemplatesFromPrefix(vfs, templates, "frontend/svelte", appDir(config, "web"), config);
    } else if (hasSolidWeb) {
      processTemplatesFromPrefix(vfs, templates, "frontend/solid", appDir(config, "web"), config);
    } else if (hasAstroWeb) {
      processTemplatesFromPrefix(vfs, templates, "frontend/astro", appDir(config, "web"), config);
    }
  }

  if (hasNativeBare || hasNativeUniwind || hasUnistyles) {
    processTemplatesFromPrefix(vfs, templates, "frontend/native/base", appDir(config, "native"), config);

    if (hasNativeBare) {
      processTemplatesFromPrefix(vfs, templates, "frontend/native/bare", appDir(config, "native"), config);
    } else if (hasNativeUniwind) {
      processTemplatesFromPrefix(vfs, templates, "frontend/native/uniwind", appDir(config, "native"), config);
    } else if (hasUnistyles) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "frontend/native/unistyles",
        appDir(config, "native"),
        config,
      );
    }

    if (!isConvex && (config.api === "trpc" || config.api === "orpc")) {
      processTemplatesFromPrefix(vfs, templates, `api/${config.api}/native`, appDir(config, "native"), config);
    }
  }
}
