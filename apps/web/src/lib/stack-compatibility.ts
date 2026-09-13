import {
  ADDON_COMPATIBILITY,
  CLERK_BACKENDS,
  CLERK_FRONTENDS,
  CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS,
  evaluate,
  getCommunicationCompatibilityIssue,
  getPaymentCompatibilityIssue,
  isCommunicationProvider,
  isDesktopWebFrontend,
  isSelfHostedFrontend,
  normalizeCompatibility,
  WEB_FRONTENDS_REQUIRING_ORPC,
  type CompatibilityField,
  type CompatibilityIssue,
  type CompatibilityIssueCode,
  type CommunicationCompatibilityIssue,
  type CommunicationProvider,
  type ProjectConfigDraft,
} from "@kubojs/types";

import { DEFAULT_STACK, type StackState, type TECH_OPTIONS } from "./constant";
import {
  projectConfigDraftToStackState,
  stackStateToProjectConfigDraft,
  stackStateWithOption,
} from "./stack-state";
import { CATEGORY_ORDER } from "./stack-utils";
import type { TechCategory } from "./types";

export type CompatibilityResult = {
  adjustedStack: StackState | null;
  notes: Record<string, { notes: string[]; hasIssue: boolean }>;
  changes: Array<{ category: string; message: string }>;
};

const COMMUNICATION_PRODUCT_NAME = {
  resend: "Resend",
  notifique: "Notifique",
  arara: "AraraHQ",
} satisfies Record<CommunicationProvider, string>;

const CATEGORY_FIELDS: Record<TechCategory, CompatibilityField> = {
  webFrontend: "frontend",
  nativeFrontend: "frontend",
  api: "api",
  runtime: "runtime",
  backend: "backend",
  database: "database",
  orm: "orm",
  dbSetup: "dbSetup",
  webDeploy: "webDeploy",
  serverDeploy: "serverDeploy",
  auth: "auth",
  payments: "payments",
  observability: "observability",
  communication: "communication",
  packageManager: "packageManager",
  addons: "addons",
  testing: "testing",
  examples: "examples",
  git: "git",
  install: "install",
};

const AUTO_ADJUSTABLE_ISSUES: Partial<Record<TechCategory, readonly CompatibilityIssueCode[]>> = {
  runtime: ["server-deploy-runtime"],
  dbSetup: ["database-setup-target"],
  addons: ["addon-task-runner", "addon-linter"],
};

const BACKEND_CAPABILITY_MESSAGES: Partial<Record<CompatibilityField, string>> = {
  api: "A camada de API selecionada não é compatível com este backend",
  auth: "O provedor de autenticação selecionado não é compatível com este backend",
  database: "O banco de dados selecionado não é compatível com este backend",
  orm: "O ORM selecionado não é compatível com este backend",
  examples: "O exemplo de IA não é compatível com este backend",
  payments: "Integrações de pagamento não são compatíveis com este backend",
} as const satisfies Partial<Record<CompatibilityField, string>>;

const SELF_HOSTED_FRONTEND_MESSAGES = {
  next: "Next.js fullstack exige frontend Next.js",
  "tanstack-start": "TanStack Start fullstack exige frontend TanStack Start",
  nuxt: "Nuxt fullstack exige frontend Nuxt",
  svelte: "SvelteKit fullstack exige frontend SvelteKit",
  astro: "Astro fullstack exige frontend Astro",
} as const;

const SELF_HOSTED_FRONTEND_API_MESSAGES = {
  nuxt: "tRPC não é compatível com Nuxt (use oRPC)",
  svelte: "tRPC não é compatível com SvelteKit (use oRPC)",
  astro: "tRPC não é compatível com Astro (use oRPC)",
} as const;

const CLERK_BACKEND_REQUIREMENT =
  "Clerk exige backend Convex, Hono, Express, Fastify, Elysia ou Next.js/TanStack Start fullstack";
const CLERK_FRONTEND_REQUIREMENT =
  "Clerk exige React Router, TanStack Router, TanStack Start, Next.js ou React Native";
const CONVEX_BETTER_AUTH_FRONTEND_REQUIREMENT =
  "Better-Auth com Convex exige React Router, TanStack Router, TanStack Start, Next.js ou React Native";

