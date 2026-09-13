import {
  ADDON_COMPATIBILITY,
  CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS,
  CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS,
  evaluate,
  getCommunicationCompatibilityIssue,
  getPaymentCompatibilityIssue,
  isCommunicationProvider,
  type CompatibilityIssue,
  type CompatibilityIssueCode,
  type CompatibilityField,
  type Addons,
} from "@kubojs/types";
import { Result } from "better-result";

import type { CLIInput, ProjectConfig } from "../types";
import { ValidationError } from "./errors";

type ValidationResult = Result<void, ValidationError>;

const NESTJS_MESSAGES = {
  "backend-api": "NestJS currently supports no API layer yet. Please use '--api none'.",
  "backend-auth":
    "NestJS backend currently supports Better Auth or no authentication. Please use '--auth better-auth' or '--auth none'.",
  "backend-database":
    "NestJS backend currently supports PostgreSQL as its database. Please use '--database postgres'.",
  "backend-orm": "NestJS backend currently supports Prisma as its ORM. Please use '--orm prisma'.",
  "example-ai-backend":
    "The 'ai' example is not supported with NestJS yet. Please remove 'ai' from --examples.",
  payment:
    "Payment integrations are not supported with NestJS yet. Please remove payment providers.",
} as const satisfies Partial<Record<CompatibilityIssueCode, string>>;

const FIELD_FLAGS: Partial<Record<CompatibilityField, string>> = {
  runtime: "--runtime",
  database: "--database",
  orm: "--orm",
  api: "--api",
  auth: "--auth",
  dbSetup: "--db-setup",
  serverDeploy: "--server-deploy",
  communication: "--communication",
  payments: "--payments",
};

function validationErr(message: string): ValidationResult {
  return Result.err(new ValidationError({ message }));
}

function normalizeCompatibilityInput(config: Partial<ProjectConfig>): Partial<ProjectConfig> {
  const payments: unknown = config.payments;
  return payments === "none" ? { ...config, payments: [] } : config;
}

function firstIncompatibleFrontend(frontends: readonly string[]): string | undefined {
  return ["nuxt", "svelte", "solid", "astro"].find((frontend) => frontends.includes(frontend));
}

function getBackendOwnedMessage(issue: CompatibilityIssue, config: Partial<ProjectConfig>): string {
  const field = issue.fields[0];
  const flag = FIELD_FLAGS[field] ?? field;
  const backend = config.backend;
  if (backend === "convex") {
    return `Convex backend requires '${flag} none'. Please remove the ${flag} flag or set it to 'none'.`;
  }
  if (backend === "none") {
    return `Backend 'none' requires '${flag} none'. Please remove the ${flag} flag or set it to 'none'.`;
  }
  return `${backend ?? "This backend"} owns ${field}; choose a compatible value.`;
}

function getDatabaseMessage(config: Partial<ProjectConfig>): string {
  if (config.orm === "mongoose") {
    return "Mongoose ORM requires MongoDB database. Please use '--database mongodb' or choose a different ORM.";
  }
  if (config.orm === "drizzle" && config.database === "mongodb") {
    return "Drizzle ORM does not support MongoDB. Please use '--orm mongoose' or '--orm prisma' or choose a different database.";
  }
  if (config.database && config.database !== "none" && config.orm === "none") {
    return "Database selection requires an ORM. Please choose '--orm drizzle', '--orm prisma', or '--orm mongoose'.";
  }
  return "ORM selection requires a database. Please choose a database or set '--orm none'.";
}

function getDatabaseSetupMessage(config: Partial<ProjectConfig>): string {
  if (!config.database || config.database === "none") {
    return "Database setup requires a database. Please choose a database or set '--db-setup none'.";
  }
  switch (config.dbSetup) {
    case "turso":
      return "Turso setup requires SQLite database. Please use '--database sqlite' or choose a different setup.";
    case "neon":
      return "Neon setup requires PostgreSQL database. Please use '--database postgres' or choose a different setup.";
    case "prisma-postgres":
      return "Prisma PostgreSQL setup requires PostgreSQL database. Please use '--database postgres' or choose a different setup.";
    case "planetscale":
      return "PlanetScale setup requires PostgreSQL or MySQL database. Please use '--database postgres' or '--database mysql' or choose a different setup.";
    case "mongodb-atlas":
      return "MongoDB Atlas setup requires MongoDB database. Please use '--database mongodb' or choose a different setup.";
    case "supabase":
      return "Supabase setup requires PostgreSQL database. Please use '--database postgres' or choose a different setup.";
    case "d1":
      return "Cloudflare D1 setup requires SQLite database.";
    case "docker":
      if (config.database === "sqlite") {
        return "Docker setup is not compatible with SQLite database. SQLite is file-based and doesn't require Docker. Please use '--database postgres', '--database mysql', '--database mongodb', or choose a different setup.";
      }
      return "Docker setup is not compatible with Cloudflare Workers runtime. Workers runtime uses serverless databases (D1) and doesn't support local Docker containers. Please use '--db-setup d1' for SQLite or choose a different runtime.";
    default:
      return "Database setup is not compatible with the selected database.";
  }
}

