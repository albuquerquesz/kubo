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

const DEFAULT_KUBO_API_URL = "https://kubojs.dev";
const REDEEM_TIMEOUT_MS = 10_000;

function getRedeemUrl(): string {
  const base = process.env.KUBO_API_URL?.replace(/\/$/, "") || DEFAULT_KUBO_API_URL;
  return `${base}/api/layout/redeem`;
}

/**
 * Exchanges a single-use code from kubojs.dev for the layout saved in the account. The code
 * is consumed on success; it is never logged or sent to telemetry.
 */
export async function redeemLayoutCode(code: string): Promise<Result<LayoutConfig, CLIError>> {
  const response = await Result.tryPromise({
    try: () =>
      fetch(getRedeemUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        signal: AbortSignal.timeout(REDEEM_TIMEOUT_MS),
      }),
    catch: (cause) =>
      new CLIError({
        message: "Could not reach kubojs.dev to redeem the layout code. Check your connection.",
        cause,
      }),
  });
  if (response.isErr()) return Result.err(response.error);

  if (response.value.status === 400 || response.value.status === 404) {
    return Result.err(
      new CLIError({
        message:
          "This layout code is invalid, expired or was already used. Generate a new one in the Layout tab at kubojs.dev/new.",
      }),
    );
  }
  if (!response.value.ok) {
    return Result.err(
      new CLIError({ message: `Layout code redemption failed (HTTP ${response.value.status}).` }),
    );
  }

  const body = await Result.tryPromise({
    try: async (): Promise<unknown> => response.value.json(),
    catch: (cause) => new CLIError({ message: "Invalid response while redeeming the layout code", cause }),
  });
  if (body.isErr()) return Result.err(body.error);

  const layout =
    typeof body.value === "object" && body.value !== null && "layout" in body.value
      ? body.value.layout
      : undefined;
  const parsed = LayoutConfigSchema.safeParse(layout);
  if (!parsed.success) {
    return Result.err(new CLIError({ message: "The redeemed layout is not valid." }));
  }
  return Result.ok(parsed.data);
}
