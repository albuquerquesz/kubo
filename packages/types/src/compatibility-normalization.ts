import { getBackendCapabilities, isBackend } from "./backends";
import {
  CLERK_BACKENDS,
  CLERK_FRONTENDS,
  DEDICATED_SERVER_DEPLOYS,
  STATIC_DESKTOP_ADDONS,
  WEB_FRONTENDS_REQUIRING_ORPC,
  ADDON_COMPATIBILITY,
} from "./compatibility";
import { isDesktopWebFrontend } from "./constants";
import {
  CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS,
  CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS,
  isWebFrontend,
} from "./frontend";
import { getPaymentCompatibilityIssue } from "./payments";
import type { Frontend, ProjectConfigDraft, Runtime } from "./types";

export type CompatibilityAdjustment = {
  readonly code: string;
  readonly field: keyof ProjectConfigDraft;
  readonly value: string | readonly string[];
};

export type CompatibilityNormalization = {
  readonly config: ProjectConfigDraft;
  readonly adjustments: readonly CompatibilityAdjustment[];
};

type NormalizationField = keyof ProjectConfigDraft;

const DEFAULT_RUNTIME: Runtime = "bun";
const MAX_NORMALIZATION_PASSES = 32;

function sameValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }
  return left === right;
}

function toAdjustmentValue(value: unknown): string | readonly string[] | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((item): item is string => typeof item === "string")) {
    return value;
  }
  return undefined;
}

function setField<K extends NormalizationField>(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
  field: K,
  value: ProjectConfigDraft[K],
  code: string,
): void {
  if (sameValue(config[field], value)) return;
  config[field] = value;
  const adjustmentValue = toAdjustmentValue(value);
  if (adjustmentValue !== undefined) adjustments.push({ code, field, value: adjustmentValue });
}

function removeFromList<T extends string>(
  values: readonly T[],
  value: T,
  fallback: readonly T[],
): T[] {
  const next = values.filter((candidate) => candidate !== value);
  return next.length > 0 ? next : [...fallback];
}

function getWebFrontends(frontends: readonly Frontend[]): Frontend[] {
  return frontends.filter(isWebFrontend);
}

function hasCompatibleFrontend(
  frontends: readonly Frontend[],
  candidates: readonly Frontend[],
): boolean {
  return frontends.some((frontend) => candidates.includes(frontend));
}

function setBackendOwnedFields(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
  backend: "convex" | "none",
): void {
  const code = backend === "convex" ? "backend-convex" : "backend-none";
  setField(config, adjustments, "runtime", "none", code);
  setField(config, adjustments, "database", "none", code);
  setField(config, adjustments, "orm", "none", code);
  setField(config, adjustments, "api", "none", code);
  setField(config, adjustments, "dbSetup", "none", code);
  setField(config, adjustments, "serverDeploy", "none", code);
  setField(config, adjustments, "payments", [], code);
  if (backend === "none") {
    setField(config, adjustments, "auth", "none", code);
    setField(config, adjustments, "communication", "none", code);
    setField(config, adjustments, "examples", ["none"], code);
  }
}

function normalizeBackend(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.backend === "convex") {
    setBackendOwnedFields(config, adjustments, "convex");
    const frontend = config.frontend.filter((value) => value !== "solid" && value !== "astro");
    setField(
      config,
      adjustments,
      "frontend",
      frontend.length > 0 ? frontend : ["none"],
      "backend-convex-frontend",
    );
    if (
      config.examples.includes("ai") &&
      !hasCompatibleFrontend(config.frontend, [
        "tanstack-router",
        "react-router",
        "tanstack-start",
        "next",
      ])
    ) {
      setField(
        config,
        adjustments,
        "examples",
        removeFromList(config.examples, "ai", ["none"]),
        "backend-convex-example",
      );
    }
    if (config.auth === "clerk" && !hasCompatibleFrontend(config.frontend, CLERK_FRONTENDS)) {
      setField(config, adjustments, "auth", "none", "backend-convex-auth");
    }
    if (
      config.auth === "better-auth" &&
      (!hasCompatibleFrontend(config.frontend, CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS) ||
        hasCompatibleFrontend(config.frontend, CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS))
    ) {
      setField(config, adjustments, "auth", "none", "backend-convex-auth");
    }
  }

  if (config.backend === "none") setBackendOwnedFields(config, adjustments, "none");

  if (config.backend === "self") {
    setField(config, adjustments, "runtime", "none", "backend-self");
    setField(config, adjustments, "serverDeploy", "none", "backend-self");
  }
}

