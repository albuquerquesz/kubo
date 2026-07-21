import type { ProjectConfig } from "@kubo/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate, processTemplatesFromPrefix } from "./utils";

export async function processPaymentsTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.payments || config.payments === "none") return;

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

  const hasReactWeb = config.frontend.some((f) =>
    ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
  );
  const hasNuxtWeb = config.frontend.includes("nuxt");
  const hasSvelteWeb = config.frontend.includes("svelte");
  const hasSolidWeb = config.frontend.includes("solid");
  const hasAstroWeb = config.frontend.includes("astro");

  if (config.backend === "convex") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/convex/backend`,
      "packages/backend",
      config,
    );
    return;
  } else if (config.backend !== "none") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/server/base`,
      "packages/payments",
      config,
    );

    if (
      config.payments === "abacatepay" &&
      config.orm !== "none" &&
      config.database !== "none" &&
      config.database !== "mongodb"
    ) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${config.payments}/db/${config.orm}/${config.database}`,
        "packages/db",
        config,
      );
    }
  } else if (config.payments === "abacatepay") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/server/base`,
      "packages/payments",
      config,
    );
  }

  if (config.payments === "abacatepay" && config.backend === "self") {
    const fullstackFramework = config.frontend.find((f) =>
      ["next", "tanstack-start", "nuxt", "svelte", "astro"].includes(f),
    );
    if (fullstackFramework) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${config.payments}/fullstack/${fullstackFramework}`,
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
        `payments/${config.payments}/web/react/${reactFramework}`,
        "apps/web",
        config,
      );
    }
  } else if (hasNuxtWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/web/nuxt`,
      "apps/web",
      config,
    );
  } else if (hasSvelteWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/web/svelte`,
      "apps/web",
      config,
    );
  } else if (hasSolidWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/web/solid`,
      "apps/web",
      config,
    );
  } else if (hasAstroWeb) {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${config.payments}/web/astro`,
      "apps/web",
      config,
    );
  }
}