const DATABASE_SETUP_LABELS = {
  turso: "SQLite",
  d1: "SQLite",
  neon: "PostgreSQL",
  supabase: "PostgreSQL",
  "prisma-postgres": "PostgreSQL",
  "mongodb-atlas": "MongoDB",
  planetscale: "PostgreSQL",
} as const;

const DRAFT_FIELDS: readonly (keyof ProjectConfigDraft)[] = [
  "projectName",
  "frontend",
  "runtime",
  "backend",
  "api",
  "database",
  "orm",
  "dbSetup",
  "auth",
  "payments",
  "observability",
  "communication",
  "packageManager",
  "addons",
  "testing",
  "examples",
  "git",
  "install",
  "webDeploy",
  "serverDeploy",
];

function getDatabaseSetupLabel(setup: ProjectConfigDraft["dbSetup"]): string | undefined {
  switch (setup) {
    case "turso":
    case "d1":
      return DATABASE_SETUP_LABELS[setup];
    case "neon":
    case "supabase":
    case "prisma-postgres":
      return DATABASE_SETUP_LABELS[setup];
    case "mongodb-atlas":
      return DATABASE_SETUP_LABELS[setup];
    case "planetscale":
      return DATABASE_SETUP_LABELS[setup];
    default:
      return undefined;
  }
}

function sameValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }
  return left === right;
}

function sameConfig(left: ProjectConfigDraft, right: ProjectConfigDraft): boolean {
  return DRAFT_FIELDS.every((field) => sameValue(left[field], right[field]));
}

function initializeNotes(): CompatibilityResult["notes"] {
  return Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, { notes: [], hasIssue: false }]),
  );
}

function getAdjustmentCategory(code: string, field: CompatibilityField): string {
  if (code.startsWith("backend-")) return "backend";
  if (code === "runtime-required" || code.startsWith("server-deploy")) return "runtime";
  return field;
}

function getBackendAdjustmentMessage(
  config: ProjectConfigDraft,
  field: CompatibilityField,
): string | undefined {
  if (config.backend === "convex") {
    const messages: Partial<Record<CompatibilityField, string>> = {
      runtime: "Runtime definido como 'none' (o Convex fornece isso)",
      database: "Banco de dados definido como 'none' (o Convex fornece isso)",
      orm: "ORM definido como 'none' (o Convex fornece isso)",
      api: "API definido como 'none' (o Convex fornece isso)",
      dbSetup: "Config. do banco definido como 'none' (o Convex fornece isso)",
      serverDeploy: "Deploy do servidor definido como 'none' (o Convex fornece isso)",
      payments: "Pagamentos definido como '' (o Convex fornece isso)",
    };
    return messages[field];
  }
  if (config.backend === "none") {
    const messages: Partial<Record<CompatibilityField, string>> = {
      runtime: "Runtime definido como 'none' (sem backend)",
      database: "Banco de dados definido como 'none' (sem backend)",
      orm: "ORM definido como 'none' (sem backend)",
      api: "API definido como 'none' (sem backend)",
      auth: "Auth definido como 'none' (sem backend)",
      payments: "Pagamentos definido como '' (sem backend)",
      communication: "Comunicação definido como 'none' (sem backend)",
      dbSetup: "Config. do banco definido como 'none' (sem backend)",
      serverDeploy: "Deploy do servidor definido como 'none' (sem backend)",
      examples: "Exemplos limpos (sem backend)",
    };
    return messages[field];
  }
  return undefined;
}