function normalizeRuntime(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.runtime === "workers") {
    setField(config, adjustments, "backend", "hono", "backend-workers");
    setField(config, adjustments, "serverDeploy", "cloudflare", "backend-workers");
    if (config.database === "mongodb") {
      setField(config, adjustments, "database", "sqlite", "backend-workers-database");
      setField(config, adjustments, "orm", "drizzle", "backend-workers-database");
      setField(config, adjustments, "dbSetup", "d1", "backend-workers-database");
    }
  }
  if (
    config.runtime === "none" &&
    config.backend !== "convex" &&
    config.backend !== "none" &&
    config.backend !== "self"
  ) {
    setField(config, adjustments, "runtime", DEFAULT_RUNTIME, "runtime-required");
  }
}

function normalizeDatabase(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.backend === "convex" || config.backend === "none") return;

  if (config.database === "none") {
    setField(config, adjustments, "orm", "none", "database-orm");
    setField(config, adjustments, "dbSetup", "none", "database-orm");
  }
  if (config.database === "mongodb") {
    if (config.orm !== "prisma" && config.orm !== "mongoose") {
      setField(config, adjustments, "orm", "prisma", "database-orm");
    }
    if (
      config.dbSetup !== "mongodb-atlas" &&
      config.dbSetup !== "none" &&
      config.dbSetup !== "docker"
    ) {
      setField(config, adjustments, "dbSetup", "none", "database-setup");
    }
  }
  if (["sqlite", "postgres", "mysql"].includes(config.database)) {
    if (config.orm === "none" || config.orm === "mongoose") {
      setField(config, adjustments, "orm", "drizzle", "database-orm");
    }
  }
  if (config.orm !== "none" && config.database === "none") {
    setField(
      config,
      adjustments,
      "database",
      config.orm === "mongoose" ? "mongodb" : "sqlite",
      "database-orm",
    );
  }
}

function normalizeNestJs(config: ProjectConfigDraft, adjustments: CompatibilityAdjustment[]): void {
  if (config.backend !== "nestjs") return;
  setField(config, adjustments, "api", "none", "backend-api");
  if (config.auth !== "better-auth" && config.auth !== "none") {
    setField(config, adjustments, "auth", "none", "backend-auth");
  }
  if (config.database !== "none" && config.database !== "postgres") {
    if (["turso", "d1", "mongodb-atlas"].includes(config.dbSetup)) {
      setField(config, adjustments, "dbSetup", "none", "backend-database");
    }
    setField(config, adjustments, "database", "postgres", "backend-database");
  }
  if (config.orm !== "none" && config.orm !== "prisma") {
    setField(config, adjustments, "orm", "prisma", "backend-orm");
  }
  if (config.examples.includes("ai")) {
    setField(
      config,
      adjustments,
      "examples",
      removeFromList(config.examples, "ai", ["none"]),
      "example-ai-backend",
    );
  }
  if (config.payments.length > 0) {
    setField(config, adjustments, "payments", [], "backend-payments");
  }
}

function normalizeBackendCapabilities(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (!isBackend(config.backend)) return;
  const capabilities = getBackendCapabilities(config.backend);

  if (!capabilities.apis.includes(config.api)) {
    setField(config, adjustments, "api", "none", "backend-api");
  }
  if (capabilities.auth && !capabilities.auth.includes(config.auth)) {
    setField(config, adjustments, "auth", "none", "backend-auth");
  }
  if (capabilities.databases && !capabilities.databases.includes(config.database)) {
    setField(config, adjustments, "database", "none", "backend-database");
  }
  if (capabilities.orms && !capabilities.orms.includes(config.orm)) {
    setField(config, adjustments, "orm", "none", "backend-orm");
  }
  if (config.examples.includes("ai") && !capabilities.examples.ai) {
    setField(
      config,
      adjustments,
      "examples",
      removeFromList(config.examples, "ai", ["none"]),
      "example-ai-backend",
    );
  }
  if (config.payments.length > 0 && !capabilities.supportsPayments) {
    setField(config, adjustments, "payments", [], "backend-payments");
  }
}

