import { dirname, normalize, relative } from "pathe";

const RESOLVE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".svelte",
  ".astro",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];

/** `from "x"`, `import "x"`, `import("x")` with a relative, `@/` or `$lib/` specifier. */
const SPECIFIER = /(\b(?:from|import)\s*\(?\s*)(["'])((?:\.{1,2}\/|@\/|\$lib\/)[^"'\n]*)\2/g;

export type ImportContext = {
  /** Every project path before the moves. */
  oldFiles: ReadonlySet<string>;
  /** old project path → new project path */
  moves: ReadonlyMap<string, string>;
  /** `@/` root (project path), when the app has that alias. */
  aliasRoot?: string;
  /** `$lib/` root (project path), for SvelteKit. */
  libRoot?: string;
};

function resolveOld(
  base: string,
  oldFiles: ReadonlySet<string>,
): { file: string; suffix: string } | undefined {
  for (const suffix of RESOLVE_SUFFIXES) {
    if (oldFiles.has(base + suffix)) return { file: base + suffix, suffix };
  }
  return undefined;
}

/**
 * Specifier base for a (possibly moved) file, written the way the original was: an exact path
 * stays exact, an extensionless or directory import becomes an extensionless file import.
 */
function stripResolvedSuffix(file: string, suffix: string): string {
  if (!suffix) return file;
  if (file.endsWith(suffix)) return file.slice(0, -suffix.length);
  return file.replace(/\.[^./]+$/, "");
}

function asRelative(fromDir: string, target: string): string {
  const rel = relative(fromDir, target);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/**
 * Rewrites the import specifiers of a file that was moved (`oldPath` → `newPath`) or that imports
 * a moved file. Relative specifiers stay relative and aliases stay aliases.
 */
export function rewriteImports(
  content: string,
  oldPath: string,
  newPath: string,
  context: ImportContext,
): string {
  const { oldFiles, moves, aliasRoot, libRoot } = context;
  const selfMoved = oldPath !== newPath;
  return content.replace(SPECIFIER, (whole, prefix: string, quote: string, specifier: string) => {
    const queryIndex = specifier.search(/[?#]/);
    const bare = queryIndex === -1 ? specifier : specifier.slice(0, queryIndex);
    const query = queryIndex === -1 ? "" : specifier.slice(queryIndex);

    let style: "relative" | "alias" | "lib";
    let base: string;
    if (bare.startsWith("@/")) {
      if (!aliasRoot) return whole;
      style = "alias";
      base = normalize(`${aliasRoot}/${bare.slice(2)}`);
    } else if (bare.startsWith("$lib/")) {
      if (!libRoot) return whole;
      style = "lib";
      base = normalize(`${libRoot}/${bare.slice(5)}`);
    } else {
      style = "relative";
      base = normalize(`${dirname(oldPath)}/${bare}`);
    }

    const resolved = resolveOld(base, oldFiles);
    if (!resolved) return whole;
    const target = moves.get(resolved.file);
    if (!target && !(selfMoved && style === "relative")) return whole;

    const newFile = target ?? resolved.file;
    const newBase = stripResolvedSuffix(newFile, resolved.suffix);

    let next: string;
    if (style === "alias" && aliasRoot && newBase.startsWith(`${aliasRoot}/`)) {
      next = `@/${newBase.slice(aliasRoot.length + 1)}`;
    } else if (style === "lib" && libRoot && newBase.startsWith(`${libRoot}/`)) {
      next = `$lib/${newBase.slice(libRoot.length + 1)}`;
    } else {
      next = asRelative(dirname(newPath), newBase);
    }
    return `${prefix}${quote}${next}${query}${quote}`;
  });
}
