import {
  expandLayoutConfig,
  findLayoutConflicts,
  isStandardLayout,
  LayoutConfigSchema,
  type LayoutConfig,
} from "@kubojs/types";

/**
 * Reads a layout from untrusted input (URL, saved profile). Returns null for invalid layouts
 * (schema or folder conflicts) and for the standard layout, which is the default and is kept
 * out of the URL and the command.
 */
export function parseStackLayout(value: unknown): LayoutConfig | null {
  const parsed = LayoutConfigSchema.safeParse(value);
  if (!parsed.success) return null;
  if (findLayoutConflicts(expandLayoutConfig(parsed.data)).length > 0) return null;
  if (isStandardLayout(parsed.data)) return null;
  return { ...parsed.data, version: 1 };
}
