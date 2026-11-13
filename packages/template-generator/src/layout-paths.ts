import {
  expandLayoutConfig,
  getLayoutPackagePath,
  getLayoutWorkspaceGlobs,
  LayoutAppIdSchema,
  type LayoutAppId,
  type ProjectConfig,
} from "@kubojs/types";

export function getWebAppPath(config: ProjectConfig): string {
  return expandLayoutConfig(config.layout).apps.web;
}

export function getStoragePackagePath(config: ProjectConfig): string {
  return getLayoutPackagePath(expandLayoutConfig(config.layout), "storage");
}

export function getCatalogPackagePaths(config: ProjectConfig): string[] {
  const expanded = expandLayoutConfig(config.layout);
  const paths = new Set<string>([
    ".",
    ...Object.values(expanded.apps),
    ...Object.values(expanded.packages),
  ]);
  return [...paths];
}

/** Workspace globs (package.json `workspaces`, pnpm-workspace.yaml) for the project layout. */
export function getWorkspaceGlobs(config: ProjectConfig): string[] {
  return getLayoutWorkspaceGlobs(expandLayoutConfig(config.layout));
}

/** Project-relative folder of an app in the config's layout (`web` → `apps/web`). */
export function appDir(config: Pick<ProjectConfig, "layout">, id: LayoutAppId): string {
  return expandLayoutConfig(config.layout).apps[id];
}

/** Project-relative folder of a package in the config's layout (`db` → `packages/db`). */
export function pkgDir(config: Pick<ProjectConfig, "layout">, id: string): string {
  return getLayoutPackagePath(expandLayoutConfig(config.layout), id);
}

/** File inside an app folder: `appFile(config, "web", "src/index.ts")` → `apps/web/src/index.ts`. */
export function appFile(
  config: Pick<ProjectConfig, "layout">,
  id: LayoutAppId,
  file: string,
): string {
  return `${appDir(config, id)}/${file}`;
}

/** File inside a package folder: `pkgFile(config, "db", "package.json")` → `packages/db/package.json`. */
export function pkgFile(config: Pick<ProjectConfig, "layout">, id: string, file: string): string {
  return `${pkgDir(config, id)}/${file}`;
}

function isLayoutAppId(id: string): id is LayoutAppId {
  return LayoutAppIdSchema.safeParse(id).success;
}

const STANDARD_LAYOUT = expandLayoutConfig({ preset: "standard" });
const LAYOUT_TOKEN = /(?<![A-Za-z0-9_@./-])(apps|packages)\/(\*|[a-z][a-z0-9-]*)(?![A-Za-z0-9_-])/g;

/**
 * Rewrites standard-layout paths in prose (README) to the project's layout:
 * `apps/web/.env` → `web/.env`, `packages/*` → `libs/*`. Identity for the standard layout.
 */
export function relocateLayoutPaths(text: string, config: Pick<ProjectConfig, "layout">): string {
  const expanded = expandLayoutConfig(config.layout);
  if (JSON.stringify(expanded) === JSON.stringify(STANDARD_LAYOUT)) return text;

  const relocated = text.replace(LAYOUT_TOKEN, (token, kind: string, id: string) => {
    const dir = kind === "apps" ? expanded.dirs.apps : expanded.dirs.packages;
    if (id === "*") return dir === "." ? "*" : `${dir}/*`;
    if (kind === "apps") return isLayoutAppId(id) ? expanded.apps[id] : token;
    return getLayoutPackagePath(expanded, id);
  });

  return relocated
    .replace(/(├── |└── )apps\//g, `$1${expanded.dirs.apps}/`)
    .replace(/(├── |└── )packages\//g, `$1${expanded.dirs.packages}/`);
}

/**
 * Maps a standard-layout file path to the project's layout:
 * `apps/desktop/package.json` → `<layout desktop>/package.json`. Identity for the standard layout
 * and for paths outside `apps/<id>` / `packages/<id>`. Used for templates copied from a root prefix.
 */
export function relocateLayoutFilePath(
  filePath: string,
  config: Pick<ProjectConfig, "layout">,
): string {
  const match = /^(apps|packages)\/([a-z][a-z0-9-]*)(\/.*)?$/.exec(filePath);
  if (!match) return filePath;
  const [, kind, id, rest = ""] = match;
  const expanded = expandLayoutConfig(config.layout);
  if (kind === "packages") return `${getLayoutPackagePath(expanded, id!)}${rest}`;
  if (isLayoutAppId(id!)) return `${expanded.apps[id]}${rest}`;
  return `${joinAppsDir(expanded.dirs.apps, id!)}${rest}`;
}

function joinAppsDir(dir: string, id: string): string {
  return dir === "." ? id : `${dir}/${id}`;
}

/**
 * Relative path from folder `fromDir` to project path `to`, written through the project root
 * (same style as the `layoutRelative` template helper): `("apps/web", "packages/env")` →
 * `../../packages/env`.
 */
export function relativeFromRoot(fromDir: string, to: string): string {
  const depth = fromDir === "." || fromDir === "" ? 0 : fromDir.split("/").filter(Boolean).length;
  return [...Array.from({ length: depth }, () => ".."), to].join("/");
}