function normalizeDatabaseSetup(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  switch (config.dbSetup) {
    case "turso":
    case "d1":
      setField(config, adjustments, "database", "sqlite", "database-setup");
      break;
    case "neon":
    case "prisma-postgres":
    case "supabase":
    case "planetscale":
      setField(config, adjustments, "database", "postgres", "database-setup");
      break;
    case "mongodb-atlas":
      setField(config, adjustments, "database", "mongodb", "database-setup");
      if (config.orm !== "prisma" && config.orm !== "mongoose") {
        setField(config, adjustments, "orm", "prisma", "database-setup");
      }
      break;
    case "docker":
      if (config.database === "sqlite") {
        setField(config, adjustments, "dbSetup", "none", "database-setup");
      } else if (config.runtime === "workers") {
        setField(config, adjustments, "dbSetup", "d1", "database-setup");
      }
      break;
  }

  if (config.dbSetup !== "d1") return;
  if (config.backend === "self") {
    setField(config, adjustments, "webDeploy", "cloudflare", "database-setup-target");
    return;
  }
  setField(config, adjustments, "backend", "hono", "database-setup-target");
  setField(config, adjustments, "runtime", "workers", "database-setup-target");
  setField(config, adjustments, "serverDeploy", "cloudflare", "database-setup-target");
}

function normalizeAuthentication(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.auth !== "clerk") return;
  const backendAllowed = CLERK_BACKENDS.includes(config.backend);
  const frontendAllowed = hasCompatibleFrontend(config.frontend, CLERK_FRONTENDS);
  if (!backendAllowed || !frontendAllowed) {
    setField(config, adjustments, "auth", "none", "auth");
  }
}

function normalizeApi(config: ProjectConfigDraft, adjustments: CompatibilityAdjustment[]): void {
  if (
    config.api === "trpc" &&
    hasCompatibleFrontend(config.frontend, WEB_FRONTENDS_REQUIRING_ORPC)
  ) {
    setField(config, adjustments, "api", "orpc", "api-frontend");
  }
}

function normalizePayments(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  const compatible = config.payments.filter(
    (provider) =>
      getPaymentCompatibilityIssue({
        provider,
        backend: config.backend,
        frontends: config.frontend,
        database: config.database,
        orm: config.orm,
      }) === null,
  );
  setField(config, adjustments, "payments", compatible, "payment");
}

function normalizeAddons(config: ProjectConfigDraft, adjustments: CompatibilityAdjustment[]): void {
  const webFrontends = getWebFrontends(config.frontend);
  let addons = config.addons.filter((addon) => {
    const compatibleFrontends = ADDON_COMPATIBILITY[addon];
    return (
      compatibleFrontends.length === 0 || hasCompatibleFrontend(webFrontends, compatibleFrontends)
    );
  });
  if (config.backend === "self" && addons.some((addon) => STATIC_DESKTOP_ADDONS.includes(addon))) {
    addons = addons.filter((addon) => !STATIC_DESKTOP_ADDONS.includes(addon));
  }
  if (
    config.backend === "convex" &&
    config.auth === "better-auth" &&
    (config.frontend.includes("next") || config.frontend.includes("tanstack-start"))
  ) {
    addons = addons.filter((addon) => addon !== "tauri");
  }
  if (config.auth === "clerk" && config.frontend.includes("react-router")) {
    addons = addons.filter((addon) => !STATIC_DESKTOP_ADDONS.includes(addon));
  }
  setField(config, adjustments, "addons", addons.length > 0 ? addons : ["none"], "addon");

  if (!webFrontends.some(isDesktopWebFrontend) && config.testing.includes("playwright")) {
    setField(
      config,
      adjustments,
      "testing",
      removeFromList(config.testing, "playwright", ["none"]),
      "testing-frontend",
    );
  }
}