function getAdjustmentMessage(
  code: string,
  field: CompatibilityField,
  config: ProjectConfigDraft,
): string {
  const backendMessage = code.startsWith("backend-")
    ? getBackendAdjustmentMessage(config, field)
    : undefined;
  if (backendMessage) return backendMessage;

  if (code === "backend-convex-frontend") {
    return "Frontend removido (incompatível com Convex)";
  }
  if (code === "backend-convex-example") {
    return "Exemplo de IA removido (Convex AI só suporta frontends baseados em React)";
  }
  if (code === "backend-convex-auth") {
    return "Auth definido como 'Nenhum' (frontend incompatível com o backend)";
  }
  if (code === "backend-self") {
    return field === "runtime"
      ? "Runtime definido como 'Nenhum' (fullstack usa as rotas de API do frontend)"
      : "Deploy do servidor definido como 'Nenhum' (fullstack usa o deploy do frontend)";
  }
  if (code === "backend-workers") {
    return field === "backend"
      ? "Backend definido como 'Hono' (necessário para Workers)"
      : "Deploy do servidor definido como 'Cloudflare' (necessário para Workers)";
  }
  if (code === "backend-workers-database") {
    return "Banco alterado para SQLite com D1 (MongoDB incompatível com Workers)";
  }
  if (code === "runtime-required") {
    return `Runtime definido como '${DEFAULT_STACK.runtime}' (necessário para este backend)`;
  }
  if (code === "database-orm") {
    if (field === "orm") return "ORM definido como 'Nenhum' (nenhum banco selecionado)";
    return config.orm === "mongoose"
      ? "Banco definido como 'MongoDB' (necessário para Mongoose)"
      : "Banco definido como 'SQLite' (necessário para o ORM)";
  }
  if (code === "database-setup") {
    const label = getDatabaseSetupLabel(config.dbSetup);
    if (field === "dbSetup")
      return "Config. do banco definida como 'Nenhum' (incompatível com o banco)";
    return `Banco definido como '${label ?? "compatível"}' (necessário para ${config.dbSetup})`;
  }
  if (code === "database-setup-target") {
    return "Configuração D1 ajustada para o alvo Cloudflare compatível";
  }
  if (code === "api-frontend") return "API definida como 'oRPC' (necessária para este frontend)";
  if (code === "backend-api") {
    return config.backend === "nestjs"
      ? "API definida como 'Nenhuma' (NestJS ainda não possui uma camada de API suportada)"
      : "API definida como 'Nenhuma' (a camada selecionada não é compatível com este backend)";
  }
  if (code === "backend-auth") {
    return "Auth definido como 'Nenhum' (NestJS suporta Better Auth ou nenhum auth)";
  }
  if (code === "backend-database") {
    return "Banco definido como 'PostgreSQL' (NestJS suporta PostgreSQL)";
  }
  if (code === "backend-orm") return "ORM definido como 'Prisma' (NestJS suporta Prisma)";
  if (code === "example-ai-backend") {
    return "Exemplo de IA removido (não é suportado com este backend)";
  }
  if (code === "backend-payments") {
    return "Providers de pagamento removidos (não são suportados com este backend)";
  }
  if (code === "payment") return "Providers de pagamento incompatíveis foram removidos";
  if (code === "addon") return "Add-on removido (exige frontend compatível)";
  if (code === "testing-frontend") return "Playwright removido (exige frontend compatível)";
  if (code === "example-todo-database") return "Todo removido (exige banco de dados)";
  if (code === "example-todo-api") return "Todo removido (exige camada de API)";
  if (code.startsWith("example-")) {
    return "IA removida (incompatível com a configuração selecionada)";
  }
  if (code === "web-deploy-frontend") {
    return "Deploy web definido como 'Nenhum' (sem frontend web)";
  }
  if (code === "server-deploy-cloudflare") {
    return "Deploy do servidor definido como 'Nenhum' (Cloudflare exige Workers + Hono)";
  }
  if (code === "server-deploy-runtime") {
    return "Deploy do servidor definido como 'Cloudflare' (runtime Workers faz deploy via Cloudflare)";
  }
  if (code === "server-deploy-backend") {
    return "Deploy do servidor definido como 'Nenhum' (não é necessário para este backend)";
  }
  return `Seleção de ${field} ajustada para uma opção compatível`;
}

function getChanges(
  normalized: ReturnType<typeof normalizeCompatibility>,
): CompatibilityResult["changes"] {
  return normalized.adjustments.map(({ code, field }) => ({
    category: getAdjustmentCategory(code, field),
    message: getAdjustmentMessage(code, field, normalized.config),
  }));
}

export function analyzeStackCompatibility(stack: StackState): CompatibilityResult {
  if (stack.yolo) return { adjustedStack: null, notes: {}, changes: [] };

  const input = stackStateToProjectConfigDraft(stack);
  const normalized = normalizeCompatibility(input);
  const adjustedStack = sameConfig(normalized.config, input)
    ? null
    : projectConfigDraftToStackState(normalized.config, stack.yolo);

  return {
    adjustedStack,
    notes: initializeNotes(),
    changes: getChanges(normalized),
  };
}

