import {
  expandLayoutConfig,
  getLayoutDirGlob,
  getLayoutPackagePath,
  joinLayoutPath,
  layoutPathDepth,
  relativeLayoutPath,
  LayoutConfigSchema,
  type ExpandedLayoutConfig,
  type LayoutAppId,
  type LayoutConfig,
} from "@kubojs/types";
import type { HelperOptions } from "handlebars";
import Handlebars from "handlebars";

/**
 * Layout refs used in templates:
 * - `app:<id>` / `package:<id>`, optionally with a subpath: `package:env/src`
 * - `dir:apps` / `dir:packages`: the convention directories
 * - `root`: the project root
 */
type LayoutRef = string;

function getLayoutFromOptions(options: HelperOptions): LayoutConfig | undefined {
  const root: unknown = options.data?.root;
  if (typeof root !== "object" || root === null || !("layout" in root)) return undefined;
  const parsed = LayoutConfigSchema.safeParse(root.layout);
  return parsed.success ? parsed.data : undefined;
}

function isAppId(expanded: ExpandedLayoutConfig, id: string): id is LayoutAppId {
  return Object.hasOwn(expanded.apps, id);
}

export function resolveLayoutRef(expanded: ExpandedLayoutConfig, ref: LayoutRef): string {
  if (ref === "root" || ref === ".") return ".";
  const match = /^(app|package|dir):([a-z][a-z0-9-]*)(\/.+)?$/.exec(ref);
  if (match) {
    const [, kind, id, sub = ""] = match;
    const base = resolveLayoutBase(expanded, kind!, id!);
    if (base !== undefined) return sub ? joinLayoutPath(base, sub.slice(1)) : base;
  }
  throw new Error(
    `Unknown layout ref "${ref}" (expected app:<id>, package:<id>, dir:apps, dir:packages or root)`,
  );
}

function resolveLayoutBase(
  expanded: ExpandedLayoutConfig,
  kind: string,
  id: string,
): string | undefined {
  if (kind === "package") return getLayoutPackagePath(expanded, id);
  if (kind === "app") return isAppId(expanded, id) ? expanded.apps[id] : undefined;
  if (id === "apps" || id === "packages") return expanded.dirs[id];
  return undefined;
}

/**
 * `{{layoutPath "package:db"}}` → `packages/db` (project-relative).
 * `{{layoutPath "app:web" "src/index.ts"}}` → `apps/web/src/index.ts`.
 */
function layoutPathHelper(ref: LayoutRef, ...rest: unknown[]): string {
  const options = rest.pop() as HelperOptions;
  const expanded = expandLayoutConfig(getLayoutFromOptions(options));
  const base = resolveLayoutRef(expanded, String(ref));
  const sub = rest.filter((part): part is string => typeof part === "string");
  return [base, ...sub].filter((part) => part !== ".").join("/") || ".";
}

/**
 * Relative path from the folder of `from` to `to`, always written through the project root
 * (`../../packages/db`, never the shorter `../db`) to match the style of the existing templates.
 * `{{layoutRelative "app:web" "package:ui"}}` → `../../packages/ui` in the standard layout.
 * `{{layoutRelative "package:db" "app:server" ".env"}}` → `../../apps/server/.env`.
 */
function layoutRelativeHelper(from: LayoutRef, to: LayoutRef, ...rest: unknown[]): string {
  const options = rest.pop() as HelperOptions;
  const expanded = expandLayoutConfig(getLayoutFromOptions(options));
  const fromPath = resolveLayoutRef(expanded, String(from));
  const toPath = resolveLayoutRef(expanded, String(to));
  const sub = rest.filter((part): part is string => typeof part === "string");
  const ups = Array.from({ length: layoutPathDepth(fromPath) }, () => "..");
  return [...ups, toPath, ...sub].filter((part) => part !== ".").join("/") || ".";
}

/**
 * Shortest relative path from the folder of `from` to `to` (siblings stay `../x`).
 * `{{layoutRelativeShort "app:desktop" "app:web" "dist"}}` → `../web/dist` in the standard layout.
 */
function layoutRelativeShortHelper(from: LayoutRef, to: LayoutRef, ...rest: unknown[]): string {
  const options = rest.pop() as HelperOptions;
  const expanded = expandLayoutConfig(getLayoutFromOptions(options));
  const relative = relativeLayoutPath(
    resolveLayoutRef(expanded, String(from)),
    resolveLayoutRef(expanded, String(to)),
  );
  const sub = rest.filter((part): part is string => typeof part === "string");
  return [relative, ...sub].filter((part) => part !== ".").join("/") || ".";
}

/** `{{layoutDirGlob "apps"}}` → `apps/*`; `{{layoutDirGlob "packages"}}` → `packages/*` (or `libs/*`). */
function layoutDirGlobHelper(kind: unknown, options: HelperOptions): string {
  const { dirs } = expandLayoutConfig(getLayoutFromOptions(options));
  if (kind !== "apps" && kind !== "packages") {
    throw new Error(`Unknown layout dir "${String(kind)}" (expected apps or packages)`);
  }
  return getLayoutDirGlob(dirs[kind]);
}

export function registerLayoutHelpers(handlebars: typeof Handlebars = Handlebars): void {
  handlebars.registerHelper("layoutPath", layoutPathHelper);
  handlebars.registerHelper("layoutRelative", layoutRelativeHelper);
  handlebars.registerHelper("layoutDirGlob", layoutDirGlobHelper);
  handlebars.registerHelper("layoutRelativeShort", layoutRelativeShortHelper);
}
