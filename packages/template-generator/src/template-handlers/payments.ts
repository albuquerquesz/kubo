import type { Frontend, ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate, processTemplatesFromPrefix } from "./utils";

const FULLSTACK_FRONTENDS: readonly Frontend[] = [
  "next",
  "tanstack-start",
  "nuxt",
  "svelte",
  "astro",
];

const REACT_FRONTENDS: readonly Frontend[] = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
];

const WEB_TARGETS: readonly { frontends: readonly Frontend[]; templatePath: string }[] = [
  { frontends: REACT_FRONTENDS, templatePath: "web/react" },
  { frontends: ["nuxt"], templatePath: "web/nuxt" },
  { frontends: ["svelte"], templatePath: "web/svelte" },
  { frontends: ["solid"], templatePath: "web/solid" },
  { frontends: ["astro"], templatePath: "web/astro" },
];

function findFrontend(frontends: readonly Frontend[], supported: readonly Frontend[]) {
  return frontends.find((frontend) => supported.some((candidate) => candidate === frontend));
}

function processPaymentPackage(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): void {
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
}

function processBackendPayment(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
  provider: ProjectConfig["payments"][number],
): void {
  if (config.backend === "convex") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${provider}/convex/backend`,
      "packages/backend",
      config,
    );
    return;
  }

  if (config.backend !== "none" || provider === "abacatepay") {
    processTemplatesFromPrefix(
      vfs,
      templates,
      `payments/${provider}/server/base`,
      "packages/payments",
      config,
    );
  }

  if (
    provider === "abacatepay" &&
    config.backend !== "none" &&
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
}

function processFrontendPayment(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
  provider: ProjectConfig["payments"][number],
): void {
  if (config.backend === "self") {
    const fullstackFrontend = findFrontend(config.frontend, FULLSTACK_FRONTENDS);
    if (fullstackFrontend) {
      processTemplatesFromPrefix(
        vfs,
        templates,
        `payments/${provider}/fullstack/${fullstackFrontend}`,
        "apps/web",
        config,
      );
    }
  }

  const target = WEB_TARGETS.find(({ frontends }) => findFrontend(config.frontend, frontends));
  const frontend = target && findFrontend(config.frontend, target.frontends);
  if (!target || !frontend) return;

  processTemplatesFromPrefix(
    vfs,
    templates,
    `payments/${provider}/${target.templatePath}${target.templatePath === "web/react" ? `/${frontend}` : ""}`,
    "apps/web",
    config,
  );
}

export async function processPaymentsTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.payments.length === 0) return;

  processPaymentPackage(vfs, templates, config);
  for (const provider of config.payments) {
    processBackendPayment(vfs, templates, config, provider);
    processFrontendPayment(vfs, templates, config, provider);
  }
}