function getFirstFrontend(frontends: readonly string[], candidates: readonly string[]) {
  return frontends.find((frontend) => candidates.includes(frontend));
}

function getPaymentMessage(config: ProjectConfigDraft): string {
  if (config.backend === "nestjs") {
    return "Integrações de pagamento não são compatíveis com este backend";
  }
  const provider = config.payments.find((candidate) =>
    getPaymentCompatibilityIssue({
      provider: candidate,
      backend: config.backend,
      frontends: config.frontend,
      database: config.database,
      orm: config.orm,
    }),
  );
  const issue = provider
    ? getPaymentCompatibilityIssue({
        provider,
        backend: config.backend,
        frontends: config.frontend,
        database: config.database,
        orm: config.orm,
      })
    : null;
  const label = provider === "stripe" ? "Stripe" : "AbacatePay";

  if (issue === "convex-unsupported") return `${label} não é suportado com Convex`;
  if (issue === "requires-web-frontend") return `${label} exige um frontend web`;
  if (issue === "native-only-unsupported") {
    return `${label} v1 não suporta apps com frontend nativo`;
  }
  if (issue === "sql-database-required") {
    return "AbacatePay v1 exige um banco SQL com Prisma ou Drizzle";
  }
  return "Integração de pagamento incompatível com a configuração selecionada";
}

function getCommunicationMessage(config: ProjectConfigDraft): string | null {
  if (!isCommunicationProvider(config.communication)) return null;
  const issue = getCommunicationCompatibilityIssue({
    provider: config.communication,
    backend: config.backend,
    runtime: config.runtime,
    serverDeploy: config.serverDeploy,
  });
  const messages = {
    "requires-backend": `${COMMUNICATION_PRODUCT_NAME[config.communication]} exige um backend com runtime de servidor`,
    "workers-unsupported":
      "AraraHQ exige o SDK Node e não é compatível com runtimes Edge/Workers. Use um servidor Node/Bun ou uma Node Action do Convex.",
  } satisfies Record<CommunicationCompatibilityIssue, string>;
  return issue ? messages[issue] : null;
}

