import {
  findFrontend,
  hasNativeFrontend,
  hasReactFrontend,
  reactWebFrontends,
  type ProjectConfig,
} from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";
import { appDir, pkgDir } from "../layout-paths";

export async function processAuthTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.auth || config.auth === "none") return;

  const hasReactWeb = hasReactFrontend(config.frontend);
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");
  const hasNativeBare = config.frontend.includes("native-bare");
  const hasUniwind = config.frontend.includes("native-uniwind");
  const hasUnistyles = config.frontend.includes("native-unistyles");
  const hasNative = hasNativeFrontend(config.frontend);

  const authProvider = config.auth;

  if (config.backend === "convex" && authProvider === "clerk") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      "auth/clerk/convex/backend",
      pkgDir(config, "backend"),
      config,
    );

    if (hasReactWeb) {
      const reactFramework = findFrontend(config.frontend, reactWebFrontends);
      if (reactFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `auth/clerk/convex/web/react/${reactFramework}`,
          appDir(config, "web"),
          config,
        );
      }
    }

    if (hasNative) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "auth/clerk/convex/native/base",
        appDir(config, "native"),
        config,
      );

      let nativeFramework = "";
      if (hasNativeBare) nativeFramework = "bare";
      else if (hasUniwind) nativeFramework = "uniwind";
      else if (hasUnistyles) nativeFramework = "unistyles";

      if (nativeFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `auth/clerk/convex/native/${nativeFramework}`,
          appDir(config, "native"),
          config,
        );
      }
    }
    return;
  }

  if (config.backend === "convex" && authProvider === "better-auth") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      "auth/better-auth/convex/backend",
      pkgDir(config, "backend"),
      config,
    );

    if (hasReactWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "auth/better-auth/convex/web/react/base",
        appDir(config, "web"),
        config,
      );

      const reactFramework = findFrontend(config.frontend, reactWebFrontends);
      if (reactFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `auth/better-auth/convex/web/react/${reactFramework}`,
          appDir(config, "web"),
          config,
        );
      }
    }

    if (hasNative) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "auth/better-auth/convex/native/base",
        appDir(config, "native"),
        config,
      );

      let nativeFramework = "";
      if (hasNativeBare) nativeFramework = "bare";
      else if (hasUniwind) nativeFramework = "uniwind";
      else if (hasUnistyles) nativeFramework = "unistyles";

      if (nativeFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `auth/better-auth/convex/native/${nativeFramework}`,
          appDir(config, "native"),
          config,
        );
      }
    }
    return;
  }

  if (config.backend !== "convex" && config.backend !== "none") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/server/base`,
      pkgDir(config, "auth"),
      config,
    );

    if (config.backend === "nestjs" && authProvider === "better-auth") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        "auth/better-auth/server/nestjs",
        appDir(config, "server"),
        config,
      );
    }

    if (config.orm !== "none" && config.database !== "none") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/server/db/${config.orm}/${config.database}`,
        pkgDir(config, "db"),
        config,
      );
    }
  }

  if (hasReactWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/react/base`,
      appDir(config, "web"),
      config,
    );

    const reactFramework = findFrontend(config.frontend, reactWebFrontends);
    if (reactFramework) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/web/react/${reactFramework}`,
        appDir(config, "web"),
        config,
      );

      if (
        config.backend === "self" &&
        (reactFramework === "next" || reactFramework === "tanstack-start")
      ) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `auth/${authProvider}/fullstack/${reactFramework}`,
          appDir(config, "web"),
          config,
        );
      }
    }
  } else if (hasNuxtWeb) {
    if (config.backend === "self") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/fullstack/nuxt`,
        appDir(config, "web"),
        config,
      );
    }
    processTemplatesFromPrefix(vfs, templates, `auth/${authProvider}/web/nuxt`, appDir(config, "web"), config);
  } else if (hasSvelteWeb) {
    if (config.backend === "self" && authProvider === "better-auth") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/fullstack/svelte`,
        appDir(config, "web"),
        config,
      );
    }
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/svelte`,
      appDir(config, "web"),
      config,
    );
  } else if (hasSolidWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/solid`,
      appDir(config, "web"),
      config,
    );
  } else if (hasAstroWeb) {
    if (config.backend === "self" && authProvider === "better-auth") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/fullstack/astro`,
        appDir(config, "web"),
        config,
      );
    }
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/web/astro`,
      appDir(config, "web"),
      config,
    );
  }

  if (hasNative) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `auth/${authProvider}/native/base`,
      appDir(config, "native"),
      config,
    );

    let nativeFramework = "";
    if (hasNativeBare) nativeFramework = "bare";
    else if (hasUniwind) nativeFramework = "uniwind";
    else if (hasUnistyles) nativeFramework = "unistyles";

    if (nativeFramework) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `auth/${authProvider}/native/${nativeFramework}`,
        appDir(config, "native"),
        config,
      );
    }
  }
}
