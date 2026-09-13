import { getBackendCapabilities, isBackend } from "./backends";
import { getCommunicationCompatibilityIssue, isCommunicationProvider } from "./communication";
import {
  CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS,
  CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS,
  getSelfHostedFrontend,
  isNativeFrontend,
  isWebFrontend,
} from "./frontend";
import { getPaymentCompatibilityIssue, isPaymentProvider } from "./payments";
import type {
  Addons,
  Backend,
  Database,
  DatabaseSetup,
  Frontend,
  ProjectConfigDraft,
  ServerDeploy,
} from "./types";

export type CompatibilityField = keyof ProjectConfigDraft;

export type CompatibilityIssueCode =
  | "frontend-web-cardinality"
  | "frontend-native-cardinality"
  | "backend-self-frontend"
  | "backend-convex-frontend"
  | "backend-self-runtime"
  | "backend-none-runtime"
  | "backend-none-database"
  | "backend-none-orm"
  | "backend-none-api"
  | "backend-none-auth"
  | "backend-none-payments"
  | "backend-none-communication"
  | "backend-none-db-setup"
  | "backend-none-server-deploy"
  | "backend-convex-runtime"
  | "backend-convex-database"
  | "backend-convex-orm"
  | "backend-convex-api"
  | "backend-convex-db-setup"
  | "backend-convex-server-deploy"
  | "backend-convex-better-auth-frontend"
  | "backend-workers"
  | "backend-workers-database"
  | "runtime-required"
  | "backend-api"
  | "backend-auth"
  | "backend-database"
  | "backend-orm"
  | "api-frontend"
  | "api-example"
  | "database-orm"
  | "database-setup"
  | "database-setup-target"
  | "web-deploy-frontend"
  | "server-deploy-backend"
  | "server-deploy-runtime"
  | "server-deploy-cloudflare"
  | "web-deploy-desktop-addon"
  | "auth-backend"
  | "auth-frontend"
  | "addon-task-runner"
  | "addon-linter"
  | "addon-frontend"
  | "addon-backend"
  | "addon-auth"
  | "testing-frontend"
  | "example-todo-database"
  | "example-todo-api"
  | "example-todo-orval"
  | "example-ai-frontend"
  | "example-ai-backend"
  | "communication"
  | "payment";

export type CompatibilityIssue = {
  readonly code: CompatibilityIssueCode;
  readonly fields: readonly CompatibilityField[];
  readonly values?: readonly string[];
};

export type CompatibilityEvaluation = {
  readonly valid: boolean;
  readonly issues: readonly CompatibilityIssue[];
};

export type CompatibilityConfig = Partial<ProjectConfigDraft>;

export const ADDON_COMPATIBILITY = {
  pwa: ["tanstack-router", "react-router", "solid", "next"],
  tauri: [
    "tanstack-router",
    "react-router",
    "tanstack-start",
    "next",
    "nuxt",
    "svelte",
    "solid",
    "astro",
  ],
  electrobun: [
    "tanstack-router",
    "react-router",
    "tanstack-start",
    "next",
    "nuxt",
    "svelte",
    "solid",
    "astro",
  ],
  biome: [],
  husky: [],
  lefthook: [],
  turborepo: [],
  "vite-plus": [],
  mcp: [],
  oxlint: [],
  opentui: [],
  skills: [],
  "s3-storage": [],
  none: [],
} as const satisfies Record<Addons, readonly Frontend[]>;

export const WEB_FRONTENDS_REQUIRING_ORPC: readonly Frontend[] = [
  "nuxt",
  "svelte",
  "solid",
  "astro",
];
export const FULLSTACK_FRONTENDS: readonly Frontend[] = [
  "next",
  "tanstack-start",
  "nuxt",
  "svelte",
  "astro",
];
export const CLERK_BACKENDS: readonly Backend[] = [
  "convex",
  "hono",
  "express",
  "fastify",
  "elysia",
  "self",
];
export const CLERK_FRONTENDS: readonly Frontend[] = [
  "react-router",
  "tanstack-router",
  "tanstack-start",
  "next",
  "native-bare",
  "native-uniwind",
  "native-unistyles",
];
export const STATIC_DESKTOP_ADDONS: readonly Addons[] = ["tauri", "electrobun"];
export const TASK_RUNNER_ADDONS: readonly Addons[] = ["turborepo", "vite-plus"];
export const LINTER_ADDONS: readonly Addons[] = ["biome", "oxlint"];
export const DOCKER_SERVER_OUTPUT_FRONTENDS: readonly Frontend[] = [
  "next",
  "svelte",
  "astro",
  "react-router",
];
export const DEDICATED_SERVER_DEPLOYS: readonly ServerDeploy[] = [
  "docker",
  "vercel",
  "railway",
  "guaracloud",
];