function normalizeDockerWebDeploy(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.webDeploy !== "docker") return;
  const desktopAddons = config.addons.filter((addon) => STATIC_DESKTOP_ADDONS.includes(addon));
  const affectedFrontend = config.frontend.some((frontend) =>
    ["next", "svelte", "astro", "react-router"].includes(frontend),
  );
  const keepsServerOutput =
    config.frontend.includes("next") &&
    desktopAddons.includes("electrobun") &&
    config.backend === "convex" &&
    config.auth === "better-auth";
  if (desktopAddons.length > 0 && affectedFrontend && !keepsServerOutput) {
    setField(
      config,
      adjustments,
      "addons",
      config.addons.filter((addon) => !STATIC_DESKTOP_ADDONS.includes(addon)),
      "web-deploy-desktop-addon",
    );
  }
}

function normalizeExamples(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  let examples = [...config.examples];
  if (
    examples.includes("todo") &&
    config.backend !== "convex" &&
    (config.database === "none" || config.api === "none" || config.api === "orval")
  ) {
    examples = examples.filter((example) => example !== "todo");
  }
  if (
    examples.includes("ai") &&
    (config.backend === "none" ||
      config.backend === "nestjs" ||
      config.frontend.includes("solid") ||
      config.frontend.includes("astro") ||
      (config.backend === "convex" &&
        (config.frontend.includes("nuxt") || config.frontend.includes("svelte"))))
  ) {
    examples = examples.filter((example) => example !== "ai");
  }
  setField(config, adjustments, "examples", examples.length > 0 ? examples : ["none"], "example");
}

function normalizeDeployments(
  config: ProjectConfigDraft,
  adjustments: CompatibilityAdjustment[],
): void {
  if (config.webDeploy !== "none" && getWebFrontends(config.frontend).length === 0) {
    setField(config, adjustments, "webDeploy", "none", "web-deploy-frontend");
  }
  if (
    config.serverDeploy === "cloudflare" &&
    (config.runtime !== "workers" || config.backend !== "hono")
  ) {
    setField(config, adjustments, "serverDeploy", "none", "server-deploy-cloudflare");
  }
  if (config.runtime === "workers" && config.serverDeploy !== "cloudflare") {
    setField(config, adjustments, "serverDeploy", "cloudflare", "server-deploy-runtime");
  }
  if (
    config.serverDeploy !== "none" &&
    (config.backend === "none" || config.backend === "convex" || config.backend === "self")
  ) {
    setField(config, adjustments, "serverDeploy", "none", "server-deploy-backend");
  }
  if (DEDICATED_SERVER_DEPLOYS.includes(config.serverDeploy) && config.runtime === "workers") {
    setField(config, adjustments, "serverDeploy", "cloudflare", "server-deploy-runtime");
  }
}

export function normalizeCompatibility(input: ProjectConfigDraft): CompatibilityNormalization {
  const config: ProjectConfigDraft = {
    ...input,
    frontend: [...input.frontend],
    addons: [...input.addons],
    examples: [...input.examples],
    testing: [...input.testing],
    payments: [...input.payments],
    observability: [...input.observability],
  };
  const adjustments: CompatibilityAdjustment[] = [];

  for (let pass = 0; pass < MAX_NORMALIZATION_PASSES; pass += 1) {
    const count = adjustments.length;
    normalizeBackend(config, adjustments);
    normalizeRuntime(config, adjustments);
    normalizeDatabase(config, adjustments);
    normalizeNestJs(config, adjustments);
    normalizeBackendCapabilities(config, adjustments);
    normalizeDatabaseSetup(config, adjustments);
    normalizeApi(config, adjustments);
    normalizeAuthentication(config, adjustments);
    normalizePayments(config, adjustments);
    normalizeAddons(config, adjustments);
    normalizeDockerWebDeploy(config, adjustments);
    normalizeExamples(config, adjustments);
    normalizeDeployments(config, adjustments);
    if (adjustments.length === count) break;
  }

  return { config, adjustments };
}