function getIssueMessage(issue: CompatibilityIssue, config: ProjectConfigDraft): string {
  const field = issue.fields[0];

  if (issue.code === "frontend-web-cardinality") {
    return "Escolha apenas um frontend web";
  }
  if (issue.code === "frontend-native-cardinality") {
    return "Escolha apenas um frontend nativo";
  }
  if (issue.code === "backend-self-frontend") {
    const frontend = config.frontend.find(isSelfHostedFrontend);
    return frontend
      ? SELF_HOSTED_FRONTEND_MESSAGES[frontend]
      : "Fullstack self exige Next.js, TanStack Start, Nuxt, SvelteKit ou Astro";
  }
  if (issue.code === "backend-self-runtime") {
    return "Fullstack self usa as rotas de API nativas do frontend";
  }
  if (issue.code === "backend-convex-frontend") {
    const incompatible = getFirstFrontend(config.frontend, ["solid", "astro"]);
    return `Convex não é compatível com ${incompatible ? incompatible[0].toUpperCase() + incompatible.slice(1) : "este frontend"}`;
  }
  if (issue.code === "backend-convex-better-auth-frontend") {
    return CONVEX_BETTER_AUTH_FRONTEND_REQUIREMENT;
  }
  if (issue.code.startsWith("backend-convex-") || issue.code.startsWith("backend-none-")) {
    if (field === "communication") {
      return getCommunicationMessage(config) ?? "Nenhum backend selecionado";
    }
    if (config.backend === "convex") {
      const messages: Partial<Record<CompatibilityField, string>> = {
        runtime: "O Convex fornece o próprio runtime",
        database: "O Convex fornece o próprio banco de dados",
        orm: "O Convex tem acesso a dados embutido",
        api: "O Convex fornece a própria camada de API",
        dbSetup: "O Convex cuida da configuração do banco",
        serverDeploy: "O Convex tem o próprio deploy",
      };
      return messages[field] ?? "O Convex fornece essa capacidade";
    }
    return "Nenhum backend selecionado";
  }
  if (issue.code === "backend-workers") {
    return "Workers exige backend Hono";
  }
  if (issue.code === "backend-workers-database") {
    return "MongoDB não é compatível com o runtime Workers";
  }
  if (issue.code === "runtime-required") {
    return "Runtime 'Nenhum' só para backends Convex ou fullstack";
  }
  if (issue.code.startsWith("backend-")) {
    return (
      BACKEND_CAPABILITY_MESSAGES[field] ?? "O valor selecionado não é compatível com este backend"
    );
  }
  if (issue.code === "api-frontend") {
    const frontend = getFirstFrontend(config.frontend, WEB_FRONTENDS_REQUIRING_ORPC);
    const selfHostedApiMessage =
      frontend === "nuxt"
        ? SELF_HOSTED_FRONTEND_API_MESSAGES.nuxt
        : frontend === "svelte"
          ? SELF_HOSTED_FRONTEND_API_MESSAGES.svelte
          : frontend === "astro"
            ? SELF_HOSTED_FRONTEND_API_MESSAGES.astro
            : undefined;
    if (selfHostedApiMessage && config.backend === "self") return selfHostedApiMessage;
    return `${frontend ?? "Este frontend"} exige oRPC, não tRPC`;
  }
  if (issue.code === "database-orm") {
    if (config.orm === "mongoose") return "Mongoose só funciona com MongoDB";
    if (config.orm === "drizzle" && config.database === "mongodb") {
      return "Drizzle não suporta MongoDB";
    }
    if (config.orm === "none") return "O banco exige um ORM";
    return "O ORM selecionado exige um banco de dados";
  }
  if (issue.code === "database-setup") {
    if (config.dbSetup === "turso") return "Turso exige SQLite";
    if (config.dbSetup === "d1") return "D1 exige SQLite";
    if (
      config.dbSetup === "neon" ||
      config.dbSetup === "supabase" ||
      config.dbSetup === "prisma-postgres"
    ) {
      return `${config.dbSetup} exige PostgreSQL`;
    }
    if (config.dbSetup === "mongodb-atlas") return "MongoDB Atlas exige MongoDB";
    if (config.dbSetup === "planetscale") return "PlanetScale exige PostgreSQL ou MySQL";
    if (config.dbSetup === "docker" && config.runtime === "workers") {
      return "Docker é incompatível com Workers";
    }
    return "SQLite não precisa de Docker";
  }
  if (issue.code === "database-setup-target") {
    return config.backend === "self"
      ? "D1 com backend fullstack self exige deploy web na Cloudflare"
      : "D1 exige runtime Cloudflare Workers ou um backend fullstack self";
  }
  if (issue.code === "web-deploy-frontend") return "Deploy web exige um frontend web";
  if (issue.code === "server-deploy-cloudflare") {
    return config.runtime !== "workers"
      ? "Cloudflare exige runtime Workers"
      : "Cloudflare exige backend Hono";
  }
  if (issue.code === "server-deploy-runtime") {
    const labels: Record<string, string> = {
      docker: "com Docker",
      vercel: "na Vercel",
      railway: "na Railway",
      guaracloud: "na Guara Cloud",
    };
    const label = labels[config.serverDeploy];
    return label
      ? `Deploy de servidor ${label} exige runtime Bun ou Node`
      : "Workers exige deploy do servidor";
  }
  if (issue.code === "server-deploy-backend") {
    return config.backend === "self"
      ? "Fullstack usa o deploy do frontend"
      : "Deploy do servidor não é necessário para este backend";
  }
  if (issue.code === "auth-backend") return CLERK_BACKEND_REQUIREMENT;
  if (issue.code === "auth-frontend") return CLERK_FRONTEND_REQUIREMENT;
  if (issue.code === "addon-frontend") {
    const addon = issue.values?.[0];
    const frontends = addon && isAddon(addon) ? ADDON_COMPATIBILITY[addon] : undefined;
    return `${addon ?? "Este add-on"} exige um frontend web compatível${frontends?.length ? ` (${frontends.join(", ")})` : ""}`;
  }
  if (issue.code === "addon-backend") {
    return `${issue.values?.[0] ?? "Este add-on"} exige um backend separado ou nenhum backend`;
  }
  if (issue.code === "addon-auth") {
    return "Tauri não é compatível com Convex Better Auth no Next.js ou TanStack Start";
  }
  if (issue.code === "testing-frontend") return "Playwright exige um frontend web";
  if (issue.code === "example-todo-database") return "O exemplo Todo exige um banco de dados";
  if (issue.code === "example-todo-api")
    return "O exemplo Todo exige uma camada de API (tRPC ou oRPC)";
  if (issue.code === "example-todo-orval") return "O exemplo Todo não é compatível com Orval";
  if (issue.code === "example-ai-frontend") {
    const frontend = getFirstFrontend(config.frontend, ["solid", "astro", "nuxt", "svelte"]);
    return config.backend === "convex" && (frontend === "nuxt" || frontend === "svelte")
      ? `O exemplo de IA do Convex só suporta frontends baseados em React (não ${frontend})`
      : "Exemplo de IA incompatível com frontend Solid ou Astro";
  }
  if (issue.code === "example-ai-backend") {
    return config.backend === "nestjs"
      ? "Exemplo de IA não é compatível com este backend"
      : "O exemplo de IA exige um backend";
  }
  if (issue.code === "communication")
    return getCommunicationMessage(config) ?? "Comunicação incompatível";
  if (issue.code === "payment") return getPaymentMessage(config);
  return "A opção selecionada não é compatível com esta configuração";
}

