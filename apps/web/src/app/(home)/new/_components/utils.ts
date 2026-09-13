import {
  getBackendCompatibilityIssue,
  getCommunicationCompatibilityIssue,
  getPaymentCompatibilityIssue,
  isCommunicationProvider,
  isDesktopWebFrontend,
  getSelfHostedFrontend,
  type CommunicationCompatibilityIssue,
  type CommunicationProvider,
} from "@kubojs/types";

import { DEFAULT_STACK, type StackState, type TECH_OPTIONS } from "@/lib/constant";
import { getFrontendSelection } from "@/lib/stack-state";
import { CATEGORY_ORDER } from "@/lib/stack-utils";

export function validateProjectName(name: string): string | undefined {
  const INVALID_CHARS = ["<", ">", ":", '"', "|", "?", "*"];
  const MAX_LENGTH = 255;

  if (name === ".") return undefined;

  if (!name) return "O nome do projeto não pode ficar vazio";
  if (name.length > MAX_LENGTH) {
    return `O nome do projeto deve ter menos de ${MAX_LENGTH} caracteres`;
  }
  if (INVALID_CHARS.some((char) => name.includes(char))) {
    return "O nome do projeto contém caracteres inválidos";
  }
  if (name.startsWith(".") || name.startsWith("-")) {
    return "O nome do projeto não pode começar com ponto ou hífen";
  }
  if (name.toLowerCase() === "node_modules" || name.toLowerCase() === "favicon.ico") {
    return "Esse nome de projeto é reservado";
  }
  return undefined;
}

export const hasPWACompatibleFrontend = (webFrontend: string[]) =>
  webFrontend.some((f) => ["tanstack-router", "react-router", "solid", "next"].includes(f));

const clerkSupportedBackends = ["convex", "hono", "express", "fastify", "elysia", "self"] as const;

const selfHostedFrontendLabels = {
  next: "Next.js",
  "tanstack-start": "TanStack Start",
  nuxt: "Nuxt",
  svelte: "SvelteKit",
  astro: "Astro",
} as const;

const selfHostedFrontendMessages = {
  next: "Next.js fullstack exige frontend Next.js",
  "tanstack-start": "TanStack Start fullstack exige frontend TanStack Start",
  nuxt: "Nuxt fullstack exige frontend Nuxt",
  svelte: "SvelteKit fullstack exige frontend SvelteKit",
  astro: "Astro fullstack exige frontend Astro",
} as const;

const selfHostedFrontendApiMessages: Partial<
  Record<keyof typeof selfHostedFrontendLabels, string>
> = {
  nuxt: "tRPC não é compatível com Nuxt (use oRPC)",
  svelte: "tRPC não é compatível com SvelteKit (use oRPC)",
  astro: "tRPC não é compatível com Astro (use oRPC)",
} as const;

const includesValue = <T extends string>(values: readonly T[], value: string): value is T =>
  values.some((candidate) => candidate === value);

const clerkBackendRequirementMessage =
  "Clerk exige backend Convex, Hono, Express, Fastify, Elysia ou Next.js/TanStack Start fullstack";
const clerkFrontendRequirementMessage =
  "Clerk exige React Router, TanStack Router, TanStack Start, Next.js ou React Native";
const convexBetterAuthSupportedWebFrontends = [
  "react-router",
  "tanstack-router",
  "tanstack-start",
  "next",
] as const;
const convexBetterAuthSupportedNativeFrontends = [
  "native-bare",
  "native-uniwind",
  "native-unistyles",
] as const;

const hasConvexBetterAuthCompatibleFrontend = (webFrontend: string[], nativeFrontend: string[]) =>
  webFrontend.some((f) => includesValue(convexBetterAuthSupportedWebFrontends, f)) ||
  nativeFrontend.some((f) => includesValue(convexBetterAuthSupportedNativeFrontends, f));

const convexBetterAuthFrontendRequirementMessage =
  "Better-Auth com Convex exige React Router, TanStack Router, TanStack Start, Next.js ou React Native";

export const hasClerkCompatibleFrontend = (webFrontend: string[], nativeFrontend: string[]) =>
  webFrontend.some((f) =>
    ["react-router", "tanstack-router", "tanstack-start", "next"].includes(f),
  ) ||
  nativeFrontend.some((f) => ["native-bare", "native-uniwind", "native-unistyles"].includes(f));

export const hasClerkCompatibleBackend = (backend: string) =>
  includesValue(clerkSupportedBackends, backend);

const isSelfHostedFullstackBackend = (backend: string) => backend === "self";

const getWebFrontends = (stack: Pick<StackState, "frontend">) =>
  getFrontendSelection(stack.frontend, "webFrontend");

const getNativeFrontends = (stack: Pick<StackState, "frontend">) =>
  getFrontendSelection(stack.frontend, "nativeFrontend");

const hasStaticDesktopCompatibleBackend = (backend: string) =>
  !isSelfHostedFullstackBackend(backend);

const backendCapabilityMessages = {
  "api-unsupported": "A camada de API selecionada não é compatível com este backend",
  "auth-unsupported": "O provedor de autenticação selecionado não é compatível com este backend",
  "database-unsupported": "O banco de dados selecionado não é compatível com este backend",
  "orm-unsupported": "O ORM selecionado não é compatível com este backend",
  "example-ai-unsupported": "O exemplo de IA não é compatível com este backend",
  "payments-unsupported": "Integrações de pagamento não são compatíveis com este backend",
} as const;

function getSelectedBackendCapabilityIssue(
  stack: StackState,
  category: keyof typeof TECH_OPTIONS,
  optionId: string,
) {
  if (category === "backend") return null;

  return getBackendCompatibilityIssue({
    backend: stack.backend,
    api: category === "api" ? optionId : undefined,
    auth: category === "auth" ? optionId : undefined,
    database: category === "database" ? optionId : undefined,
    orm: category === "orm" ? optionId : undefined,
    examples: category === "examples" && optionId === "ai" ? [optionId] : undefined,
    payments: category === "payments" && optionId !== "none" ? [optionId] : undefined,
  });
}

