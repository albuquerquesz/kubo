import {
  ADDONS_VALUES,
  EXAMPLES_VALUES,
  OBSERVABILITY_VALUES,
  PAYMENTS_VALUES,
  TESTING_VALUES,
  type Addons,
  type Examples,
  type ObservabilityProvider,
  type PaymentProvider,
  type Testing,
} from "@kubojs/types";

import { DEFAULT_STACK, type StackState } from "./constant";
import { normalizeStackState } from "./stack-state";

export const TASK_RUNNER_ADDONS = ["turborepo", "vite-plus"] as const;
export const LINTER_ADDONS = ["biome", "oxlint"] as const;

function normalizeValues<T extends string>(
  values: readonly string[] | string | null | undefined,
  validValues: readonly T[],
  fallback: readonly T[],
): T[] {
  const input = typeof values === "string" ? [values] : values;
  const selected = (input ?? []).flatMap((value) => {
    const validValue = validValues.find((candidate) => candidate === value);
    return validValue ? [validValue] : [];
  });
  const unique = [...new Set(selected)];
  const normalized = unique.length > 1 ? unique.filter((value) => value !== "none") : unique;
  if (normalized.length > 0) return normalized;
  const none = validValues.find((value) => value === "none");
  return none ? [none] : [...fallback];
}

function resolveMonorepoAddonConflicts(addons: readonly Addons[]): Addons[] {
  const resolved: Addons[] = [];
  const taskRunners = new Set<string>(TASK_RUNNER_ADDONS);
  const linters = new Set<string>(LINTER_ADDONS);

  for (const addon of addons) {
    if (taskRunners.has(addon)) {
      const existingIndex = resolved.findIndex((value) => taskRunners.has(value));
      if (existingIndex !== -1) resolved.splice(existingIndex, 1);
    }

    if (linters.has(addon)) {
      const existingIndex = resolved.findIndex((value) => linters.has(value));
      if (existingIndex !== -1) resolved.splice(existingIndex, 1);
    }

    if (!resolved.includes(addon)) resolved.push(addon);
  }

  return resolved;
}

export function sanitizeAddons(addons: readonly string[] | string | null | undefined): Addons[] {
  const normalized = normalizeValues(addons, ADDONS_VALUES, DEFAULT_STACK.addons);
  return resolveMonorepoAddonConflicts(normalized);
}

export function sanitizeTesting(testing: readonly string[] | string | null | undefined): Testing[] {
  return normalizeValues(testing, TESTING_VALUES, DEFAULT_STACK.testing);
}

export function sanitizeExamples(examples: readonly string[] | null | undefined): Examples[] {
  return normalizeValues(examples, EXAMPLES_VALUES, DEFAULT_STACK.examples);
}

export function sanitizeObservability(
  values: readonly string[] | string | null | undefined,
): ObservabilityProvider[] {
  return normalizeValues(values, OBSERVABILITY_VALUES, []);
}

export function sanitizePayments(
  values: readonly string[] | string | null | undefined,
): PaymentProvider[] {
  return normalizeValues(values, PAYMENTS_VALUES, []);
}

export function sanitizeStackState(value: unknown): StackState {
  const stack = normalizeStackState(value);
  if (!stack) return { ...DEFAULT_STACK };

  return {
    ...stack,
    addons: resolveMonorepoAddonConflicts(sanitizeAddons(stack.addons)),
    testing: sanitizeTesting(stack.testing),
    examples: sanitizeExamples(stack.examples),
    payments: sanitizePayments(stack.payments),
    observability: sanitizeObservability(stack.observability),
  };
}

export function sanitizeStackAddons(value: unknown): StackState {
  return sanitizeStackState(value);
}
