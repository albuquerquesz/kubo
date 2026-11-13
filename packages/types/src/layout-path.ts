/**
 * Pure, platform-independent helpers for layout paths.
 *
 * Layout paths are POSIX-style, project-relative directory paths. These helpers
 * do not touch the filesystem and do not import `node:path`, so they run in the
 * browser (layout editor) and in the CLI with identical results.
 */

/** Characters allowed in a single path segment. */
const SEGMENT_PATTERN = /^[A-Za-z0-9@._-]+$/;
const RESERVED_SEGMENTS = new Set(["node_modules", ".git"]);

/** Converts `\` to `/`, drops `./` segments, empty segments and trailing slashes. */
export function normalizeLayoutPath(value: string): string {
  return value
    .replaceAll("\\", "/")
    .split("/")
    .filter((segment) => segment !== "" && segment !== ".")
    .join("/");
}

export type LayoutPathIssue =
  | "empty"
  | "absolute"
  | "parent-segment"
  | "reserved-segment"
  | "invalid-characters";

const LAYOUT_PATH_ISSUE_MESSAGES: Record<LayoutPathIssue, string> = {
  empty: "Layout path cannot be empty",
  absolute: "Layout path must be relative to the project root",
  "parent-segment": "Layout path cannot contain .. segments",
  "reserved-segment": "Layout path cannot use node_modules or .git",
  "invalid-characters": "Layout path segments may only use letters, digits, @ . _ -",
};

export function describeLayoutPathIssue(issue: LayoutPathIssue): string {
  return LAYOUT_PATH_ISSUE_MESSAGES[issue];
}

function isAbsoluteLike(value: string): boolean {
  return value.startsWith("/") || value.startsWith("\\") || /^[A-Za-z]:/.test(value);
}

/**
 * Validates a directory path. `allowRoot` accepts `.` (the project root), which is
 * valid for convention directories (`dirs`) but not for an app or package path.
 */
export function getLayoutPathIssue(
  value: string,
  { allowRoot = false }: { allowRoot?: boolean } = {},
): LayoutPathIssue | undefined {
  if (isAbsoluteLike(value)) return "absolute";

  const normalized = normalizeLayoutPath(value);
  if (normalized === "") return allowRoot && value.trim() !== "" ? undefined : "empty";

  const segments = normalized.split("/");
  if (segments.includes("..")) return "parent-segment";
  if (segments.some((segment) => RESERVED_SEGMENTS.has(segment.toLowerCase()))) {
    return "reserved-segment";
  }
  if (!segments.every((segment) => SEGMENT_PATTERN.test(segment))) return "invalid-characters";
  return undefined;
}

/** Joins a convention directory (which may be `.`) with a child name. */
export function joinLayoutPath(dir: string, name: string): string {
  const base = normalizeLayoutPath(dir);
  return base === "" ? normalizeLayoutPath(name) : `${base}/${normalizeLayoutPath(name)}`;
}

/**
 * Relative POSIX path from directory `from` to path `to`, both project-relative.
 * `relativeLayoutPath("apps/web", "packages/ui/src")` → `"../../packages/ui/src"`.
 */
export function relativeLayoutPath(from: string, to: string): string {
  const fromSegments = normalizeLayoutPath(from).split("/").filter(Boolean);
  const toSegments = normalizeLayoutPath(to).split("/").filter(Boolean);

  let shared = 0;
  while (
    shared < fromSegments.length &&
    shared < toSegments.length &&
    fromSegments[shared] === toSegments[shared]
  ) {
    shared++;
  }

  const up = fromSegments.slice(shared).map(() => "..");
  const down = toSegments.slice(shared);
  const relative = [...up, ...down].join("/");
  return relative === "" ? "." : relative;
}

/** Depth of a project-relative directory (`apps/web` → 2, `.` → 0). */
export function layoutPathDepth(value: string): number {
  const normalized = normalizeLayoutPath(value);
  return normalized === "" ? 0 : normalized.split("/").length;
}