export const hasTauriCompatibleFrontend = (webFrontend: string[], backend = "") =>
  hasStaticDesktopCompatibleBackend(backend) && webFrontend.some(isDesktopWebFrontend);

export const hasElectrobunCompatibleFrontend = (webFrontend: string[], backend = "") =>
  hasStaticDesktopCompatibleBackend(backend) && webFrontend.some(isDesktopWebFrontend);

export const hasPlaywrightCompatibleFrontend = (webFrontend: string[]) =>
  webFrontend.some(isDesktopWebFrontend);

// Mirrors the CLI rule: Tauri static exports can't bundle Convex Better Auth on these frontends
const tauriStaticExportFrontends = ["next", "tanstack-start"] as const;

export const isTauriBlockedByConvexBetterAuth = (
  webFrontend: string[],
  backend: string,
  auth: string,
) =>
  backend === "convex" &&
  auth === "better-auth" &&
  webFrontend.some((f) => (tauriStaticExportFrontends as readonly string[]).includes(f));

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  webFrontend: "Web",
  nativeFrontend: "Nativo",
  backend: "Backend",
  runtime: "Runtime",
  api: "API",
  database: "Banco de dados",
  orm: "ORM",
  dbSetup: "Config. do banco",
  webDeploy: "Deploy web",
  serverDeploy: "Deploy do servidor",
  auth: "Auth",
  payments: "Pagamentos",
  observability: "Observabilidade",
  communication: "Comunicação",
  packageManager: "Package Manager",
  addons: "Add-ons",
  testing: "Testes",
  examples: "Exemplos",
  git: "Git",
  install: "Instalação",
};

