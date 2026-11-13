const MAX_STRING_LENGTH = 128;
const MAX_LIST_ITEMS = 20;
const MAX_LIST_ITEM_LENGTH = 64;
const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
const INVALID = Symbol("invalid analytics value");

const STRING_KEYS = [
  "database",
  "orm",
  "backend",
  "runtime",
  "auth",
  "packageManager",
  "dbSetup",
  "api",
  "webDeploy",
  "serverDeploy",
  "cli_version",
  "node_version",
  "platform",
  "install_id",
  "source",
  "mode",
  "agent",
  "error_category",
] as const;

const LIST_KEYS = ["frontend", "addons", "examples"] as const;
const BOOLEAN_KEYS = ["git", "install", "ci"] as const;
const OUTCOMES = ["success", "failure", "cancelled"] as const;
const ALLOWED_KEYS = new Set<string>([
  ...STRING_KEYS,
  ...LIST_KEYS,
  ...BOOLEAN_KEYS,
  "payments",
  "outcome",
  "duration_ms",
]);

type StringKey = (typeof STRING_KEYS)[number];
type ListKey = (typeof LIST_KEYS)[number];
type BooleanKey = (typeof BOOLEAN_KEYS)[number];
export type AnalyticsOutcome = (typeof OUTCOMES)[number];

export type AnalyticsEventPayload = Partial<Record<StringKey, string>> &
  Partial<Record<ListKey, string[]>> &
  Partial<Record<BooleanKey, boolean>> & {
    payments?: string;
    outcome?: AnalyticsOutcome;
    duration_ms?: number;
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOutcome(value: unknown): value is AnalyticsOutcome {
  return OUTCOMES.some((outcome) => outcome === value);
}

function readOptionalString(value: unknown): string | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > MAX_STRING_LENGTH) return INVALID;
  return value;
}

function readOptionalStringList(value: unknown): string[] | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length > MAX_LIST_ITEMS ||
    value.some((item) => typeof item !== "string" || item.length > MAX_LIST_ITEM_LENGTH)
  ) {
    return INVALID;
  }
  return value;
}

function readOptionalBoolean(value: unknown): boolean | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  return typeof value === "boolean" ? value : INVALID;
}

function readOptionalDuration(value: unknown): number | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) return INVALID;
  if (value < 0 || value > MAX_DURATION_MS) return INVALID;
  return Math.round(value);
}

function readPayments(value: unknown): string | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH ? INVALID : value;
  }
  const paymentList = readOptionalStringList(value);
  if (paymentList === INVALID || paymentList === undefined) return INVALID;
  return paymentList.length > 0 ? paymentList.join(",") : undefined;
}

export function parseAnalyticsEventPayload(input: unknown): AnalyticsEventPayload | null {
  if (!isRecord(input)) return null;
  if (Object.keys(input).some((key) => !ALLOWED_KEYS.has(key))) return null;

  const payload: AnalyticsEventPayload = {};

  for (const key of STRING_KEYS) {
    const value = readOptionalString(input[key]);
    if (value === INVALID) return null;
    if (value !== undefined) payload[key] = value;
  }

  for (const key of LIST_KEYS) {
    const value = readOptionalStringList(input[key]);
    if (value === INVALID) return null;
    if (value !== undefined) payload[key] = value;
  }

  for (const key of BOOLEAN_KEYS) {
    const value = readOptionalBoolean(input[key]);
    if (value === INVALID) return null;
    if (value !== undefined) payload[key] = value;
  }

  const payments = readPayments(input.payments);
  if (payments === INVALID) return null;
  if (payments !== undefined) payload.payments = payments;

  if (input.outcome !== undefined) {
    if (!isOutcome(input.outcome)) return null;
    payload.outcome = input.outcome;
  }

  const durationMs = readOptionalDuration(input.duration_ms);
  if (durationMs === INVALID) return null;
  if (durationMs !== undefined) payload.duration_ms = durationMs;

  return payload;
}
