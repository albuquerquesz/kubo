import { desktopWebFrontends } from "@kubojs/types";

import { DEFAULT_STACK, type StackState, type TECH_OPTIONS } from "@/lib/constant";
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

const clerkSupportedBackends = [
  "convex",
  "hono",
  "express",
  "fastify",
  "elysia",
  "self-next",
  "self-tanstack-start",
] as const;

const selfHostedFullstackBackends = [
  "self-next",
  "self-tanstack-start",
  "self-nuxt",
  "self-svelte",
  "self-astro",
] as const;

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
  webFrontend.some((f) =>
    convexBetterAuthSupportedWebFrontends.includes(
      f as (typeof convexBetterAuthSupportedWebFrontends)[number],
    ),
  ) ||
  nativeFrontend.some((f) =>
    convexBetterAuthSupportedNativeFrontends.includes(
      f as (typeof convexBetterAuthSupportedNativeFrontends)[number],
    ),
  );

const convexBetterAuthFrontendRequirementMessage =
  "Better-Auth com Convex exige React Router, TanStack Router, TanStack Start, Next.js ou React Native";

export const hasClerkCompatibleFrontend = (webFrontend: string[], nativeFrontend: string[]) =>
  webFrontend.some((f) =>
    ["react-router", "tanstack-router", "tanstack-start", "next"].includes(f),
  ) ||
  nativeFrontend.some((f) => ["native-bare", "native-uniwind", "native-unistyles"].includes(f));

export const hasClerkCompatibleBackend = (backend: string) =>
  clerkSupportedBackends.includes(backend as (typeof clerkSupportedBackends)[number]);

const isSelfHostedFullstackBackend = (backend: string) =>
  selfHostedFullstackBackends.includes(backend as (typeof selfHostedFullstackBackends)[number]);

const hasStaticDesktopCompatibleBackend = (backend: string) =>
  !isSelfHostedFullstackBackend(backend);

export const hasTauriCompatibleFrontend = (webFrontend: string[], backend = "") =>
  hasStaticDesktopCompatibleBackend(backend) &&
  webFrontend.some((f) => (desktopWebFrontends as readonly string[]).includes(f));

export const hasElectrobunCompatibleFrontend = (webFrontend: string[], backend = "") =>
  hasStaticDesktopCompatibleBackend(backend) &&
  webFrontend.some((f) => (desktopWebFrontends as readonly string[]).includes(f));