export const getCategoryDisplayName = (categoryKey: string): string => {
  if (CATEGORY_DISPLAY_NAMES[categoryKey]) {
    return CATEGORY_DISPLAY_NAMES[categoryKey];
  }
  const result = categoryKey.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

interface CompatibilityResult {
  adjustedStack: StackState | null;
  notes: Record<string, { notes: string[]; hasIssue: boolean }>;
  changes: Array<{ category: string; message: string }>;
}

/**
 * Analyzes the stack and auto-adjusts incompatible selections.
 * This follows the CLI approach: when you make a selection, dependent items adjust automatically.
 * The flow is: frontend -> backend -> runtime -> database -> orm -> api -> auth -> etc.
 */
export const analyzeStackCompatibility = (stack: StackState): CompatibilityResult => {
  // Skip all validation if YOLO mode is enabled
  if (stack.yolo) {
    return {
      adjustedStack: null,
      notes: {},
      changes: [],
    };
  }

  const nextStack = { ...stack };
  let changed = false;
  const notes: CompatibilityResult["notes"] = {};
  const changes: Array<{ category: string; message: string }> = [];
  const valuesEqual = (left: unknown, right: unknown) =>
    Array.isArray(left) && Array.isArray(right)
      ? left.length === right.length && left.every((value, index) => value === right[index])
      : left === right;
  const setAdjustment = <K extends keyof StackState>(
    key: K,
    value: StackState[K],
    category: string,
    message: string,
  ) => {
    if (valuesEqual(nextStack[key], value)) return;
    nextStack[key] = value;
    changed = true;
    changes.push({ category, message });
  };

  for (const cat of CATEGORY_ORDER) {
    notes[cat] = { notes: [], hasIssue: false };
  }

  if (nextStack.backend === "convex") {
    // Convex handles its own runtime, database, orm, api, dbSetup
    setAdjustment(
      "runtime",
      "none",
      "backend",
      "Runtime definido como 'none' (o Convex fornece isso)",
    );
    setAdjustment(
      "database",
      "none",
      "backend",
      "Banco de dados definido como 'none' (o Convex fornece isso)",
    );
    setAdjustment("orm", "none", "backend", "ORM definido como 'none' (o Convex fornece isso)");
    setAdjustment("api", "none", "backend", "API definido como 'none' (o Convex fornece isso)");
    setAdjustment(
      "dbSetup",
      "none",
      "backend",
      "Config. do banco definido como 'none' (o Convex fornece isso)",
    );
    setAdjustment(
      "serverDeploy",
      "none",
      "backend",
      "Deploy do servidor definido como 'none' (o Convex fornece isso)",
    );
    setAdjustment("payments", [], "backend", "Pagamentos definido como '' (o Convex fornece isso)");

    // Remove incompatible web frontends while preserving native frontends.
    const webFrontends = getWebFrontends(nextStack);
    if (webFrontends.includes("solid") || webFrontends.includes("astro")) {
      nextStack.frontend = nextStack.frontend.filter(
        (frontend) => frontend !== "solid" && frontend !== "astro",
      );
      if (getWebFrontends(nextStack).length === 0 && getNativeFrontends(nextStack).length === 0) {
        nextStack.frontend = ["none"];
      }
      changed = true;
      changes.push({ category: "backend", message: "Solid removido (incompatível com Convex)" });
    }

    // Remove AI example if incompatible frontends are selected (Convex AI only supports React-based frontends)
    if (nextStack.examples.includes("ai")) {
      const hasIncompatibleFrontend = getWebFrontends(nextStack).some((f) =>
        ["solid", "svelte", "nuxt"].includes(f),
      );
      if (hasIncompatibleFrontend) {
        nextStack.examples = nextStack.examples.filter((e) => e !== "ai");
        if (nextStack.examples.length === 0) nextStack.examples = ["none"];
        changed = true;
        changes.push({
          category: "examples",
          message: "Exemplo de IA removido (Convex AI só suporta frontends baseados em React)",
        });
      }
    }

    // Auth constraints for Convex
    if (nextStack.auth === "clerk") {
      if (!hasClerkCompatibleFrontend(getWebFrontends(nextStack), getNativeFrontends(nextStack))) {
        nextStack.auth = "none";
        changed = true;
        changes.push({
          category: "auth",
          message: `Auth definido como 'Nenhum' (${clerkFrontendRequirementMessage})`,
        });
      }
    }

    if (nextStack.auth === "better-auth") {
      if (
        !hasConvexBetterAuthCompatibleFrontend(
          getWebFrontends(nextStack),
          getNativeFrontends(nextStack),
        )
      ) {
        nextStack.auth = "none";
        changed = true;
        changes.push({
          category: "auth",
          message: "Auth definido como 'Nenhum' (Better-Auth com Convex exige frontend compatível)",
        });
      }
    }
  }

  if (nextStack.backend === "none") {
    // No backend means no runtime, database, orm, api, auth, dbSetup, serverDeploy
    setAdjustment("runtime", "none", "backend", "Runtime definido como 'none' (sem backend)");
    setAdjustment(
      "database",
      "none",
      "backend",
      "Banco de dados definido como 'none' (sem backend)",
    );
    setAdjustment("orm", "none", "backend", "ORM definido como 'none' (sem backend)");
    setAdjustment("api", "none", "backend", "API definido como 'none' (sem backend)");
    setAdjustment("auth", "none", "backend", "Auth definido como 'none' (sem backend)");
    setAdjustment(
      "dbSetup",
      "none",
      "backend",
      "Config. do banco definido como 'none' (sem backend)",
    );
    setAdjustment(
      "serverDeploy",
      "none",
      "backend",
      "Deploy do servidor definido como 'none' (sem backend)",
    );
    setAdjustment("payments", [], "backend", "Pagamentos definido como '' (sem backend)");
    setAdjustment(
      "communication",
      "none",
      "backend",
      "Comunicação definido como 'none' (sem backend)",
    );

    // Clear examples
    if (
      nextStack.examples.length > 0 &&
      !(nextStack.examples.length === 1 && nextStack.examples[0] === "none")
    ) {
      nextStack.examples = ["none"];
      changed = true;
      changes.push({ category: "backend", message: "Exemplos limpos (sem backend)" });
    }
  }

  // Self (fullstack) backend constraints
  if (isSelfHostedFullstackBackend(nextStack.backend)) {
    // Fullstack uses frontend's API routes, no separate runtime needed
    if (nextStack.runtime !== "none") {
      nextStack.runtime = "none";
      changed = true;
      changes.push({
        category: "backend",
        message: "Runtime definido como 'Nenhum' (fullstack usa as rotas de API do frontend)",
      });
    }
    if (nextStack.serverDeploy !== "none") {
      nextStack.serverDeploy = "none";
      changed = true;
      changes.push({
        category: "backend",
        message: "Deploy do servidor definido como 'Nenhum' (fullstack usa o deploy do frontend)",
      });
    }
  }

  // Workers runtime requires Hono backend
  if (nextStack.runtime === "workers" && nextStack.backend !== "hono") {
    nextStack.backend = "hono";
    changed = true;
    changes.push({
      category: "runtime",
      message: "Backend definido como 'Hono' (necessário para Workers)",
    });
  }

  // Workers runtime requires server deployment
  if (nextStack.runtime === "workers" && nextStack.serverDeploy === "none") {
    nextStack.serverDeploy = "cloudflare";
    changed = true;
    changes.push({
      category: "runtime",
      message: "Deploy do servidor definido como 'Cloudflare' (necessário para Workers)",
    });
  }

  // Workers runtime is incompatible with MongoDB
  if (nextStack.runtime === "workers" && nextStack.database === "mongodb") {
    nextStack.database = "sqlite";
    nextStack.orm = "drizzle";
    nextStack.dbSetup = "d1";
    changed = true;
    changes.push({
      category: "runtime",
      message: "Banco alterado para SQLite com D1 (MongoDB incompatível com Workers)",
    });
  }

  // Runtime "none" only for Convex, no backend, or self-hosted fullstack backends.
  if (
    nextStack.runtime === "none" &&
    nextStack.backend !== "convex" &&
    nextStack.backend !== "none" &&
    !isSelfHostedFullstackBackend(nextStack.backend)
  ) {
    nextStack.runtime = DEFAULT_STACK.runtime;
    changed = true;
    changes.push({
      category: "runtime",
      message: `Runtime definido como '${DEFAULT_STACK.runtime}' (necessário para este backend)`,
    });
  }

  // Skip if backend doesn't use database
  if (nextStack.backend !== "convex" && nextStack.backend !== "none") {
    // If database is none, ORM and dbSetup must be none
    if (nextStack.database === "none") {
      if (nextStack.orm !== "none") {
        nextStack.orm = "none";
        changed = true;
        changes.push({
          category: "database",
          message: "ORM definido como 'Nenhum' (nenhum banco selecionado)",
        });
      }
      if (nextStack.dbSetup !== "none") {
        nextStack.dbSetup = "none";
        changed = true;
        changes.push({
          category: "database",
          message: "Config. do banco definida como 'Nenhum' (nenhum banco selecionado)",
        });
      }
    }

    // MongoDB requires Prisma or Mongoose
    if (nextStack.database === "mongodb") {
      if (nextStack.orm !== "prisma" && nextStack.orm !== "mongoose") {
        nextStack.orm = "prisma";
        changed = true;
        changes.push({
          category: "database",
          message: "ORM definido como 'Prisma' (necessário para MongoDB)",
        });
      }
      // MongoDB only works with mongodb-atlas or none for dbSetup
      if (
        nextStack.dbSetup !== "mongodb-atlas" &&
        nextStack.dbSetup !== "none" &&
        nextStack.dbSetup !== "docker"
      ) {
        nextStack.dbSetup = "none";
        changed = true;
        changes.push({
          category: "database",
          message: "Config. do banco definida como 'Nenhum' (incompatível com MongoDB)",
        });
      }
    }

    // Relational databases (sqlite, postgres, mysql) need Drizzle or Prisma
    if (["sqlite", "postgres", "mysql"].includes(nextStack.database)) {
      if (nextStack.orm === "none") {
        nextStack.orm = "drizzle";
        changed = true;
        changes.push({
          category: "database",
          message: "ORM definido como 'Drizzle' (necessário para o banco)",
        });
      }
      if (nextStack.orm === "mongoose") {
        nextStack.orm = "drizzle";
        changed = true;
        changes.push({
          category: "database",
          message: "ORM definido como 'Drizzle' (Mongoose só funciona com MongoDB)",
        });
      }
    }

    // ORM selected but no database - select appropriate database
    if (nextStack.orm !== "none" && nextStack.database === "none") {
      if (nextStack.orm === "mongoose") {
        nextStack.database = "mongodb";
        changed = true;
        changes.push({
          category: "orm",
          message: "Banco definido como 'MongoDB' (necessário para Mongoose)",
        });
      } else {
        nextStack.database = "sqlite";
        changed = true;
        changes.push({
          category: "orm",
          message: "Banco definido como 'SQLite' (necessário para o ORM)",
        });
      }
    }

    // DB Setup constraints
    if (nextStack.dbSetup === "turso" && nextStack.database !== "sqlite") {
      nextStack.database = "sqlite";
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'SQLite' (necessário para Turso)",
      });
    }
    if (nextStack.dbSetup === "d1") {
      if (nextStack.database !== "sqlite") {
        nextStack.database = "sqlite";
        changed = true;
        changes.push({
          category: "dbSetup",
          message: "Banco definido como 'SQLite' (necessário para D1)",
        });
      }
      if (isSelfHostedFullstackBackend(nextStack.backend)) {
        if (nextStack.webDeploy !== "cloudflare") {
          nextStack.webDeploy = "cloudflare";
          changed = true;
          changes.push({
            category: "dbSetup",
            message:
              "Deploy web definido como 'Cloudflare' (necessário para D1 com backend fullstack)",
          });
        }
      } else {
        if (nextStack.runtime !== "workers" || nextStack.backend !== "hono") {
          nextStack.runtime = "workers";
          nextStack.backend = "hono";
          changed = true;
          changes.push({
            category: "dbSetup",
            message: "Runtime definido como 'Workers' com 'Hono' (necessário para D1)",
          });
        }
        if (nextStack.serverDeploy !== "cloudflare") {
          nextStack.serverDeploy = "cloudflare";
          changed = true;
          changes.push({
            category: "dbSetup",
            message:
              "Deploy do servidor definido como 'Cloudflare' (necessário para D1 com Workers)",
          });
        }
      }
    }
    if (nextStack.dbSetup === "neon" && nextStack.database !== "postgres") {
      nextStack.database = "postgres";
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'PostgreSQL' (necessário para Neon)",
      });
    }
    if (nextStack.dbSetup === "supabase" && nextStack.database !== "postgres") {
      nextStack.database = "postgres";
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'PostgreSQL' (necessário para Supabase)",
      });
    }
    if (nextStack.dbSetup === "prisma-postgres" && nextStack.database !== "postgres") {
      nextStack.database = "postgres";
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'PostgreSQL' (necessário para Prisma Postgres)",
      });
    }
    if (nextStack.dbSetup === "mongodb-atlas" && nextStack.database !== "mongodb") {
      nextStack.database = "mongodb";
      if (nextStack.orm !== "prisma" && nextStack.orm !== "mongoose") {
        nextStack.orm = "prisma";
      }
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'MongoDB' (necessário para MongoDB Atlas)",
      });
    }
    if (
      nextStack.dbSetup === "planetscale" &&
      nextStack.database !== "postgres" &&
      nextStack.database !== "mysql"
    ) {
      nextStack.database = "postgres";
      changed = true;
      changes.push({
        category: "dbSetup",
        message: "Banco definido como 'PostgreSQL' (necessário para PlanetScale)",
      });
    }
    if (nextStack.dbSetup === "docker") {
      if (nextStack.database === "sqlite") {
        nextStack.dbSetup = "none";
        changed = true;
        changes.push({
          category: "dbSetup",
          message: "Config. do banco definida como 'Nenhum' (SQLite não precisa de Docker)",
        });
      }
      if (nextStack.runtime === "workers") {
        nextStack.dbSetup = "d1";
        changed = true;
        changes.push({
          category: "dbSetup",
          message: "Config. do banco definida como 'D1' (Docker incompatível com Workers)",
        });
      }
    }
  }

  if (nextStack.backend !== "convex" && nextStack.backend !== "none") {
    // Nuxt, Svelte, Solid, Astro require oRPC (not tRPC)
    const needsOrpc = getWebFrontends(nextStack).some((f) =>
      ["nuxt", "svelte", "solid", "astro"].includes(f),
    );
    if (needsOrpc && nextStack.api === "trpc") {
      nextStack.api = "orpc";
      changed = true;
      changes.push({
        category: "api",
        message: "API definida como 'oRPC' (necessária para este frontend)",
      });
    }
  }

  if (nextStack.auth === "clerk") {
    if (!hasClerkCompatibleBackend(nextStack.backend)) {
      nextStack.auth = "none";
      changed = true;
      changes.push({
        category: "auth",
        message: `Auth definido como 'Nenhum' (${clerkBackendRequirementMessage})`,
      });
    } else if (
      !hasClerkCompatibleFrontend(getWebFrontends(nextStack), getNativeFrontends(nextStack))
    ) {
      nextStack.auth = "none";
      changed = true;
      changes.push({
        category: "auth",
        message: `Auth definido como 'Nenhum' (${clerkFrontendRequirementMessage})`,
      });
    }
  }

  const compatiblePayments = nextStack.payments.filter(
    (provider) =>
      getPaymentCompatibilityIssue({
        provider,
        backend: nextStack.backend,
        frontends: [...getWebFrontends(nextStack), ...getNativeFrontends(nextStack)],
        database: nextStack.database,
        orm: nextStack.orm,
      }) === null,
  );
  if (compatiblePayments.length !== nextStack.payments.length) {
    nextStack.payments = compatiblePayments;
    changed = true;
    changes.push({
      category: "payments",
      message: "Providers de pagamento incompatíveis foram removidos",
    });
  }

  const pwaCompat = hasPWACompatibleFrontend(getWebFrontends(nextStack));
  const tauriCompat = hasTauriCompatibleFrontend(getWebFrontends(nextStack), nextStack.backend);
  const electrobunCompat = hasElectrobunCompatibleFrontend(
    getWebFrontends(nextStack),
    nextStack.backend,
  );

  if (!pwaCompat && nextStack.addons.includes("pwa")) {
    nextStack.addons = nextStack.addons.filter((a) => a !== "pwa");
    if (nextStack.addons.length === 0) nextStack.addons = ["none"];
    changed = true;
    changes.push({ category: "addons", message: "PWA removido (exige frontend compatível)" });
  }
  if (!tauriCompat && nextStack.addons.includes("tauri")) {
    nextStack.addons = nextStack.addons.filter((a) => a !== "tauri");
    if (nextStack.addons.length === 0) nextStack.addons = ["none"];
    changed = true;
    changes.push({
      category: "addons",
      message: isSelfHostedFullstackBackend(nextStack.backend)
        ? "Tauri removido (exige um backend separado ou nenhum backend)"
        : "Tauri removido (exige frontend compatível)",
    });
  }
  if (
    nextStack.addons.includes("tauri") &&
    isTauriBlockedByConvexBetterAuth(getWebFrontends(nextStack), nextStack.backend, nextStack.auth)
  ) {
    nextStack.addons = nextStack.addons.filter((a) => a !== "tauri");
    if (nextStack.addons.length === 0) nextStack.addons = ["none"];
    changed = true;
    changes.push({
      category: "addons",
      message: "Tauri removido (incompatível com Convex Better Auth no Next.js/TanStack Start)",
    });
  }
  if (!electrobunCompat && nextStack.addons.includes("electrobun")) {
    nextStack.addons = nextStack.addons.filter((a) => a !== "electrobun");
    if (nextStack.addons.length === 0) nextStack.addons = ["none"];
    changed = true;
    changes.push({
      category: "addons",
      message: isSelfHostedFullstackBackend(nextStack.backend)
        ? "Electrobun removido (exige um backend separado ou nenhum backend)"
        : "Electrobun removido (exige frontend compatível)",
    });
  }

  const playwrightCompat = hasPlaywrightCompatibleFrontend(getWebFrontends(nextStack));

  if (!playwrightCompat && nextStack.testing.includes("playwright")) {
    nextStack.testing = nextStack.testing.filter((a) => a !== "playwright");
    if (nextStack.testing.length === 0) nextStack.testing = ["none"];
    changed = true;
    changes.push({
      category: "testing",
      message: "Playwright removido (exige frontend compatível)",
    });
  }

  // Todo example requires database AND API (unless Convex)
  if (nextStack.examples.includes("todo") && nextStack.backend !== "convex") {
    const needsRemoval = nextStack.database === "none" || nextStack.api === "none";
    if (needsRemoval) {
      const reason = nextStack.database === "none" ? "exige banco de dados" : "exige camada de API";
      nextStack.examples = nextStack.examples.filter((e) => e !== "todo");
      if (nextStack.examples.length === 0) nextStack.examples = ["none"];
      changed = true;
      changes.push({ category: "examples", message: `Todo removido (${reason})` });
    }
  }

  // AI example constraints
  if (nextStack.examples.includes("ai")) {
    // Solid and Astro frontends are incompatible with the AI example
    if (
      getWebFrontends(nextStack).includes("solid") ||
      getWebFrontends(nextStack).includes("astro")
    ) {
      nextStack.examples = nextStack.examples.filter((e) => e !== "ai");
      if (nextStack.examples.length === 0) nextStack.examples = ["none"];
      changed = true;
      changes.push({
        category: "examples",
        message: "IA removida (incompatível com frontend Solid ou Astro)",
      });
    }
    // Convex AI only supports React-based frontends (not Svelte/Nuxt)
    if (nextStack.backend === "convex") {
      const hasIncompatibleFrontend = getWebFrontends(nextStack).some((f) =>
        ["svelte", "nuxt"].includes(f),
      );
      if (hasIncompatibleFrontend) {
        nextStack.examples = nextStack.examples.filter((e) => e !== "ai");
        if (nextStack.examples.length === 0) nextStack.examples = ["none"];
        changed = true;
        changes.push({
          category: "examples",
          message: "IA removida (Convex AI só suporta frontends baseados em React)",
        });
      }
    }
  }

  // Web deploy requires web frontend
  if (nextStack.webDeploy !== "none" && getWebFrontends(nextStack).every((f) => f === "none")) {
    nextStack.webDeploy = "none";
    changed = true;
    changes.push({
      category: "webDeploy",
      message: "Deploy web definido como 'Nenhum' (sem frontend web)",
    });
  }

  // Server deploy constraints
  if (nextStack.serverDeploy === "cloudflare") {
    if (nextStack.runtime !== "workers" || nextStack.backend !== "hono") {
      nextStack.serverDeploy = "none";
      changed = true;
      changes.push({
        category: "serverDeploy",
        message: "Deploy do servidor definido como 'Nenhum' (Cloudflare exige Workers + Hono)",
      });
    }
  }

  if (nextStack.serverDeploy === "docker" && nextStack.runtime === "workers") {
    nextStack.serverDeploy = "cloudflare";
    changed = true;
    changes.push({
      category: "serverDeploy",
      message:
        "Deploy do servidor definido como 'Cloudflare' (runtime Workers faz deploy via Cloudflare)",
    });
  }

  if (
    ["vercel", "railway", "guaracloud"].includes(nextStack.serverDeploy) &&
    nextStack.runtime === "workers"
  ) {
    nextStack.serverDeploy = "cloudflare";
    changed = true;
    changes.push({
      category: "serverDeploy",
      message:
        "Deploy do servidor definido como 'Cloudflare' (runtime Workers faz deploy via Cloudflare)",
    });
  }

  if (
    nextStack.serverDeploy !== "none" &&
    (["none", "convex"].includes(nextStack.backend) ||
      isSelfHostedFullstackBackend(nextStack.backend))
  ) {
    nextStack.serverDeploy = "none";
    changed = true;
    changes.push({
      category: "serverDeploy",
      message: "Deploy do servidor definido como 'Nenhum' (não é necessário para este backend)",
    });
  }

  const backendCapabilityIssue = getBackendCompatibilityIssue({
    backend: nextStack.backend,
    api: nextStack.api,
    auth: nextStack.auth,
    database: nextStack.database,
    orm: nextStack.orm,
    examples: nextStack.examples,
    payments: nextStack.payments,
  });

  if (backendCapabilityIssue === "api-unsupported") {
    setAdjustment(
      "api",
      "none",
      "backend",
      "API definida como 'Nenhuma' (a camada selecionada não é compatível com este backend)",
    );
  }

  if (nextStack.backend === "nestjs") {
    setAdjustment(
      "api",
      "none",
      "backend",
      "API definida como 'Nenhuma' (NestJS ainda não possui uma camada de API suportada)",
    );
    if (nextStack.auth !== "better-auth" && nextStack.auth !== "none") {
      setAdjustment(
        "auth",
        "none",
        "backend",
        "Auth definido como 'Nenhum' (NestJS suporta Better Auth ou nenhum auth)",
      );
    }
    if (nextStack.database !== "none" && nextStack.database !== "postgres") {
      if (["turso", "d1", "mongodb-atlas"].includes(nextStack.dbSetup)) {
        setAdjustment(
          "dbSetup",
          "none",
          "backend",
          "Config. do banco definida como 'Nenhuma' (incompatível com PostgreSQL no NestJS)",
        );
      }
      setAdjustment(
        "database",
        "postgres",
        "backend",
        "Banco definido como 'PostgreSQL' (NestJS suporta PostgreSQL)",
      );
    }
    if (nextStack.orm !== "none" && nextStack.orm !== "prisma") {
      setAdjustment(
        "orm",
        "prisma",
        "backend",
        "ORM definido como 'Prisma' (NestJS suporta Prisma)",
      );
    }
    if (nextStack.examples.includes("ai")) {
      const examples = nextStack.examples.filter((example) => example !== "ai");
      setAdjustment(
        "examples",
        examples.length > 0 ? examples : ["none"],
        "backend",
        "Exemplo de IA removido (não é suportado com NestJS)",
      );
    }
    if (nextStack.payments.length > 0) {
      setAdjustment(
        "payments",
        [],
        "backend",
        "Providers de pagamento removidos (não são suportados com NestJS)",
      );
    }
  }

  return {
    adjustedStack: changed ? nextStack : null,
    notes,
    changes,
  };
};

