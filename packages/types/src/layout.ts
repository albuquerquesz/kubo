import { joinLayoutPath, normalizeLayoutPath } from "./layout-path";
import {
  LAYOUT_INTEGRATION_PACKAGE_IDS,
  LAYOUT_PRESET_DIRS,
  type LayoutDirs,
} from "./layout-presets";
import { LayoutAppIdSchema, LayoutPackageIdSchema } from "./schemas";
import type { LayoutAppId, LayoutConfig, LayoutPreset } from "./types";

export type ExpandedLayoutConfig = {
  version: 1;
  preset: LayoutPreset;
  dirs: LayoutDirs;
  apps: Record<LayoutAppId, string>;
  /** Core and known integration packages, plus any custom overrides. */
  packages: Record<string, string>;
};

const APP_IDS = LayoutAppIdSchema.options;
const CORE_PACKAGE_IDS = LayoutPackageIdSchema.options;

/** Turns the deprecated `server-separated` preset into its v2 equivalent. */
function upgradeLegacyLayout(layout: LayoutConfig | undefined): {
  preset: LayoutPreset;
  dirs?: Partial<LayoutDirs>;
  apps?: Partial<Record<LayoutAppId, string>>;
  packages?: Record<string, string>;
} {
  if (layout?.preset === "server-separated") {
    return { ...layout, preset: "standard", apps: { web: "apps/client", ...layout.apps } };
  }
  return { ...layout, preset: layout?.preset ?? "standard" };
}

/**
 * Expands a layout into concrete paths. Each path is the explicit override when
 * present, otherwise `<convention dir>/<id>`.
 */
export function expandLayoutConfig(layout?: LayoutConfig): ExpandedLayoutConfig {
  const upgraded = upgradeLegacyLayout(layout);
  const presetDirs = LAYOUT_PRESET_DIRS[upgraded.preset];
  const dirs: LayoutDirs = {
    apps: normalizeLayoutPath(upgraded.dirs?.apps ?? presetDirs.apps) || ".",
    packages: normalizeLayoutPath(upgraded.dirs?.packages ?? presetDirs.packages) || ".",
  };

  const apps = Object.fromEntries(
    APP_IDS.map((id) => [
      id,
      normalizeLayoutPath(upgraded.apps?.[id] ?? joinLayoutPath(dirs.apps, id)),
    ]),
  ) as Record<LayoutAppId, string>;

  const packageIds = new Set<string>([
    ...CORE_PACKAGE_IDS,
    ...LAYOUT_INTEGRATION_PACKAGE_IDS,
    ...Object.keys(upgraded.packages ?? {}),
  ]);
  const packages = Object.fromEntries(
    [...packageIds].map((id) => [
      id,
      normalizeLayoutPath(upgraded.packages?.[id] ?? joinLayoutPath(dirs.packages, id)),
    ]),
  );

  return { version: 1, preset: upgraded.preset, dirs, apps, packages };
}

/** Path of any package id, including integration ids not listed in the layout. */
export function getLayoutPackagePath(expanded: ExpandedLayoutConfig, id: string): string {
  return expanded.packages[id] ?? joinLayoutPath(expanded.dirs.packages, id);
}

export type LayoutConflict = {
  code: "path_collision" | "case_collision" | "path_overlap";
  paths: [string, string];
  owners: [string, string];
  message: string;
};

type LayoutEntry = { owner: string; path: string };

function listLayoutEntries(expanded: ExpandedLayoutConfig): LayoutEntry[] {
  return [
    ...Object.entries(expanded.apps).map(([id, path]) => ({ owner: `app:${id}`, path })),
    ...Object.entries(expanded.packages).map(([id, path]) => ({ owner: `package:${id}`, path })),
  ];
}

function compareEntries(a: LayoutEntry, b: LayoutEntry): LayoutConflict | undefined {
  const owners: [string, string] = [a.owner, b.owner];
  const paths: [string, string] = [a.path, b.path];

  if (a.path === b.path) {
    return {
      code: "path_collision",
      owners,
      paths,
      message: `Layout path collision: "${a.path}" is used by ${a.owner} and ${b.owner}`,
    };
  }

  const lowerA = a.path.toLowerCase();
  const lowerB = b.path.toLowerCase();
  if (lowerA === lowerB) {
    return {
      code: "case_collision",
      owners,
      paths,
      message: `Layout paths "${a.path}" (${a.owner}) and "${b.path}" (${b.owner}) differ only by letter case`,
    };
  }

  if (lowerB.startsWith(`${lowerA}/`) || lowerA.startsWith(`${lowerB}/`)) {
    return {
      code: "path_overlap",
      owners,
      paths,
      message: `Layout path "${a.path}" (${a.owner}) and "${b.path}" (${b.owner}) are nested; each app and package needs its own folder`,
    };
  }

  return undefined;
}

/** Every pair of apps/packages whose folders collide, differ only by case, or nest. */
export function findLayoutConflicts(expanded: ExpandedLayoutConfig): LayoutConflict[] {
  const entries = listLayoutEntries(expanded);
  const conflicts: LayoutConflict[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const conflict = compareEntries(entries[i]!, entries[j]!);
      if (conflict) conflicts.push(conflict);
    }
  }
  return conflicts;
}

/**
 * Workspace globs covering every app and package folder, e.g. `["apps/*", "packages/*"]`.
 * Paths outside the convention dirs get their own exact entry.
 */
export function getLayoutWorkspaceGlobs(
  expanded: ExpandedLayoutConfig,
  usedPaths?: readonly string[],
): string[] {
  const paths = usedPaths ?? [...Object.values(expanded.apps), ...Object.values(expanded.packages)];
  const globs = new Set<string>();
  for (const value of paths) {
    const normalized = normalizeLayoutPath(value);
    const parent = normalized.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : "";
    const isConventionChild =
      parent !== "" && (parent === expanded.dirs.apps || parent === expanded.dirs.packages);
    globs.add(isConventionChild ? `${parent}/*` : normalized);
  }
  return [...globs];
}