type IssueFactory = (
  code: CompatibilityIssueCode,
  fields: readonly CompatibilityField[],
  values?: readonly string[],
) => CompatibilityIssue;

const issue: IssueFactory = (code, fields, values) => ({ code, fields, values });

function getWebFrontends(frontends: readonly Frontend[] = []): Frontend[] {
  return frontends.filter(isWebFrontend);
}

function getNativeFrontends(frontends: readonly Frontend[] = []): Frontend[] {
  return frontends.filter(isNativeFrontend);
}

function getBackendOwnershipIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const backend = config.backend;
  if (!backend) return [];

  const issues: CompatibilityIssue[] = [];
  const ownedFields: readonly [
    keyof CompatibilityConfig,
    string | undefined,
    CompatibilityIssueCode,
  ][] = [
    ["runtime", config.runtime, "backend-convex-runtime"],
    ["database", config.database, "backend-convex-database"],
    ["orm", config.orm, "backend-convex-orm"],
    ["api", config.api, "backend-convex-api"],
    ["dbSetup", config.dbSetup, "backend-convex-db-setup"],
    ["serverDeploy", config.serverDeploy, "backend-convex-server-deploy"],
  ];

  if (backend === "convex") {
    for (const [field, value, code] of ownedFields) {
      if (value && value !== "none") issues.push(issue(code, [field]));
    }
  }

  if (backend === "none") {
    const noneFields: readonly [
      keyof CompatibilityConfig,
      string | readonly string[] | undefined,
      CompatibilityIssueCode,
    ][] = [
      ["runtime", config.runtime, "backend-none-runtime"],
      ["database", config.database, "backend-none-database"],
      ["orm", config.orm, "backend-none-orm"],
      ["api", config.api, "backend-none-api"],
      ["auth", config.auth, "backend-none-auth"],
      ["payments", config.payments, "backend-none-payments"],
      ["communication", config.communication, "backend-none-communication"],
      ["dbSetup", config.dbSetup, "backend-none-db-setup"],
      ["serverDeploy", config.serverDeploy, "backend-none-server-deploy"],
    ];
    for (const [field, value, code] of noneFields) {
      const selected = Array.isArray(value) ? value.length > 0 : value && value !== "none";
      if (selected) issues.push(issue(code, [field]));
    }
  }

  if (backend === "self" && config.runtime && config.runtime !== "none") {
    issues.push(issue("backend-self-runtime", ["runtime"]));
  }

  if (backend === "self") {
    const frontend = getSelfHostedFrontend(config.frontend ?? []);
    const webFrontends = getWebFrontends(config.frontend);
    if (webFrontends.length !== 1 || !frontend) {
      issues.push(issue("backend-self-frontend", ["backend", "frontend"]));
    }
  }

  if (backend === "convex" && config.auth === "better-auth") {
    const supported = (config.frontend ?? []).some((frontend) =>
      includesValue(CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS, frontend),
    );
    const incompatible = (config.frontend ?? []).some((frontend) =>
      includesValue(CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS, frontend),
    );
    if (!supported || incompatible) {
      issues.push(issue("backend-convex-better-auth-frontend", ["auth", "frontend"]));
    }
  }

  if (backend === "convex" && config.frontend) {
    const incompatible = config.frontend.some(
      (frontend) => frontend === "solid" || frontend === "astro",
    );
    if (incompatible && config.frontend.length > 0) {
      issues.push(issue("backend-convex-frontend", ["backend", "frontend"]));
    }
  }

  return issues;
}

function getFrontendIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const frontends = config.frontend;
  if (!frontends) return [];

  const issues: CompatibilityIssue[] = [];
  const webFrontends = getWebFrontends(frontends);
  const nativeFrontends = getNativeFrontends(frontends);
  if (webFrontends.length > 1) {
    issues.push(issue("frontend-web-cardinality", ["frontend"]));
  }
  if (nativeFrontends.length > 1) {
    issues.push(issue("frontend-native-cardinality", ["frontend"]));
  }

  if (config.testing?.includes("playwright") && webFrontends.length === 0) {
    issues.push(issue("testing-frontend", ["testing", "frontend"]));
  }

  if (
    config.api === "trpc" &&
    webFrontends.some((frontend) => WEB_FRONTENDS_REQUIRING_ORPC.includes(frontend))
  ) {
    issues.push(issue("api-frontend", ["api", "frontend"]));
  }

  if (config.auth === "clerk") {
    const hasSupportedFrontend = nativeFrontends
      .concat(webFrontends)
      .some((frontend) => CLERK_FRONTENDS.includes(frontend));
    if (!hasSupportedFrontend) {
      issues.push(issue("auth-frontend", ["auth", "frontend"]));
    }
  }

  if (config.webDeploy && config.webDeploy !== "none" && webFrontends.length === 0) {
    issues.push(issue("web-deploy-frontend", ["webDeploy", "frontend"]));
  }

  return issues;
}

function getBackendCapabilityIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  if (!config.backend || !isBackend(config.backend)) return [];
  const capabilities = getBackendCapabilities(config.backend);
  const issues: CompatibilityIssue[] = [];
  const values: readonly [keyof CompatibilityConfig, string | undefined, CompatibilityIssueCode][] =
    [
      ["api", config.api, "backend-api"],
      ["auth", config.auth, "backend-auth"],
      ["database", config.database, "backend-database"],
      ["orm", config.orm, "backend-orm"],
    ];
  for (const [field, value, code] of values) {
    const allowed =
      capabilities[
        field === "api"
          ? "apis"
          : field === "auth"
            ? "auth"
            : field === "database"
              ? "databases"
              : "orms"
      ];
    if (value && allowed && !includesValue(allowed, value)) {
      issues.push(issue(code, [field], [value]));
    }
  }
  if (config.examples?.includes("ai") && !capabilities.examples.ai) {
    issues.push(issue("example-ai-backend", ["examples", "backend"]));
  }
  if (config.payments && config.payments.length > 0 && !capabilities.supportsPayments) {
    issues.push(issue("payment", ["payments", "backend"]));
  }
  return issues;
}

function getRuntimeIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  if (config.runtime === "workers" && config.backend && config.backend !== "hono") {
    issues.push(issue("backend-workers", ["backend", "runtime"]));
  }
  if (config.runtime === "workers" && config.database === "mongodb") {
    issues.push(issue("backend-workers-database", ["database", "runtime"]));
  }
  if (
    config.backend &&
    config.runtime === "none" &&
    config.backend !== "convex" &&
    config.backend !== "none" &&
    config.backend !== "self"
  ) {
    issues.push(issue("runtime-required", ["backend", "runtime"]));
  }
  return issues;
}

function getDatabaseIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  if (!config.database && !config.orm) return [];
  const issues: CompatibilityIssue[] = [];
  if (config.orm === "mongoose" && config.database && config.database !== "mongodb") {
    issues.push(issue("database-orm", ["database", "orm"]));
  }
  if (config.orm === "drizzle" && config.database === "mongodb") {
    issues.push(issue("database-orm", ["database", "orm"]));
  }
  if (
    config.database === "mongodb" &&
    config.orm &&
    config.orm !== "mongoose" &&
    config.orm !== "prisma" &&
    config.orm !== "none"
  ) {
    issues.push(issue("database-orm", ["database", "orm"]));
  }
  if (config.database && config.database !== "none" && config.orm === "none") {
    issues.push(issue("database-orm", ["database", "orm"]));
  }
  if (config.orm && config.orm !== "none" && config.database === "none") {
    issues.push(issue("database-orm", ["database", "orm"]));
  }
  return issues;
}

const DATABASE_SETUP_REQUIREMENTS: Partial<
  Record<DatabaseSetup, { database?: Database; databases?: readonly Database[] }>
> = {
  turso: { database: "sqlite" },
  neon: { database: "postgres" },
  "prisma-postgres": { database: "postgres" },
  "mongodb-atlas": { database: "mongodb" },
  supabase: { database: "postgres" },
  planetscale: { databases: ["postgres", "mysql"] },
  d1: { database: "sqlite" },
};

function getDatabaseSetupIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const setup = config.dbSetup;
  if (!setup || setup === "none") return [];
  const requirement = DATABASE_SETUP_REQUIREMENTS[setup];
  const issues: CompatibilityIssue[] = [];
  if (requirement?.database && config.database && config.database !== requirement.database) {
    issues.push(issue("database-setup", ["database", "dbSetup"], [setup]));
  }
  if (
    requirement?.databases &&
    config.database &&
    !requirement.databases.includes(config.database)
  ) {
    issues.push(issue("database-setup", ["database", "dbSetup"], [setup]));
  }
  if (setup === "docker" && config.database === "sqlite") {
    issues.push(issue("database-setup", ["database", "dbSetup"], [setup]));
  }
  if (setup === "docker" && config.runtime === "workers") {
    issues.push(issue("database-setup", ["runtime", "dbSetup"], [setup]));
  }
  if (setup === "d1") {
    const workersTarget =
      config.backend === "hono" &&
      config.runtime === "workers" &&
      config.serverDeploy === "cloudflare";
    const selfTarget =
      config.backend === "self" && config.runtime === "none" && config.webDeploy === "cloudflare";
    const canResolveWorkersTarget =
      (!config.backend || config.backend === "hono") &&
      (!config.runtime || config.runtime === "workers") &&
      (!config.serverDeploy || config.serverDeploy === "cloudflare");
    const canResolveSelfTarget =
      (!config.backend || config.backend === "self") &&
      (!config.runtime || config.runtime === "none") &&
      (!config.webDeploy || config.webDeploy === "cloudflare");
    if (!workersTarget && !selfTarget && !canResolveWorkersTarget && !canResolveSelfTarget) {
      issues.push(
        issue("database-setup-target", ["backend", "runtime", "webDeploy", "serverDeploy"]),
      );
    }
  }
  return issues;
}

function getDeploymentIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const serverDeploy = config.serverDeploy;
  if (serverDeploy && serverDeploy !== "none") {
    if (!config.backend || config.backend === "none") {
      issues.push(issue("server-deploy-backend", ["backend", "serverDeploy"]));
    }
    if (serverDeploy === "cloudflare") {
      if (config.runtime && config.runtime !== "workers") {
        issues.push(issue("server-deploy-cloudflare", ["runtime", "serverDeploy"]));
      }
      if (config.backend && config.backend !== "hono") {
        issues.push(issue("server-deploy-cloudflare", ["backend", "serverDeploy"]));
      }
    }
    if (DEDICATED_SERVER_DEPLOYS.includes(serverDeploy)) {
      if (config.backend === "convex" || config.backend === "self") {
        issues.push(issue("server-deploy-backend", ["backend", "serverDeploy"]));
      }
      if (config.runtime === "workers") {
        issues.push(issue("server-deploy-runtime", ["runtime", "serverDeploy"]));
      }
    }
  }
  if (config.runtime === "workers" && config.serverDeploy === "none") {
    issues.push(issue("server-deploy-runtime", ["runtime", "serverDeploy"]));
  }
  return issues;
}

function getAddonIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const addons = config.addons ?? [];
  if (addons.length === 0) return [];
  const issues: CompatibilityIssue[] = [];
  const taskRunners = addons.filter((addon) => TASK_RUNNER_ADDONS.includes(addon));
  const linters = addons.filter((addon) => LINTER_ADDONS.includes(addon));
  if (taskRunners.length > 1) issues.push(issue("addon-task-runner", ["addons"], taskRunners));
  if (new Set(linters).size > 1) issues.push(issue("addon-linter", ["addons"], linters));

  for (const addon of addons) {
    if (addon === "none") continue;
    const compatibleFrontends = ADDON_COMPATIBILITY[addon];
    if (
      compatibleFrontends.length > 0 &&
      !(config.frontend ?? []).some((frontend) => includesValue(compatibleFrontends, frontend))
    ) {
      issues.push(issue("addon-frontend", ["addons", "frontend"], [addon]));
    }
    if (config.backend === "self" && STATIC_DESKTOP_ADDONS.includes(addon)) {
      issues.push(issue("addon-backend", ["addons", "backend"], [addon]));
    }
    if (
      addon === "tauri" &&
      config.backend === "convex" &&
      config.auth === "better-auth" &&
      (config.frontend ?? []).some(
        (frontend) => frontend === "next" || frontend === "tanstack-start",
      )
    ) {
      issues.push(issue("addon-auth", ["addons", "auth", "frontend"], [addon]));
    }
    if (
      STATIC_DESKTOP_ADDONS.includes(addon) &&
      config.auth === "clerk" &&
      (config.frontend ?? []).includes("react-router")
    ) {
      issues.push(issue("addon-auth", ["addons", "auth", "frontend"], [addon]));
    }
  }
  return issues;
}

function getExampleIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const examples = config.examples ?? [];
  if (examples.length === 0 || examples.includes("none")) return [];
  const issues: CompatibilityIssue[] = [];
  if (examples.includes("todo") && config.backend !== "convex") {
    if (config.database === "none")
      issues.push(issue("example-todo-database", ["examples", "database"]));
    if (config.api === "none") issues.push(issue("example-todo-api", ["examples", "api"]));
  }
  if (examples.includes("todo") && config.api === "orval") {
    issues.push(issue("example-todo-orval", ["examples", "api"]));
  }
  if (
    examples.includes("ai") &&
    (config.frontend ?? []).some((frontend) => frontend === "solid" || frontend === "astro")
  ) {
    issues.push(issue("example-ai-frontend", ["examples", "frontend"]));
  }
  if (examples.includes("ai") && config.backend === "none") {
    issues.push(issue("example-ai-backend", ["examples", "backend"]));
  }
  if (
    examples.includes("ai") &&
    config.backend === "convex" &&
    (config.frontend ?? []).some((frontend) => frontend === "nuxt" || frontend === "svelte")
  ) {
    issues.push(issue("example-ai-frontend", ["examples", "frontend", "backend"]));
  }
  return issues;
}

function getAuthenticationIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  if (config.auth !== "clerk") return [];
  if (!config.backend || !CLERK_BACKENDS.includes(config.backend)) {
    return [issue("auth-backend", ["auth", "backend"])];
  }
  return [];
}

function getProviderIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  if (isCommunicationProvider(config.communication)) {
    const communicationIssue = getCommunicationCompatibilityIssue({
      provider: config.communication,
      backend: config.backend,
      runtime: config.runtime,
      serverDeploy: config.serverDeploy,
    });
    if (communicationIssue) issues.push(issue("communication", ["communication", "backend"]));
  }
  for (const provider of config.payments ?? []) {
    if (!isPaymentProvider(provider)) continue;
    const paymentIssue = getPaymentCompatibilityIssue({
      provider,
      backend: config.backend,
      frontends: config.frontend,
      database: config.database,
      orm: config.orm,
    });
    if (paymentIssue) issues.push(issue("payment", ["payments"]));
  }
  return issues;
}

function getDockerWebIssues(config: CompatibilityConfig): CompatibilityIssue[] {
  if (config.webDeploy !== "docker") return [];
  const desktopAddons = (config.addons ?? []).filter((addon) =>
    STATIC_DESKTOP_ADDONS.includes(addon),
  );
  const affectedFrontend = (config.frontend ?? []).find((frontend) =>
    DOCKER_SERVER_OUTPUT_FRONTENDS.includes(frontend),
  );
  const keepsServerOutput =
    affectedFrontend === "next" &&
    desktopAddons.includes("electrobun") &&
    config.backend === "convex" &&
    config.auth === "better-auth";
  if (desktopAddons.length > 0 && affectedFrontend && !keepsServerOutput) {
    return [issue("web-deploy-desktop-addon", ["webDeploy", "addons", "frontend"])];
  }
  return [];
}

const compatibilityRules: readonly ((config: CompatibilityConfig) => CompatibilityIssue[])[] = [
  getFrontendIssues,
  getBackendOwnershipIssues,
  getBackendCapabilityIssues,
  getRuntimeIssues,
  getDatabaseIssues,
  getDatabaseSetupIssues,
  getDeploymentIssues,
  getAddonIssues,
  getExampleIssues,
  getAuthenticationIssues,
  getProviderIssues,
  getDockerWebIssues,
];

export function evaluate(config: CompatibilityConfig): CompatibilityEvaluation {
  const issues = compatibilityRules.flatMap((rule) => rule(config));
  return { valid: issues.length === 0, issues };
}

export function isFullstackFrontend(frontend: Frontend | undefined): boolean {
  return frontend !== undefined && FULLSTACK_FRONTENDS.includes(frontend);
}

export function isClerkCompatibleFrontend(frontend: Frontend | undefined): boolean {
  return frontend !== undefined && CLERK_FRONTENDS.includes(frontend);
}

export function isDedicatedServerDeployValue(value: ServerDeploy | undefined): boolean {
  return value !== undefined && DEDICATED_SERVER_DEPLOYS.includes(value);
}

export function isTaskRunnerAddon(addon: Addons): boolean {
  return TASK_RUNNER_ADDONS.includes(addon);
}

export function isLinterAddon(addon: Addons): boolean {
  return LINTER_ADDONS.includes(addon);
}

function includesValue(values: readonly string[] | undefined, value: string): boolean {
  return values?.some((candidate) => candidate === value) ?? false;
}