const COMMUNICATION_PRODUCT_NAME = {
  resend: "Resend",
  notifique: "Notifique",
  arara: "AraraHQ",
} satisfies Record<CommunicationProvider, string>;

/**
 * Returns a reason why an option is disabled, or null if it's enabled.
 *
 * PHILOSOPHY: Only disable options that are TRULY incompatible.
 * - Don't create circular dependencies
 * - Allow users to select options that will trigger auto-adjustments
 * - Follow CLI behavior: filter options based on UPSTREAM selections only
 */
export const getDisabledReason = (
  currentStack: StackState,
  category: keyof typeof TECH_OPTIONS,
  optionId: string,
): string | null => {
  if (currentStack.backend === "convex") {
    if (category === "runtime" && optionId !== "none") {
      return "O Convex fornece o próprio runtime";
    }
    if (category === "database" && optionId !== "none") {
      return "O Convex fornece o próprio banco de dados";
    }
    if (category === "orm" && optionId !== "none") {
      return "O Convex tem acesso a dados embutido";
    }
    if (category === "api" && optionId !== "none") {
      return "O Convex fornece a própria camada de API";
    }
    if (category === "dbSetup" && optionId !== "none") {
      return "O Convex cuida da configuração do banco";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "O Convex tem o próprio deploy";
    }
    if (category === "auth" && optionId === "better-auth") {
      if (
        !hasConvexBetterAuthCompatibleFrontend(
          getWebFrontends(currentStack),
          getNativeFrontends(currentStack),
        )
      ) {
        return convexBetterAuthFrontendRequirementMessage;
      }
    }
    if (category === "webFrontend" && (optionId === "solid" || optionId === "astro")) {
      return `${optionId.charAt(0).toUpperCase() + optionId.slice(1)} não é compatível com Convex`;
    }
    if (category === "examples" && optionId === "ai") {
      const hasIncompatibleFrontend = getWebFrontends(currentStack).some((f) =>
        ["solid", "svelte", "nuxt"].includes(f),
      );
      if (hasIncompatibleFrontend) {
        const frontendName = getWebFrontends(currentStack).find((f) =>
          ["solid", "svelte", "nuxt"].includes(f),
        );
        return `O exemplo de IA do Convex só suporta frontends baseados em React (não ${frontendName})`;
      }
    }
  }

  if (currentStack.backend === "none") {
    if (category === "runtime" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "database" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "orm" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "api" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "auth" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "dbSetup" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "payments" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
    if (category === "examples" && optionId !== "none") {
      return "Nenhum backend selecionado";
    }
  }

  if (isSelfHostedFullstackBackend(currentStack.backend)) {
    const frontend = getSelfHostedFrontend(currentStack.frontend);
    const frontendLabel = frontend ? selfHostedFrontendLabels[frontend] : "um frontend compatível";
    if (category === "runtime" && optionId !== "none") {
      return `${frontendLabel} fullstack usa rotas de API nativas`;
    }
    if (category === "webFrontend" && frontend && optionId !== frontend) {
      return selfHostedFrontendMessages[frontend];
    }
    if (category === "webFrontend" && !frontend && optionId !== "none") {
      return "Fullstack self exige Next.js, TanStack Start, Nuxt, SvelteKit ou Astro";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
    const apiMessage = frontend ? selfHostedFrontendApiMessages[frontend] : undefined;
    if (category === "api" && optionId === "trpc" && apiMessage) {
      return apiMessage;
    }
  }

  if (category === "backend") {
    if (optionId === "self" && !getSelfHostedFrontend(currentStack.frontend)) {
      return "Fullstack self exige Next.js, TanStack Start, Nuxt, SvelteKit ou Astro";
    }
    if (
      optionId === "convex" &&
      (getWebFrontends(currentStack).includes("solid") ||
        getWebFrontends(currentStack).includes("astro"))
    ) {
      const incompatible = getWebFrontends(currentStack).includes("solid") ? "Solid" : "Astro";
      return `Convex não é compatível com ${incompatible}`;
    }
    // Workers runtime only works with Hono backend
    if (currentStack.runtime === "workers" && optionId !== "hono" && optionId !== "none") {
      return "O runtime Workers só funciona com Hono";
    }
  }

  if (category === "runtime") {
    if (optionId === "workers" && currentStack.backend !== "hono") {
      return "Workers exige backend Hono";
    }
    if (optionId === "none") {
      if (
        currentStack.backend !== "convex" &&
        currentStack.backend !== "none" &&
        !isSelfHostedFullstackBackend(currentStack.backend)
      ) {
        return "Runtime 'Nenhum' só para backends Convex ou fullstack";
      }
    }
  }

  if (category === "database") {
    if (optionId === "mongodb" && currentStack.runtime === "workers") {
      return "MongoDB não é compatível com o runtime Workers";
    }
    // Allow all databases when ORM is none - system will auto-select ORM
  }

  if (category === "orm") {
    if (optionId === "mongoose") {
      if (currentStack.runtime === "workers") {
        return "Mongoose exige MongoDB, que é incompatível com Workers";
      }
      // Only block if a non-MongoDB database is EXPLICITLY selected
      if (currentStack.database !== "none" && currentStack.database !== "mongodb") {
        return "Mongoose só funciona com MongoDB";
      }
      // Allow when database is "none" - system will auto-select MongoDB
    }
    if (optionId === "drizzle" && currentStack.database === "mongodb") {
      return "Drizzle não suporta MongoDB";
    }
    if (optionId === "none" && currentStack.database !== "none") {
      return "O banco exige um ORM";
    }
  }

  if (category === "dbSetup" && optionId !== "none") {
    if (currentStack.database === "none") {
      return "Selecione um banco de dados primeiro";
    }

    // Database-specific setups
    if (optionId === "turso" && currentStack.database !== "sqlite") {
      return "Turso exige SQLite";
    }
    if (optionId === "d1") {
      if (currentStack.database !== "sqlite") return "D1 exige SQLite";
      if (
        currentStack.runtime !== "workers" &&
        !isSelfHostedFullstackBackend(currentStack.backend)
      ) {
        return "D1 exige runtime Cloudflare Workers ou um backend fullstack self";
      }
    }
    if (optionId === "neon" && currentStack.database !== "postgres") {
      return "Neon exige PostgreSQL";
    }
    if (optionId === "supabase" && currentStack.database !== "postgres") {
      return "Supabase exige PostgreSQL";
    }
    if (optionId === "prisma-postgres" && currentStack.database !== "postgres") {
      return "Prisma Postgres exige PostgreSQL";
    }
    if (optionId === "mongodb-atlas" && currentStack.database !== "mongodb") {
      return "MongoDB Atlas exige MongoDB";
    }
    if (
      optionId === "planetscale" &&
      currentStack.database !== "postgres" &&
      currentStack.database !== "mysql"
    ) {
      return "PlanetScale exige PostgreSQL ou MySQL";
    }
    if (optionId === "docker") {
      if (currentStack.database === "sqlite") return "SQLite não precisa de Docker";
      if (currentStack.runtime === "workers") return "Docker é incompatível com Workers";
    }
  }

  if (category === "api" && optionId === "trpc") {
    const needsOrpc = getWebFrontends(currentStack).some((f) =>
      ["nuxt", "svelte", "solid", "astro"].includes(f),
    );
    if (needsOrpc) {
      const frontendName = getWebFrontends(currentStack).find((f) =>
        ["nuxt", "svelte", "solid", "astro"].includes(f),
      );
      return `${frontendName} exige oRPC, não tRPC`;
    }
  }

  if (category === "auth") {
    if (optionId === "clerk") {
      if (!hasClerkCompatibleBackend(currentStack.backend)) {
        return clerkBackendRequirementMessage;
      }
      if (
        !hasClerkCompatibleFrontend(getWebFrontends(currentStack), getNativeFrontends(currentStack))
      ) {
        return clerkFrontendRequirementMessage;
      }
    }
  }

  if (category === "payments") {
    const issue = getPaymentCompatibilityIssue({
      provider: optionId,
      backend: currentStack.backend,
      frontends: [...getWebFrontends(currentStack), ...getNativeFrontends(currentStack)],
      database: currentStack.database,
      orm: currentStack.orm,
    });
    if (issue === "convex-unsupported") {
      return optionId === "stripe"
        ? "Stripe não é suportado com Convex"
        : "AbacatePay não é suportado com Convex";
    }
    if (issue === "requires-web-frontend") {
      return optionId === "stripe"
        ? "Stripe exige um frontend web"
        : "AbacatePay exige um frontend web";
    }
    if (issue === "native-only-unsupported") {
      return optionId === "stripe"
        ? "Stripe v1 não suporta apps com frontend nativo"
        : "AbacatePay v1 não suporta apps com frontend nativo";
    }
    if (issue === "sql-database-required")
      return "AbacatePay v1 exige um banco SQL com Prisma ou Drizzle";
  }

  if (category === "communication" && isCommunicationProvider(optionId)) {
    const issue = getCommunicationCompatibilityIssue({
      provider: optionId,
      backend: currentStack.backend,
      runtime: currentStack.runtime,
      serverDeploy: currentStack.serverDeploy,
    });
    const messages = {
      "requires-backend": `${COMMUNICATION_PRODUCT_NAME[optionId]} exige um backend com runtime de servidor`,
      "workers-unsupported":
        "AraraHQ exige o SDK Node e não é compatível com runtimes Edge/Workers. Use um servidor Node/Bun ou uma Node Action do Convex.",
    } satisfies Record<CommunicationCompatibilityIssue, string>;
    return issue ? messages[issue] : null;
  }

  if (category === "addons") {
    if (optionId === "pwa" && !hasPWACompatibleFrontend(getWebFrontends(currentStack))) {
      return "PWA exige TanStack Router, React Router, Solid ou Next.js";
    }
    if (
      optionId === "tauri" &&
      !hasTauriCompatibleFrontend(getWebFrontends(currentStack), currentStack.backend)
    ) {
      if (isSelfHostedFullstackBackend(currentStack.backend)) {
        return "Tauri exige um backend separado ou nenhum backend";
      }
      return "Tauri exige um frontend web";
    }
    if (
      optionId === "tauri" &&
      isTauriBlockedByConvexBetterAuth(
        getWebFrontends(currentStack),
        currentStack.backend,
        currentStack.auth,
      )
    ) {
      return "Tauri não é compatível com Convex Better Auth no Next.js ou TanStack Start";
    }
    if (
      optionId === "electrobun" &&
      !hasElectrobunCompatibleFrontend(getWebFrontends(currentStack), currentStack.backend)
    ) {
      if (isSelfHostedFullstackBackend(currentStack.backend)) {
        return "Electrobun exige um backend separado ou nenhum backend";
      }
      return "Electrobun exige um frontend web";
    }
    // Task runners are mutually exclusive in the CLI, but the builder lets users swap them.
    // URL/state sanitization keeps only the latest selected runner before generating commands.
  }

  if (category === "testing") {
    if (
      optionId === "playwright" &&
      !hasPlaywrightCompatibleFrontend(getWebFrontends(currentStack))
    ) {
      return "Playwright exige um frontend web";
    }
  }

  if (category === "examples") {
    if (optionId === "todo" && currentStack.backend !== "convex") {
      if (currentStack.database === "none") {
        return "O exemplo Todo exige um banco de dados";
      }
      if (currentStack.api === "none") {
        return "O exemplo Todo exige uma camada de API (tRPC ou oRPC)";
      }
    }
    if (optionId === "ai") {
      if (
        getWebFrontends(currentStack).includes("solid") ||
        getWebFrontends(currentStack).includes("astro")
      ) {
        return "Exemplo de IA incompatível com frontend Solid ou Astro";
      }
      if (currentStack.backend === "convex") {
        const hasIncompatibleFrontend = getWebFrontends(currentStack).some((f) =>
          ["svelte", "nuxt"].includes(f),
        );
        if (hasIncompatibleFrontend) {
          const frontendName = getWebFrontends(currentStack).find((f) =>
            ["svelte", "nuxt"].includes(f),
          );
          return `O exemplo de IA do Convex só suporta frontends baseados em React (não ${frontendName})`;
        }
      }
    }
  }

  if (category === "webDeploy" && optionId !== "none") {
    if (getWebFrontends(currentStack).every((f) => f === "none")) {
      return "Deploy web exige um frontend web";
    }
  }

  if (
    category === "webDeploy" &&
    currentStack.dbSetup === "d1" &&
    isSelfHostedFullstackBackend(currentStack.backend) &&
    optionId !== "cloudflare"
  ) {
    return "D1 com backend fullstack self exige deploy web na Cloudflare";
  }

  if (category === "serverDeploy") {
    if (optionId === "cloudflare") {
      if (currentStack.runtime !== "workers") return "Cloudflare exige runtime Workers";
      if (currentStack.backend !== "hono") return "Cloudflare exige backend Hono";
    }
    if (optionId === "docker" && currentStack.runtime === "workers") {
      return "Deploy de servidor com Docker exige runtime Bun ou Node";
    }
    const serverDeployRuntimeLabels: Record<string, string> = {
      docker: "com Docker",
      vercel: "na Vercel",
      railway: "na Railway",
      guaracloud: "na Guara Cloud",
    };
    const deploymentLabel = serverDeployRuntimeLabels[optionId];
    if (deploymentLabel && currentStack.runtime === "workers") {
      return `Deploy de servidor ${deploymentLabel} exige runtime Bun ou Node`;
    }
    if (optionId !== "none") {
      if (
        currentStack.backend === "none" ||
        currentStack.backend === "convex" ||
        isSelfHostedFullstackBackend(currentStack.backend)
      ) {
        return "Deploy do servidor não é necessário para este backend";
      }
    }
    if (optionId === "none" && currentStack.runtime === "workers") {
      return "Workers exige deploy do servidor";
    }
  }

  const backendCapabilityIssue = getSelectedBackendCapabilityIssue(
    currentStack,
    category,
    optionId,
  );
  if (backendCapabilityIssue) {
    return backendCapabilityMessages[backendCapabilityIssue];
  }

  return null;
};

export const isOptionCompatible = (
  currentStack: StackState,
  category: keyof typeof TECH_OPTIONS,
  optionId: string,
): boolean => {
  if (currentStack.yolo) {
    return true;
  }
  return getDisabledReason(currentStack, category, optionId) === null;
};
