import {
  expandLayoutConfig,
  findLayoutConflicts,
  LayoutConfigSchema,
  type LayoutConfig,
} from "@kubojs/types";

export type LayoutProfileParseResult =
  | { ok: true; layout: LayoutConfig }
  | { ok: false; message: string };

/** Shared-contract validation for stored layouts: schema shape plus folder conflicts. */
export function parseLayoutProfile(input: unknown): LayoutProfileParseResult {
  const parsed = LayoutConfigSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue && issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return { ok: false, message: `${where}${issue?.message ?? "Invalid layout"}` };
  }

  const [conflict] = findLayoutConflicts(expandLayoutConfig(parsed.data));
  if (conflict) return { ok: false, message: conflict.message };

  return { ok: true, layout: { ...parsed.data, version: 1 } };
}

/** Profiles saved before names existed show up with this name. */
export const DEFAULT_LAYOUT_PROFILE_NAME = "Meu layout";
export const LAYOUT_PROFILE_NAME_MAX_LENGTH = 48;
export const MAX_LAYOUT_PROFILES = 20;

export type LayoutProfileNameResult = { ok: true; name: string } | { ok: false; message: string };

/** Trims and collapses whitespace; names must be 1–48 characters. */
export function parseLayoutProfileName(input: unknown): LayoutProfileNameResult {
  if (typeof input !== "string") return { ok: false, message: "Profile name is required" };
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length === 0) return { ok: false, message: "Profile name is required" };
  if (name.length > LAYOUT_PROFILE_NAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `Profile name must be at most ${LAYOUT_PROFILE_NAME_MAX_LENGTH} characters`,
    };
  }
  return { ok: true, name };
}

/** Display name of a stored profile (legacy profiles have no name). */
export function getLayoutProfileName(profile: { name?: string | undefined }): string {
  return profile.name ?? DEFAULT_LAYOUT_PROFILE_NAME;
}

/** Case-insensitive name match, so "Work" and "work" cannot both exist. */
export function isSameLayoutProfileName(a: string, b: string): boolean {
  return a.toLocaleLowerCase("en") === b.toLocaleLowerCase("en");
}
