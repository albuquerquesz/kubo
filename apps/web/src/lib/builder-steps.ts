/** The stack builder is split in two pages that share the same URL query (the stack state). */
export type BuilderStep = "stack" | "layout";

export const BUILDER_STEP_PATHS: Record<BuilderStep, string> = {
  stack: "/new",
  layout: "/new/layout",
};

/**
 * Query key of the old in-page tabs (`?view=layout` / `?view=preview`). Those links are
 * redirected to `/new/layout` in `next.config.ts`; the key is dropped when moving between steps.
 */
export const LEGACY_VIEW_QUERY_KEY = "view";

/** Href of a builder step that keeps the current stack query. */
export function builderStepHref(step: BuilderStep, search: string | URLSearchParams = ""): string {
  const params = new URLSearchParams(search);
  params.delete(LEGACY_VIEW_QUERY_KEY);
  const query = params.toString();
  const path = BUILDER_STEP_PATHS[step];
  return query ? `${path}?${query}` : path;
}
