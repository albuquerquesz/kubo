import type { Architecture, ProjectConfig } from "@kubojs/types";
import { basename, join, normalize } from "pathe";

import { appDir } from "../layout-paths";

/** Project-relative path (no leading `/`, no `./`). */
export function projectPath(...parts: string[]): string {
  return normalize(join(...parts)).replace(/^\.?\//, "");
}

/** Web frameworks whose `src/` is reorganized. Nuxt (auto-imports) and native stay as generated. */
const WEB_KINDS = {
  "tanstack-router": "react",
  "react-router": "react",
  "tanstack-start": "react",
  next: "react",
  solid: "react",
  svelte: "svelte",
  astro: "astro",
} as const;

type WebKind = (typeof WEB_KINDS)[keyof typeof WEB_KINDS];

function webKind(config: ProjectConfig): WebKind | undefined {
  for (const frontend of config.frontend) {
    const kind = WEB_KINDS[frontend as keyof typeof WEB_KINDS];
    if (kind) return kind;
  }
  return undefined;
}

/** Role of a web file, by its path relative to the web app's `src/`. */
type WebRole =
  | "auth-component"
  | "auth-lib"
  | "auth-server"
  | "component"
  | "api-client"
  | "observability";

const AUTH_COMPONENT =
  /^components\/(sign-in-form|sign-up-form|user-menu|SignInForm|SignUpForm|UserMenu)\.(tsx|svelte|astro)$/;

function webRole(rel: string, kind: WebKind): WebRole | undefined {
  if (AUTH_COMPONENT.test(rel)) return "auth-component";
  if (/^(lib\/auth-(client|server)|utils\/clerk-auth)\.ts$/.test(rel)) return "auth-lib";
  if (/^(functions\/get-user|middleware\/auth)\.ts$/.test(rel) && kind === "react")
    return "auth-server";
  if (/^(utils|lib)\/(trpc|orpc)(\.server)?\.ts$/.test(rel)) return "api-client";
  if (/^lib\/himetrica\.ts$/.test(rel)) return "observability";
  if (/^components\/[^/]+\.(tsx|svelte|astro)$/.test(rel)) return "component";
  return undefined;
}

/** Destination (relative to `src/`) of a web file for the architecture, or undefined to keep it. */
function webTarget(
  rel: string,
  role: WebRole,
  architecture: Architecture,
  kind: WebKind,
): string | undefined {
  const name = basename(rel);
  // Svelte keeps moved code under src/lib so it stays reachable through `$lib`.
  const base = kind === "svelte" ? "lib/" : "";
  if (architecture === "feature") {
    if (role === "auth-component") return `${base}features/auth/components/${name}`;
    if (role === "auth-lib") return `${base}features/auth/lib/${name}`;
    if (role === "auth-server") return `${base}features/auth/server/${name}`;
    return undefined;
  }
  if (architecture === "clean") {
    if (role === "auth-component" || role === "component")
      return `${base}presentation/components/${name}`;
    if (role === "api-client") return `${base}infrastructure/api/${name}`;
    if (role === "auth-lib" || role === "auth-server") return `${base}infrastructure/auth/${name}`;
    if (role === "observability") return `${base}infrastructure/observability/${name}`;
  }
  return undefined;
}

export type ArchitectureMoves = {
  /** old project path → new project path */
  moves: Map<string, string>;
  /** App roots whose files get their imports rewritten, with their `@/` alias root if any. */
  apps: { dir: string; aliasRoot?: string; libRoot?: string }[];
  /** `components.json` alias for the web app, when it changes. */
  componentsAlias?: { file: string; value: string };
};

const API_MODULE_FILE = /^modules\/([^/]+)\/(index|service|model)\.ts$/;

function apiTarget(feature: string, kind: string, architecture: Architecture): string | undefined {
  if (architecture === "layered") {
    if (kind === "index") return `routers/${feature}.ts`;
    return `${kind}s/${feature}.${kind}.ts`;
  }
  if (architecture === "clean") {
    if (kind === "index") return `presentation/routers/${feature}.ts`;
    if (kind === "service") return `application/${feature}/${feature}.service.ts`;
    return `domain/${feature}/${feature}.model.ts`;
  }
  return undefined;
}

/** Computes every file move for the config's architecture from the generated file list. */
export function planArchitectureMoves(
  config: ProjectConfig,
  files: readonly string[],
): ArchitectureMoves {
  const architecture = config.architecture;
  const result: ArchitectureMoves = { moves: new Map(), apps: [] };
  if (!architecture) return result;

  if (config.api === "trpc" || config.api === "orpc") {
    const apiSrc = projectPath(appDir(config, "api"), "src");
    for (const file of files) {
      if (!file.startsWith(`${apiSrc}/`)) continue;
      const match = API_MODULE_FILE.exec(file.slice(apiSrc.length + 1));
      if (!match) continue;
      const target = apiTarget(match[1]!, match[2]!, architecture);
      if (target) result.moves.set(file, projectPath(apiSrc, target));
    }
    result.apps.push({ dir: projectPath(appDir(config, "api")) });
  }

  const kind = webKind(config);
  if (kind) {
    const webRoot = projectPath(appDir(config, "web"));
    const webSrc = projectPath(webRoot, "src");
    for (const file of files) {
      if (!file.startsWith(`${webSrc}/`)) continue;
      const rel = file.slice(webSrc.length + 1);
      const role = webRole(rel, kind);
      const target = role && webTarget(rel, role, architecture, kind);
      if (target) result.moves.set(file, projectPath(webSrc, target));
    }
    result.apps.push({
      dir: webRoot,
      aliasRoot: kind === "react" ? webSrc : undefined,
      libRoot: kind === "svelte" ? projectPath(webSrc, "lib") : undefined,
    });
    if (architecture === "clean" && kind === "react") {
      result.componentsAlias = {
        file: projectPath(webRoot, "components.json"),
        value: "@/presentation/components",
      };
    }
  }
  return result;
}
