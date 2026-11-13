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