export const hasEvlogCompatibleBackend = (backend: string) =>
  ["hono", "express", "fastify", "elysia", ...selfHostedFullstackBackends].includes(backend);

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
  webFrontend: "Frontend web",
  nativeFrontend: "Frontend nativo",
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
  packageManager: "Gerenciador de pacotes",
  addons: "Complementos",
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
  if (stack.yolo === "true") {
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

  for (const cat of CATEGORY_ORDER) {
    notes[cat] = { notes: [], hasIssue: false };
  }

  // ============================================
  // BACKEND CONSTRAINTS
  // ============================================

  if (nextStack.backend === "convex") {
    // Convex handles its own runtime, database, orm, api, dbSetup
    const convexOverrides: Partial<StackState> = {
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      dbSetup: "none",
      serverDeploy: "none",
    };

    for (const [key, value] of Object.entries(convexOverrides)) {
      const catKey = key as keyof StackState;
      if (nextStack[catKey] !== value) {
        nextStack[catKey] = value as never;
        changed = true;
        changes.push({
          category: "backend",
          message: `${getCategoryDisplayName(catKey)} definido como '${value}' (o Convex fornece isso)`,
        });
      }
    }

    // Remove incompatible frontends
    if (nextStack.webFrontend.includes("solid") || nextStack.webFrontend.includes("astro")) {
      nextStack.webFrontend = nextStack.webFrontend.filter((f) => f !== "solid" && f !== "astro");
      if (nextStack.webFrontend.length === 0) nextStack.webFrontend = ["none"];
      changed = true;
      changes.push({ category: "backend", message: "Solid removido (incompatível com Convex)" });
    }

    // Remove AI example if incompatible frontends are selected (Convex AI only supports React-based frontends)
    if (nextStack.examples.includes("ai")) {
      const hasIncompatibleFrontend = nextStack.webFrontend.some((f) =>
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
      if (!hasClerkCompatibleFrontend(nextStack.webFrontend, nextStack.nativeFrontend)) {
        nextStack.auth = "none";
        changed = true;
        changes.push({
          category: "auth",
          message: `Auth definido como 'Nenhum' (${clerkFrontendRequirementMessage})`,
        });
      }
    }

    if (nextStack.auth === "better-auth") {
      if (!hasConvexBetterAuthCompatibleFrontend(nextStack.webFrontend, nextStack.nativeFrontend)) {
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
    const noneOverrides: Partial<StackState> = {
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      auth: "none",
      dbSetup: "none",
      serverDeploy: "none",
      payments: "none",
    };

    for (const [key, value] of Object.entries(noneOverrides)) {
      const catKey = key as keyof StackState;
      if (nextStack[catKey] !== value) {
        nextStack[catKey] = value as never;
        changed = true;
        changes.push({
          category: "backend",
          message: `${getCategoryDisplayName(catKey)} definido como '${value}' (sem backend)`,
        });
      }
    }

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

    // Ensure correct frontend is selected
    if (nextStack.backend === "self-next" && !nextStack.webFrontend.includes("next")) {
      nextStack.webFrontend = ["next"];
      changed = true;
      changes.push({
        category: "backend",
        message: "Frontend definido como 'Next.js' (necessário para Next.js fullstack)",
      });
    }
    if (
      nextStack.backend === "self-tanstack-start" &&
      !nextStack.webFrontend.includes("tanstack-start")
    ) {
      nextStack.webFrontend = ["tanstack-start"];
      changed = true;
      changes.push({
        category: "backend",
        message:
          "Frontend definido como 'TanStack Start' (necessário para TanStack Start fullstack)",
      });
    }
    if (nextStack.backend === "self-nuxt" && !nextStack.webFrontend.includes("nuxt")) {
      nextStack.webFrontend = ["nuxt"];
      changed = true;
      changes.push({
        category: "backend",
        message: "Frontend definido como 'Nuxt' (necessário para Nuxt fullstack)",
      });
    }
    if (nextStack.backend === "self-svelte" && !nextStack.webFrontend.includes("svelte")) {
      nextStack.webFrontend = ["svelte"];
      changed = true;
      changes.push({
        category: "backend",
        message: "Frontend definido como 'SvelteKit' (necessário para SvelteKit fullstack)",
      });
    }
    if (nextStack.backend === "self-astro" && !nextStack.webFrontend.includes("astro")) {
      nextStack.webFrontend = ["astro"];
      changed = true;
      changes.push({
        category: "backend",
        message: "Frontend definido como 'Astro' (necessário para Astro fullstack)",
      });
    }
  }

  // ============================================
  // RUNTIME CONSTRAINTS
  // ============================================

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

  // ============================================
  // DATABASE & ORM CONSTRAINTS (CLI-like flow)
  // ============================================

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

  // ============================================
  // API CONSTRAINTS
  // ============================================

  if (nextStack.backend !== "convex" && nextStack.backend !== "none") {
    // Nuxt, Svelte, Solid, Astro require oRPC (not tRPC)
    const needsOrpc = nextStack.webFrontend.some((f) =>
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

  // ============================================
  // AUTH CONSTRAINTS
  // ============================================

  if (nextStack.auth === "clerk") {
    if (!hasClerkCompatibleBackend(nextStack.backend)) {
      nextStack.auth = "none";
      changed = true;
      changes.push({
        category: "auth",
        message: `Auth definido como 'Nenhum' (${clerkBackendRequirementMessage})`,
      });
    } else if (!hasClerkCompatibleFrontend(nextStack.webFrontend, nextStack.nativeFrontend)) {
      nextStack.auth = "none";
      changed = true;
      changes.push({
        category: "auth",
        message: `Auth definido como 'Nenhum' (${clerkFrontendRequirementMessage})`,
      });
    }
  }

  // ============================================
  // PAYMENTS CONSTRAINTS
  // ============================================

  // ============================================
  // ADDONS CONSTRAINTS
  // ============================================

  const pwaCompat = hasPWACompatibleFrontend(nextStack.webFrontend);
  const tauriCompat = hasTauriCompatibleFrontend(nextStack.webFrontend, nextStack.backend);
  const electrobunCompat = hasElectrobunCompatibleFrontend(
    nextStack.webFrontend,
    nextStack.backend,
  );
  const evlogCompat = hasEvlogCompatibleBackend(nextStack.backend);

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
    isTauriBlockedByConvexBetterAuth(nextStack.webFrontend, nextStack.backend, nextStack.auth)
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
  if (!evlogCompat && nextStack.addons.includes("evlog")) {
    nextStack.addons = nextStack.addons.filter((a) => a !== "evlog");
    if (nextStack.addons.length === 0) nextStack.addons = ["none"];
    changed = true;
    changes.push({
      category: "addons",
      message: "evlog removido (exige um servidor ou backend fullstack)",
    });
  }

  // ============================================
  // EXAMPLES CONSTRAINTS
  // ============================================

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
    if (nextStack.webFrontend.includes("solid") || nextStack.webFrontend.includes("astro")) {
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
      const hasIncompatibleFrontend = nextStack.webFrontend.some((f) =>
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

  // ============================================
  // DEPLOYMENT CONSTRAINTS
  // ============================================

  // Web deploy requires web frontend
  if (nextStack.webDeploy !== "none" && !nextStack.webFrontend.some((f) => f !== "none")) {
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

  if (nextStack.serverDeploy === "vercel" && nextStack.runtime === "workers") {
    nextStack.serverDeploy = "cloudflare";
    changed = true;
    changes.push({
      category: "serverDeploy",
      message:
        "Deploy do servidor definido como 'Cloudflare' (runtime Workers faz deploy via Cloudflare)",
    });
  }

  if (nextStack.serverDeploy === "guaracloud" && nextStack.runtime === "workers") {
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

  return {
    adjustedStack: changed ? nextStack : null,
    notes,
    changes,
  };
};

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
  // ============================================
  // CONVEX BACKEND - locks down many options
  // ============================================
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
          currentStack.webFrontend,
          currentStack.nativeFrontend,
        )
      ) {
        return convexBetterAuthFrontendRequirementMessage;
      }
    }
    if (category === "webFrontend" && (optionId === "solid" || optionId === "astro")) {
      return `${optionId.charAt(0).toUpperCase() + optionId.slice(1)} não é compatível com Convex`;
    }
    if (category === "examples" && optionId === "ai") {
      const hasIncompatibleFrontend = currentStack.webFrontend.some((f) =>
        ["solid", "svelte", "nuxt"].includes(f),
      );
      if (hasIncompatibleFrontend) {
        const frontendName = currentStack.webFrontend.find((f) =>
          ["solid", "svelte", "nuxt"].includes(f),
        );
        return `O exemplo de IA do Convex só suporta frontends baseados em React (não ${frontendName})`;
      }
    }
  }

  // ============================================
  // NO BACKEND - locks down backend-dependent options
  // ============================================
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

  // ============================================
  // FULLSTACK BACKEND CONSTRAINTS
  // ============================================
  if (currentStack.backend === "self-next") {
    if (category === "runtime" && optionId !== "none") {
      return "Next.js fullstack usa rotas de API nativas";
    }
    if (category === "webFrontend" && optionId !== "next") {
      return "Next.js fullstack exige frontend Next.js";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
  }

  if (currentStack.backend === "self-nuxt") {
    if (category === "runtime" && optionId !== "none") {
      return "Nuxt fullstack usa rotas de servidor nativas";
    }
    if (category === "webFrontend" && optionId !== "nuxt") {
      return "Nuxt fullstack exige frontend Nuxt";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
    if (category === "api" && optionId === "trpc") {
      return "tRPC não é compatível com Nuxt (use oRPC)";
    }
  }

  if (currentStack.backend === "self-svelte") {
    if (category === "runtime" && optionId !== "none") {
      return "SvelteKit fullstack usa rotas de servidor nativas";
    }
    if (category === "webFrontend" && optionId !== "svelte") {
      return "SvelteKit fullstack exige frontend SvelteKit";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
    if (category === "api" && optionId === "trpc") {
      return "tRPC não é compatível com SvelteKit (use oRPC)";
    }
  }

  if (currentStack.backend === "self-tanstack-start") {
    if (category === "runtime" && optionId !== "none") {
      return "TanStack Start fullstack usa rotas de API nativas";
    }
    if (category === "webFrontend" && optionId !== "tanstack-start") {
      return "TanStack Start fullstack exige frontend TanStack Start";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
  }

  if (currentStack.backend === "self-astro") {
    if (category === "runtime" && optionId !== "none") {
      return "Astro fullstack usa rotas de API nativas";
    }
    if (category === "webFrontend" && optionId !== "astro") {
      return "Astro fullstack exige frontend Astro";
    }
    if (category === "serverDeploy" && optionId !== "none") {
      return "Fullstack usa o deploy do frontend";
    }
    if (category === "api" && optionId === "trpc") {
      return "tRPC não é compatível com Astro (use oRPC)";
    }
  }

  // ============================================
  // BACKEND SELECTION CONSTRAINTS
  // ============================================
  if (category === "backend") {
    if (optionId === "self-next" && !currentStack.webFrontend.includes("next")) {
      return "Exige frontend Next.js";
    }
    if (
      optionId === "self-tanstack-start" &&
      !currentStack.webFrontend.includes("tanstack-start")
    ) {
      return "Exige frontend TanStack Start";
    }
    if (optionId === "self-nuxt" && !currentStack.webFrontend.includes("nuxt")) {
      return "Exige frontend Nuxt";
    }
    if (optionId === "self-svelte" && !currentStack.webFrontend.includes("svelte")) {
      return "Exige frontend SvelteKit";
    }
    if (optionId === "self-astro" && !currentStack.webFrontend.includes("astro")) {
      return "Exige frontend Astro";
    }
    if (
      optionId === "convex" &&
      (currentStack.webFrontend.includes("solid") || currentStack.webFrontend.includes("astro"))
    ) {
      const incompatible = currentStack.webFrontend.includes("solid") ? "Solid" : "Astro";
      return `Convex não é compatível com ${incompatible}`;
    }
    // Workers runtime only works with Hono backend
    if (currentStack.runtime === "workers" && optionId !== "hono" && optionId !== "none") {
      return "O runtime Workers só funciona com Hono";
    }
  }

  // ============================================
  // RUNTIME CONSTRAINTS
  // ============================================
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

  // ============================================
  // DATABASE CONSTRAINTS
  // ============================================
  if (category === "database") {
    if (optionId === "mongodb" && currentStack.runtime === "workers") {
      return "MongoDB não é compatível com o runtime Workers";
    }
    // Allow all databases when ORM is none - system will auto-select ORM
  }

  // ============================================
  // ORM CONSTRAINTS
  // ============================================
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

  // ============================================
  // DB SETUP CONSTRAINTS
  // ============================================
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

  // ============================================
  // API CONSTRAINTS
  // ============================================
  if (category === "api" && optionId === "trpc") {
    const needsOrpc = currentStack.webFrontend.some((f) =>
      ["nuxt", "svelte", "solid", "astro"].includes(f),
    );
    if (needsOrpc) {
      const frontendName = currentStack.webFrontend.find((f) =>
        ["nuxt", "svelte", "solid", "astro"].includes(f),
      );
      return `${frontendName} exige oRPC, não tRPC`;
    }
  }

  // ============================================
  // AUTH CONSTRAINTS
  // ============================================
  if (category === "auth") {
    if (optionId === "clerk") {
      if (!hasClerkCompatibleBackend(currentStack.backend)) {
        return clerkBackendRequirementMessage;
      }
      if (!hasClerkCompatibleFrontend(currentStack.webFrontend, currentStack.nativeFrontend)) {
        return clerkFrontendRequirementMessage;
      }
    }
  }

  // ============================================
  // PAYMENTS CONSTRAINTS
  // ============================================
  if (category === "payments") {
    if (optionId === "polar" && currentStack.auth !== "better-auth") {
      return "Polar exige Better Auth";
    }

    if (optionId === "abacatepay") {
      if (currentStack.backend === "convex") {
        return "AbacatePay não é suportado com Convex";
      }
      if (!currentStack.webFrontend.some((f) => f !== "none")) {
        return "AbacatePay exige um frontend web";
      }
      if (currentStack.nativeFrontend.some((f) => f !== "none")) {
        return "AbacatePay v1 não suporta apps com frontend nativo";
      }
      if (
        currentStack.database === "none" ||
        currentStack.orm === "none" ||
        currentStack.database === "mongodb" ||
        currentStack.orm === "mongoose"
      ) {
        return "AbacatePay v1 exige um banco SQL com Prisma ou Drizzle";
      }
    }
  }

  // ============================================
  // ADDONS CONSTRAINTS
  // ============================================
  if (category === "addons") {
    if (optionId === "pwa" && !hasPWACompatibleFrontend(currentStack.webFrontend)) {
      return "PWA exige TanStack Router, React Router, Solid ou Next.js";
    }
    if (
      optionId === "tauri" &&
      !hasTauriCompatibleFrontend(currentStack.webFrontend, currentStack.backend)
    ) {
      if (isSelfHostedFullstackBackend(currentStack.backend)) {
        return "Tauri exige um backend separado ou nenhum backend";
      }
      return "Tauri exige um frontend web";
    }
    if (
      optionId === "tauri" &&
      isTauriBlockedByConvexBetterAuth(
        currentStack.webFrontend,
        currentStack.backend,
        currentStack.auth,
      )
    ) {
      return "Tauri não é compatível com Convex Better Auth no Next.js ou TanStack Start";
    }
    if (
      optionId === "electrobun" &&
      !hasElectrobunCompatibleFrontend(currentStack.webFrontend, currentStack.backend)
    ) {
      if (isSelfHostedFullstackBackend(currentStack.backend)) {
        return "Electrobun exige um backend separado ou nenhum backend";
      }
      return "Electrobun exige um frontend web";
    }
    if (optionId === "evlog" && !hasEvlogCompatibleBackend(currentStack.backend)) {
      return "evlog exige Hono, Express, Fastify, Elysia ou um backend fullstack";
    }
    // Task runners are mutually exclusive in the CLI, but the builder lets users swap them.
    // URL/state sanitization keeps only the latest selected runner before generating commands.
  }

  // ============================================
  // EXAMPLES CONSTRAINTS
  // ============================================
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
        currentStack.webFrontend.includes("solid") ||
        currentStack.webFrontend.includes("astro")
      ) {
        return "Exemplo de IA incompatível com frontend Solid ou Astro";
      }
      if (currentStack.backend === "convex") {
        const hasIncompatibleFrontend = currentStack.webFrontend.some((f) =>
          ["svelte", "nuxt"].includes(f),
        );
        if (hasIncompatibleFrontend) {
          const frontendName = currentStack.webFrontend.find((f) => ["svelte", "nuxt"].includes(f));
          return `O exemplo de IA do Convex só suporta frontends baseados em React (não ${frontendName})`;
        }
      }
    }
  }

  // ============================================
  // DEPLOYMENT CONSTRAINTS
  // ============================================
  if (category === "webDeploy" && optionId !== "none") {
    if (!currentStack.webFrontend.some((f) => f !== "none")) {
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
    if (optionId === "vercel" && currentStack.runtime === "workers") {
      return "Deploy de servidor na Vercel exige runtime Bun ou Node";
    }
    if (optionId === "guaracloud" && currentStack.runtime === "workers") {
      return "Deploy de servidor na Guara Cloud exige runtime Bun ou Node";
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

  return null;
};

export const isOptionCompatible = (
  currentStack: StackState,
  category: keyof typeof TECH_OPTIONS,
  optionId: string,
): boolean => {
  if (currentStack.yolo === "true") {
    return true;
  }
  return getDisabledReason(currentStack, category, optionId) === null;
};