function isAutoAdjustable(issue: CompatibilityIssue, category: TechCategory): boolean {
  return AUTO_ADJUSTABLE_ISSUES[category]?.includes(issue.code) ?? false;
}

export function getDisabledReason(
  currentStack: StackState,
  category: TechCategory,
  optionId: string,
): string | null {
  if (currentStack.yolo) return null;

  const candidate = stackStateWithOption(currentStack, category, optionId);
  const field = CATEGORY_FIELDS[category];
  const issues = evaluate(stackStateToProjectConfigDraft(candidate)).issues.filter(
    (candidateIssue) =>
      candidateIssue.fields.includes(field) && !isAutoAdjustable(candidateIssue, category),
  );
  const issue =
    category === "serverDeploy"
      ? (issues.find((candidateIssue) => candidateIssue.code.startsWith("server-deploy-")) ??
        issues[0])
      : issues[0];
  return issue ? getIssueMessage(issue, stackStateToProjectConfigDraft(candidate)) : null;
}

export function isOptionCompatible(
  currentStack: StackState,
  category: keyof typeof TECH_OPTIONS,
  optionId: string,
): boolean {
  return getDisabledReason(currentStack, category, optionId) === null;
}

export function hasPWACompatibleFrontend(webFrontend: string[]): boolean {
  return webFrontend.some((frontend) =>
    ADDON_COMPATIBILITY.pwa.some((value) => value === frontend),
  );
}

export function hasClerkCompatibleFrontend(
  webFrontend: string[],
  nativeFrontend: string[],
): boolean {
  return [...webFrontend, ...nativeFrontend].some((frontend) =>
    CLERK_FRONTENDS.some((value) => value === frontend),
  );
}

export function hasClerkCompatibleBackend(backend: string): boolean {
  return CLERK_BACKENDS.some((value) => value === backend);
}

export function hasTauriCompatibleFrontend(webFrontend: string[], backend = ""): boolean {
  return backend !== "self" && webFrontend.some(isDesktopWebFrontend);
}

export function hasElectrobunCompatibleFrontend(webFrontend: string[], backend = ""): boolean {
  return hasTauriCompatibleFrontend(webFrontend, backend);
}

export function hasPlaywrightCompatibleFrontend(webFrontend: string[]): boolean {
  return webFrontend.some(isDesktopWebFrontend);
}

export function isTauriBlockedByConvexBetterAuth(
  webFrontend: string[],
  backend: string,
  auth: string,
): boolean {
  return (
    backend === "convex" &&
    auth === "better-auth" &&
    webFrontend.some((frontend) =>
      CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS.some((value) => value === frontend),
    )
  );
}

function isAddon(value: string): value is keyof typeof ADDON_COMPATIBILITY {
  return Object.hasOwn(ADDON_COMPATIBILITY, value);
}
