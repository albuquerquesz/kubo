import { createLayoutResolver } from "@kubojs/template-generator";
import { Result } from "better-result";
import type { ZodError } from "zod";

import { LAYOUT_PRESET_IDS, LayoutConfigSchema, type LayoutConfig } from "../types";
import { CLIError } from "./errors";

function formatZodIssues(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.length > 0 ? issue.path.join(".") : "layout"}: ${issue.message}`)
    .join("; ");
}

function isLayoutPreset(value: string): value is (typeof LAYOUT_PRESET_IDS)[number] {
  return LAYOUT_PRESET_IDS.some((preset) => preset === value);
}

/**
 * Parses the `--layout` flag: a preset name (`standard`, `libs`) or a JSON layout object,
 * e.g. `--layout '{"preset":"libs","apps":{"web":"web"}}'`.
 */
export function parseLayoutFlag(value: string): Result<LayoutConfig, CLIError> {
  const trimmed = value.trim();
  if (isLayoutPreset(trimmed)) return Result.ok({ version: 1, preset: trimmed });

  if (!trimmed.startsWith("{")) {
    return Result.err(
      new CLIError({
        message: `Invalid --layout "${value}". Use a preset (${LAYOUT_PRESET_IDS.join(", ")}) or a JSON layout object.`,
      }),
    );
  }

  const json = Result.try({
    try: (): unknown => JSON.parse(trimmed),
    catch: (cause) => new CLIError({ message: "Invalid --layout JSON", cause }),
  });
  if (json.isErr()) return Result.err(json.error);

  const parsed = LayoutConfigSchema.safeParse(json.value);
  if (!parsed.success) {
    return Result.err(
      new CLIError({ message: `Invalid --layout: ${formatZodIssues(parsed.error)}` }),
    );
  }
  return Result.ok(parsed.data);
}

/**
 * Validates a layout before anything is written: schema shape plus folder conflicts
 * (collisions, case-only collisions, nested folders).
 */
export function validateCreateLayout(
  layout: LayoutConfig | undefined,
): Result<LayoutConfig | undefined, CLIError> {
  if (layout === undefined) return Result.ok(undefined);

  const parsed = LayoutConfigSchema.safeParse(layout);
  if (!parsed.success) {
    return Result.err(new CLIError({ message: `Invalid layout: ${formatZodIssues(parsed.error)}` }));
  }

  const resolver = createLayoutResolver(parsed.data);
  if (resolver.isErr()) {
    return Result.err(
      new CLIError({ message: `Invalid layout: ${resolver.error.message}`, cause: resolver.error }),
    );
  }
  return Result.ok(parsed.data);
}