function getServerDeployMessage(config: Partial<ProjectConfig>): string {
  const serverDeploy = config.serverDeploy;
  if (!config.backend || config.backend === "none") {
    return "'--server-deploy' requires a backend. Please select a backend or set '--server-deploy none'.";
  }
  if (serverDeploy === "cloudflare") {
    if (config.runtime !== "workers") {
      return `Server deployment '${serverDeploy}' requires '--runtime workers'. Please use '--runtime workers' or choose a different server deployment.`;
    }
    return "Cloudflare server deployment requires the Hono backend. Please use '--backend hono' or choose a different server deployment.";
  }
  if (serverDeploy === "none" && config.runtime === "workers") {
    return "Cloudflare Workers runtime requires a server deployment. Please choose 'cloudflare' for --server-deploy.";
  }
  if (config.backend === "convex" || config.backend === "self") {
    return `'--server-deploy ${serverDeploy}' requires a separate server backend (hono, express, fastify, elysia, nestjs). For a fullstack 'self' backend, use '--web-deploy ${serverDeploy}' instead.`;
  }
  return `'--server-deploy ${serverDeploy}' is not compatible with '--runtime workers'. Use '--runtime bun' or '--runtime node', or choose '--server-deploy cloudflare'.`;
}

function getExampleMessage(config: Partial<ProjectConfig>, issue: CompatibilityIssue): string {
  if (issue.code === "example-ai-backend" && config.backend === "none") {
    return "The 'ai' example requires a backend.";
  }
  if (issue.code === "example-ai-backend" && config.backend === "nestjs") {
    return NESTJS_MESSAGES[issue.code] ?? "The selected backend does not support this example.";
  }
  if (issue.code === "example-ai-frontend") {
    const incompatible = firstIncompatibleFrontend(config.frontend ?? []);
    if (config.backend === "convex" && (incompatible === "nuxt" || incompatible === "svelte")) {
      return "The 'ai' example with Convex backend only supports React-based frontends (Next.js, TanStack Router, TanStack Start, React Router). Svelte and Nuxt are not supported with Convex AI.";
    }
    const frontendName = incompatible
      ? incompatible.charAt(0).toUpperCase() + incompatible.slice(1)
      : "selected";
    return `The 'ai' example is not compatible with the ${frontendName} frontend.`;
  }
  if (issue.code === "example-todo-database") {
    return "The 'todo' example requires a database. Cannot use --examples todo when database is 'none'.";
  }
  if (issue.code === "example-todo-api") {
    return "Cannot use '--examples todo' when '--api' is set to 'none'.";
  }
  return "The selected example is not compatible with this project configuration.";
}

function getAddonMessage(issue: CompatibilityIssue, config: Partial<ProjectConfig>): string {
  if (issue.code === "addon-task-runner") {
    return "Cannot combine 'turborepo' and 'vite-plus' addons. Choose one task runner.";
  }
  if (issue.code === "addon-linter") {
    return "Cannot combine 'biome' and 'oxlint' addons. Choose one code-quality linter.";
  }
  const addon = issue.values?.[0] ?? "selected";
  if (issue.code === "addon-backend") {
    return `${addon} addon requires a separate backend or no backend because backend 'self' emits server routes that cannot be bundled as static desktop assets.`;
  }
  if (issue.code === "addon-auth") {
    if (config.auth === "clerk" && config.frontend?.includes("react-router")) {
      return `${addon} addon forces React Router into a static export, but Clerk on React Router requires SSR middleware. Remove the addon or use a different auth/frontend.`;
    }
    return `${addon} addon is not compatible with Convex Better Auth on Next.js or TanStack Start because those templates use server auth bootstrap and cannot be exported as static desktop assets.`;
  }
  const compatibleFrontends = isAddon(addon) ? ADDON_COMPATIBILITY[addon] : [];
  return `${addon} addon requires one of these frontends: ${compatibleFrontends.join(", ")}`;
}

function isAddon(value: string): value is Addons {
  return Object.hasOwn(ADDON_COMPATIBILITY, value);
}

