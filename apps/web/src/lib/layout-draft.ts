import {
  describeLayoutPathIssue,
  expandLayoutConfig,
  findLayoutConflicts,
  getLayoutPathIssue,
  LAYOUT_PRESET_DIRS,
  LayoutAppIdSchema,
  LayoutPackageIdSchema,
  LayoutScopeSchema,
  normalizeLayoutPath,
  type ExpandedLayoutConfig,
  type LayoutConfig,
  type LayoutConflict,
  type LayoutPreset,
} from "@kubojs/types";

export const LAYOUT_APP_IDS = LayoutAppIdSchema.options;
export const LAYOUT_PACKAGE_IDS = LayoutPackageIdSchema.options;

/** Editable form state: every field is a raw string; empty means "use the convention". */
export type LayoutDraft = {
  preset: LayoutPreset;
  dirs: { apps: string; packages: string };
  apps: Partial<Record<string, string>>;
  packages: Partial<Record<string, string>>;
  /** npm scope (`@acme`); empty means the default `@<projectName>`. */
  scope: string;
};

export type LayoutDraftField =
  | `dirs.${"apps" | "packages"}`
  | `apps.${string}`
  | `packages.${string}`
  | "scope";

export type LayoutDraftValidation = {
  /** Valid layout to apply, or undefined when the draft has errors. */
  layout: LayoutConfig | undefined;
  /** Expanded paths of the valid layout (used for the summary). */
  expanded: ExpandedLayoutConfig | undefined;
  fieldErrors: Partial<Record<LayoutDraftField, string>>;
  conflicts: LayoutConflict[];
};

export function layoutToDraft(layout: LayoutConfig | undefined): LayoutDraft {
  const preset: LayoutPreset = layout?.preset === "libs" ? "libs" : "standard";
  const legacyApps = layout?.preset === "server-separated" ? { web: "apps/client" } : {};
  return {
    preset,
    dirs: {
      apps: layout?.dirs?.apps ?? "",
      packages: layout?.dirs?.packages ?? "",
    },
    apps: { ...legacyApps, ...layout?.apps },
    packages: { ...layout?.packages },
    scope: layout?.scope ?? "",
  };
}

function compactOverrides(values: Partial<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values)
      .map(([id, value]) => [id, normalizeLayoutPath((value ?? "").trim())] as const)
      .filter(([, value]) => value !== ""),
  );
}

/** Converts the draft into a LayoutConfig, dropping empty fields. */
export function draftToLayout(draft: LayoutDraft): LayoutConfig {
  const presetDirs = LAYOUT_PRESET_DIRS[draft.preset];
  const dirs: { apps?: string; packages?: string } = {};
  const appsDir = draft.dirs.apps.trim();
  const packagesDir = draft.dirs.packages.trim();
  if (appsDir && (normalizeLayoutPath(appsDir) || ".") !== presetDirs.apps) dirs.apps = appsDir;
  if (packagesDir && (normalizeLayoutPath(packagesDir) || ".") !== presetDirs.packages) {
    dirs.packages = packagesDir;
  }

  const apps = compactOverrides(draft.apps);
  const packages = compactOverrides(draft.packages);
  const scope = draft.scope.trim();
  return {
    version: 1,
    preset: draft.preset,
    ...(Object.keys(dirs).length > 0 ? { dirs } : {}),
    ...(Object.keys(apps).length > 0 ? { apps } : {}),
    ...(Object.keys(packages).length > 0 ? { packages } : {}),
    ...(scope ? { scope } : {}),
  };
}

/** Field-level path validation plus folder conflicts, using the shared contract. */
export function validateLayoutDraft(draft: LayoutDraft): LayoutDraftValidation {
  const fieldErrors: Partial<Record<LayoutDraftField, string>> = {};
  for (const kind of ["apps", "packages"] as const) {
    const value = draft.dirs[kind];
    if (value.trim() === "") continue;
    const issue = getLayoutPathIssue(value, { allowRoot: true });
    if (issue) fieldErrors[`dirs.${kind}`] = describeLayoutPathIssue(issue);
  }
  for (const kind of ["apps", "packages"] as const) {
    for (const [id, value] of Object.entries(draft[kind])) {
      if (!value || value.trim() === "") continue;
      const issue = getLayoutPathIssue(value);
      if (issue) fieldErrors[`${kind}.${id}`] = describeLayoutPathIssue(issue);
    }
  }

  const scope = draft.scope.trim();
  if (scope) {
    const parsed = LayoutScopeSchema.safeParse(scope);
    if (!parsed.success) fieldErrors.scope = parsed.error.issues[0]?.message ?? "Invalid scope";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { layout: undefined, expanded: undefined, fieldErrors, conflicts: [] };
  }

  const layout = draftToLayout(draft);
  const expanded = expandLayoutConfig(layout);
  const conflicts = findLayoutConflicts(expanded);
  return {
    layout: conflicts.length > 0 ? undefined : layout,
    expanded,
    fieldErrors,
    conflicts,
  };
}

/** Default path an app/package gets from the current convention dirs (input placeholder). */
export function getConventionPath(
  draft: LayoutDraft,
  kind: "apps" | "packages",
  id: string,
): string {
  const presetDirs = LAYOUT_PRESET_DIRS[draft.preset];
  const dirInput = draft.dirs[kind].trim();
  const dir =
    dirInput && !getLayoutPathIssue(dirInput, { allowRoot: true })
      ? normalizeLayoutPath(dirInput) || "."
      : presetDirs[kind];
  return dir === "." ? id : `${dir}/${id}`;
}
