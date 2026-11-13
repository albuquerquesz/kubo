import {
  expandLayoutConfig,
  getLayoutPackagePath,
  relativeLayoutPath,
  LayoutConfigSchema,
  type ExpandedLayoutConfig,
  type LayoutAppId,
  type LayoutConfig,
} from "@kubojs/types";
import type { HelperOptions } from "handlebars";
import Handlebars from "handlebars";

/**
 * Layout refs used in templates: `app:<id>`, `package:<id>`, `root`, or a
 * project-relative path containing "/" (e.g. `apps/web/.env` stays literal).
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
  const [kind, id] = ref.split(":", 2);
  if (kind === "package" && id) return getLayoutPackagePath(expanded, id);
  if (kind === "app" && id && isAppId(expanded, id)) return expanded.apps[id];
  throw new Error(`Unknown layout ref "${ref}" (expected app:<id>, package:<id> or root)`);
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
 * Relative path from the folder of `from` to `to`.
 * `{{layoutRelative "app:web" "package:ui"}}` → `../../packages/ui` in the standard layout.
 * `{{layoutRelative "app:web" "app:server" ".env"}}` → `../server/.env`.
 */
function layoutRelativeHelper(from: LayoutRef, to: LayoutRef, ...rest: unknown[]): string {
  const options = rest.pop() as HelperOptions;
  const expanded = expandLayoutConfig(getLayoutFromOptions(options));
  const fromPath = resolveLayoutRef(expanded, String(from));
  const toPath = resolveLayoutRef(expanded, String(to));
  const sub = rest.filter((part): part is string => typeof part === "string");
  const relative = relativeLayoutPath(fromPath, toPath);
  return [relative, ...sub].filter((part) => part !== ".").join("/") || ".";
}

export function registerLayoutHelpers(handlebars: typeof Handlebars = Handlebars): void {
  handlebars.registerHelper("layoutPath", layoutPathHelper);
  handlebars.registerHelper("layoutRelative", layoutRelativeHelper);
}