function getCompatibilityMessage(
  issue: CompatibilityIssue,
  config: Partial<ProjectConfig>,
  options?: CLIInput,
): string {
  if (issue.code.startsWith("backend-none-") || issue.code.startsWith("backend-convex-")) {
    if (issue.code === "backend-convex-frontend") {
      const incompatible = (config.frontend ?? []).filter(
        (frontend) => frontend === "solid" || frontend === "astro",
      );
      return `The following frontends are not compatible with '--backend convex': ${incompatible.join(
        ", ",
      )}. Please choose a different frontend or backend.`;
    }
    if (issue.code === "backend-convex-better-auth-frontend") {
      const incompatible = (config.frontend ?? []).filter((frontend) =>
        includesValue(CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS, frontend),
      );
      if (incompatible.length > 0) {
        return `Better Auth with '--backend convex' is not compatible with the following frontends: ${incompatible.join(
          ", ",
        )}. Please use a React-based web frontend (next, tanstack-start, tanstack-router, react-router), a supported native frontend, or choose a different auth provider.`;
      }
      return `Better Auth with '--backend convex' requires a supported frontend (${CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS.join(
        ", ",
      )}).`;
    }
    return getBackendOwnedMessage(issue, config);
  }
  if (issue.code === "backend-self-frontend") {
    return "Backend 'self' (fullstack) currently only supports Next.js, TanStack Start, Nuxt, SvelteKit, and Astro frontends. Please use --frontend next, --frontend tanstack-start, --frontend nuxt, --frontend svelte, or --frontend astro.";
  }
  if (issue.code === "backend-self-runtime") {
    return "Backend 'self' (fullstack) requires '--runtime none'. Please remove the --runtime flag or set it to 'none'.";
  }
  if (issue.code === "frontend-web-cardinality") {
    return "Cannot select multiple web frameworks. Choose only one of: tanstack-router, tanstack-start, react-router, next, nuxt, svelte, solid, astro";
  }
  if (issue.code === "frontend-native-cardinality") {
    return "Cannot select multiple native frameworks. Choose only one of: native-bare, native-uniwind, native-unistyles";
  }
  if (issue.code === "backend-workers") {
    if (options?.runtime === "workers") {
      return `Cloudflare Workers runtime (--runtime workers) is only supported with Hono backend (--backend hono). Current backend: ${config.backend}. Please use '--backend hono' or choose a different runtime.`;
    }
    return `Backend '${config.backend}' is not compatible with Cloudflare Workers runtime. Cloudflare Workers runtime is only supported with Hono backend. Please use '--backend hono' or choose a different runtime.`;
  }
  if (issue.code === "backend-workers-database") {
    if (options?.runtime === "workers") {
      return "Cloudflare Workers runtime (--runtime workers) is not compatible with MongoDB database. MongoDB requires Prisma or Mongoose ORM, but Workers runtime only supports Drizzle or Prisma ORM. Please use a different database or runtime.";
    }
    return "MongoDB database is not compatible with Cloudflare Workers runtime. MongoDB requires Prisma or Mongoose ORM, but Workers runtime only supports Drizzle or Prisma ORM. Please use a different database or runtime.";
  }
  if (issue.code === "runtime-required") {
    return "'--runtime none' is only supported with '--backend convex', '--backend none', or '--backend self'. Please choose 'bun', 'node', or remove the --runtime flag.";
  }
  if (
    issue.code === "backend-api" ||
    issue.code === "backend-auth" ||
    issue.code === "backend-database" ||
    issue.code === "backend-orm"
  ) {
    if (config.backend === "nestjs") {
      return NESTJS_MESSAGES[issue.code] ?? "The selected backend does not support this value.";
    }
    if (issue.code === "backend-api" && config.api === "orval") {
      return "Orval API requires the Hono backend. Please use '--backend hono' or choose tRPC/oRPC.";
    }
  }
  if (issue.code === "api-frontend") {
    const frontend = firstIncompatibleFrontend(config.frontend ?? []);
    return `tRPC API is not supported with '${frontend}' frontend. Please use --api orpc or --api none or remove '${frontend}' from --frontend.`;
  }
  if (issue.code === "database-orm") return getDatabaseMessage(config);
  if (issue.code === "database-setup" || issue.code === "database-setup-target") {
    if (issue.code === "database-setup-target") {
      return "Cloudflare D1 setup requires SQLite database and either Cloudflare Workers runtime with server deployment or backend 'self' with Cloudflare web deployment.";
    }
    return getDatabaseSetupMessage(config);
  }
  if (issue.code === "web-deploy-frontend") {
    return "'--web-deploy' requires a web frontend. Please select a web frontend or set '--web-deploy none'.";
  }
  if (
    issue.code === "server-deploy-backend" ||
    issue.code === "server-deploy-runtime" ||
    issue.code === "server-deploy-cloudflare"
  ) {
    return getServerDeployMessage(config);
  }
  if (issue.code === "auth-backend") {
    return "Clerk exige backend Convex, Hono, Express, Fastify, Elysia ou Next.js/TanStack Start fullstack";
  }
  if (issue.code === "auth-frontend") {
    return "Clerk authentication is not compatible with the selected frontend. Please choose a different frontend or auth provider.";
  }
  if (
    issue.code === "addon-task-runner" ||
    issue.code === "addon-linter" ||
    issue.code === "addon-frontend" ||
    issue.code === "addon-backend" ||
    issue.code === "addon-auth"
  ) {
    return getAddonMessage(issue, config);
  }
  if (issue.code === "testing-frontend") return "playwright testing requires a web frontend";
  if (
    issue.code === "example-todo-database" ||
    issue.code === "example-todo-api" ||
    issue.code === "example-todo-orval" ||
    issue.code === "example-ai-frontend" ||
    issue.code === "example-ai-backend"
  ) {
    if (issue.code === "example-todo-orval") {
      return "The Orval API layer does not support the generated todo example yet. Please remove 'todo' from --examples or choose tRPC/oRPC.";
    }
    return getExampleMessage(config, issue);
  }
  if (issue.code === "communication") {
    const provider = config.communication;
    const providerName =
      provider === "resend" ? "Resend" : provider === "notifique" ? "Notifique" : "AraraHQ";
    const communicationIssue = isCommunicationProvider(provider)
      ? getCommunicationCompatibilityIssue({
          provider,
          backend: config.backend,
          runtime: config.runtime,
          serverDeploy: config.serverDeploy,
        })
      : null;
    return communicationIssue === "workers-unsupported"
      ? "AraraHQ requires the official Node SDK and is not compatible with Edge/Workers runtimes. Use a Node/Bun server deployment or Convex Node Action."
      : `${providerName} communication requires a server backend. Please choose a backend or use '--communication none'.`;
  }
  if (issue.code === "payment") {
    const paymentValues: unknown = config.payments;
    const providers = Array.isArray(paymentValues)
      ? paymentValues
      : typeof paymentValues === "string"
        ? [paymentValues]
        : [];
    const provider = providers.find((candidate) =>
      getPaymentCompatibilityIssue({
        provider: candidate,
        backend: config.backend,
        frontends: config.frontend,
        database: config.database,
        orm: config.orm,
      }),
    );
    if (config.backend === "nestjs") return NESTJS_MESSAGES.payment;
    const paymentIssue = provider
      ? getPaymentCompatibilityIssue({
          provider,
          backend: config.backend,
          frontends: config.frontend,
          database: config.database,
          orm: config.orm,
        })
      : null;
    const label = provider === "stripe" ? "Stripe" : "AbacatePay";
    if (paymentIssue === "convex-unsupported") {
      return `${label} payments is not compatible with '--backend convex'. Please use a server backend or backend 'self'.`;
    }
    if (paymentIssue === "requires-web-frontend") {
      return `${label} payments requires a web frontend. Please choose next, tanstack-start, tanstack-router, react-router, nuxt, svelte, solid, or astro.`;
    }
    if (paymentIssue === "native-only-unsupported") {
      return `${label} payments is not compatible with native-only frontends. Please add a supported web frontend or leave payments unselected.`;
    }
    if (paymentIssue === "sql-database-required") {
      return "AbacatePay payments v1 requires a SQL database with Drizzle or Prisma. MongoDB and Mongoose are not supported.";
    }
    return `${label} payments is not compatible with the selected project configuration.`;
  }
  return "The selected project configuration is not compatible.";
}

export function validateWithCompatibilityEvaluator(
  config: Partial<ProjectConfig>,
  options?: CLIInput,
  preferredCodes: readonly CompatibilityIssueCode[] = [],
): ValidationResult {
  const normalizedConfig = normalizeCompatibilityInput(config);
  const issues = evaluate(normalizedConfig).issues;
  const firstIssue =
    preferredCodes
      .map((code) => issues.find((candidate) => candidate.code === code))
      .find((candidate): candidate is CompatibilityIssue => candidate !== undefined) ?? issues[0];
  return firstIssue
    ? validationErr(getCompatibilityMessage(firstIssue, normalizedConfig, options))
    : Result.ok(undefined);
}

export function getCompatibilityValidationMessage(
  issue: CompatibilityIssue,
  config: Partial<ProjectConfig>,
  options?: CLIInput,
): string {
  return getCompatibilityMessage(issue, config, options);
}

function includesValue(values: readonly string[], value: string): boolean {
  return values.some((candidate) => candidate === value);
}
