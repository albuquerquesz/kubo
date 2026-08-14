import { DEFAULT_STACK, type StackState, TECH_OPTIONS } from "./constant";

const validWebFrontendIds = new Set(TECH_OPTIONS.webFrontend.map((option) => option.id));
const validNativeFrontendIds = new Set(TECH_OPTIONS.nativeFrontend.map((option) => option.id));
const validAddonIds = new Set(["none", ...TECH_OPTIONS.addons.map((option) => option.id)]);
const validTestingIds = new Set(["none", ...TECH_OPTIONS.testing.map((option) => option.id)]);
const validExampleIds = new Set(["none", ...TECH_OPTIONS.examples.map((option) => option.id)]);
const validObservabilityIds = new Set(TECH_OPTIONS.observability.map((option) => option.id));
const validPaymentIds = new Set(TECH_OPTIONS.payments.map((option) => option.id));

export const TASK_RUNNER_ADDONS = ["nx", "turborepo", "vite-plus"] as const;
export const LINTER_ADDONS = ["biome", "oxlint", "ultracite"] as const;

function sanitizeSingleSelection(
  values: readonly string[] | null | undefined,
  validIds: ReadonlySet<string>,
  defaultValue: readonly string[],
): string[] {
  if (values == null) {
    return [...defaultValue];
  }

  const selectedValue = values.filter((value) => validIds.has(value) && value !== "none").at(-1);
  return selectedValue ? [selectedValue] : ["none"];
}

function sanitizeMultiSelection(
  values: readonly string[] | null | undefined,
  validIds: ReadonlySet<string>,
  defaultValue: readonly string[],
): string[] {
  if (values == null) {
    return [...defaultValue];
  }

  const sanitized = values.filter((value) => validIds.has(value));
  const normalized =
    sanitized.length > 1 ? sanitized.filter((value) => value !== "none") : sanitized;
  const unique = [...new Set(normalized)];

  return unique.length > 0 ? unique : ["none"];
}

function resolveMonorepoAddonConflicts(addons: readonly string[]): string[] {
  const resolved: string[] = [];
  const taskRunners = new Set<string>(TASK_RUNNER_ADDONS);
  const linters = new Set<string>(LINTER_ADDONS);

  for (const addon of addons) {
    if (taskRunners.has(addon)) {
      const existingMonorepoIndex = resolved.findIndex((value) => taskRunners.has(value));

      if (existingMonorepoIndex !== -1) {
        resolved.splice(existingMonorepoIndex, 1);
      }
    }

    if (linters.has(addon)) {
      const existingLinterIndex = resolved.findIndex((value) => linters.has(value));

      if (existingLinterIndex !== -1) {
        resolved.splice(existingLinterIndex, 1);
      }
    }

    if (!resolved.includes(addon)) {
      resolved.push(addon);
    }
  }

  return resolved;
}

export function sanitizeAddons(addons: readonly string[] | null | undefined): string[] {
  const sanitized = sanitizeMultiSelection(addons, validAddonIds, DEFAULT_STACK.addons);
  return resolveMonorepoAddonConflicts(sanitized);
}

export function sanitizeTesting(testing: readonly string[] | null | undefined): string[] {
  return sanitizeMultiSelection(testing, validTestingIds, DEFAULT_STACK.testing);
}

export function sanitizeExamples(examples: readonly string[] | null | undefined): string[] {
  return sanitizeMultiSelection(examples, validExampleIds, DEFAULT_STACK.examples);
}

export function sanitizeObservability(
  values: readonly string[] | string | null | undefined,
): string[] {
  if (values == null) return [...DEFAULT_STACK.observability];
  const normalized = typeof values === "string" ? [values] : values;
  return [...new Set(normalized.filter((value) => validObservabilityIds.has(value)))];
}

export function sanitizePayments(values: readonly string[] | string | null | undefined): string[] {
  if (values == null) return [...DEFAULT_STACK.payments];
  const normalized = typeof values === "string" ? [values] : values;
  return [...new Set(normalized.filter((value) => value !== "none" && validPaymentIds.has(value)))];
}

export function sanitizeWebFrontends(webFrontend: readonly string[] | null | undefined): string[] {
  return sanitizeSingleSelection(webFrontend, validWebFrontendIds, DEFAULT_STACK.webFrontend);
}

export function sanitizeNativeFrontends(
  nativeFrontend: readonly string[] | null | undefined,
): string[] {
  return sanitizeSingleSelection(
    nativeFrontend,
    validNativeFrontendIds,
    DEFAULT_STACK.nativeFrontend,
  );
}

export function sanitizeStackState(stack: StackState): StackState {
  return {
    ...stack,
    webFrontend: sanitizeWebFrontends(stack.webFrontend),
    nativeFrontend: sanitizeNativeFrontends(stack.nativeFrontend),
    addons: sanitizeAddons(stack.addons),
    testing: sanitizeTesting(stack.testing),
    examples: sanitizeExamples(stack.examples),
    payments: sanitizePayments(stack.payments),
    observability: sanitizeObservability(stack.observability),
  };
}

export function sanitizeStackAddons(stack: StackState): StackState {
  return sanitizeStackState(stack);
}
