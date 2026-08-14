import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate, processTemplatesFromPrefix } from "./utils";

export async function processPaymentsTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.payments || config.payments.length === 0) return;

  processSingleTemplate(
    vfs,
    templates,
    "packages/payments/package.json",
    "packages/payments/package.json",
    config,
  );
  processSingleTemplate(
    vfs,
    templates,
    "packages/payments/tsconfig.json",
    "packages/payments/tsconfig.json",
    config,
  );
  processSingleTemplate(
    vfs,
    templates,
    "packages/payments/src/index.ts",
    "packages/payments/src/index.ts",
    config,
  );
  if (config.payments.includes("stripe")) {
    processSingleTemplate(
      vfs,
      templates,
      "packages/payments/src/client.ts",
      "packages/payments/src/client.ts",
      config,
    );
  }

  const hasReactWeb = config.frontend.some((f) =>
    ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
  );
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");

  for (const provider of config.payments) {
    if (config.backend === "convex") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/convex/backend`,
        "packages/backend",
        config,
      );
    } else if (config.backend !== "none") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/server/base`,
        "packages/payments",
        config,
      );

      if (
        provider === "abacatepay" &&
        config.orm !== "none" &&
        config.database !== "none" &&
        config.database !== "mongodb"
      ) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `payments/${provider}/db/${config.orm}/${config.database}`,
          "packages/db",
          config,
        );
      }
    } else if (provider === "abacatepay") {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/server/base`,
        "packages/payments",
        config,
      );
    }

    if (config.backend === "self") {
      const fullstackFramework = config.frontend.find((f) =>
        ["next", "tanstack-start", "nuxt", "svelte", "astro"].includes(f),
      );
      if (fullstackFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `payments/${provider}/fullstack/${fullstackFramework}`,
          "apps/web",
          config,
        );
      }
    }

    if (hasReactWeb) {
      const reactFramework = config.frontend.find((f) =>
        ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
      );
      if (reactFramework) {
        processTemplatesFromPrefix(
          vfs,
          templates,
          `payments/${provider}/web/react/${reactFramework}`,
          "apps/web",
          config,
        );
      }
    } else if (hasNuxtWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/web/nuxt`,
        "apps/web",
        config,
      );
    } else if (hasSvelteWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/web/svelte`,
        "apps/web",
        config,
      );
    } else if (hasSolidWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/web/solid`,
        "apps/web",
        config,
      );
    } else if (hasAstroWeb) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/web/astro`,
        "apps/web",
        config,
      );
    }
  }
}
