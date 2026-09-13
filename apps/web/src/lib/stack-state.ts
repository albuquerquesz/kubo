import {
  ADDONS_VALUES,
  API_VALUES,
  AUTH_VALUES,
  BACKEND_VALUES,
  COMMUNICATION_VALUES,
  DATABASE_SETUP_VALUES,
  DATABASE_VALUES,
  EXAMPLES_VALUES,
  isFrontend,
  isNativeFrontend,
  isWebFrontend,
  ORM_VALUES,
  PACKAGE_MANAGER_VALUES,
  PAYMENTS_VALUES,
  ProjectConfigDraftSchema,
  RUNTIME_VALUES,
  SERVER_DEPLOY_VALUES,
  TESTING_VALUES,
  WEB_DEPLOY_VALUES,
  type Frontend,
  type ProjectConfig,
} from "@kubojs/types";

import { DEFAULT_STACK, type StackState } from "./constant";

export type FrontendCategory = "webFrontend" | "nativeFrontend";

type UnknownRecord = Record<string, unknown>;

const LEGACY_SELF_FRONTENDS = {
  "self-next": "next",
  "self-tanstack-start": "tanstack-start",
  "self-nuxt": "nuxt",
  "self-svelte": "svelte",
  "self-astro": "astro",
} as const satisfies Record<string, Frontend>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readStrings(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return values.filter((item): item is string => typeof item === "string");
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function selectValue<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  if (typeof value !== "string") return fallback;
  return values.find((candidate) => candidate === value) ?? fallback;
}

function selectValues<T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: readonly T[] = [],
): T[] {
  if (value == null) return [...fallback];

  const selected: T[] = [];
  for (const candidate of readStrings(value)) {
    const valueFromCatalog = values.find((item) => item === candidate);
    if (valueFromCatalog && !selected.includes(valueFromCatalog)) {
      selected.push(valueFromCatalog);
    }
  }
  return selected;
}

function normalizeFrontends(raw: UnknownRecord): Frontend[] {
  const legacyFrontends = [...readStrings(raw.webFrontend), ...readStrings(raw.nativeFrontend)];
  const canonicalFrontends = readStrings(raw.frontend);
  const selected = selectValues(
    canonicalFrontends.length > 0 ? canonicalFrontends : legacyFrontends,
    [
      "tanstack-router",
      "react-router",
      "tanstack-start",
      "next",
      "nuxt",
      "native-bare",
      "native-uniwind",
      "native-unistyles",
      "svelte",
      "solid",
      "astro",
      "none",
    ] as const,
  );

  const backend = typeof raw.backend === "string" ? raw.backend : "";
  const legacySelfFrontend = Object.entries(LEGACY_SELF_FRONTENDS).find(
    ([legacyBackend]) => legacyBackend === backend,
  )?.[1];
  if (legacySelfFrontend && !selected.includes(legacySelfFrontend)) {
    selected.push(legacySelfFrontend);
  }

  const actualFrontends = selected.filter((frontend) => frontend !== "none");
  if (actualFrontends.length > 0) return actualFrontends;
  return selected.length > 0 ? ["none"] : [...DEFAULT_STACK.frontend];
}

function normalizeBackend(value: unknown): StackState["backend"] {
  if (
    typeof value === "string" &&
    Object.keys(LEGACY_SELF_FRONTENDS).some((legacyBackend) => legacyBackend === value)
  ) {
    return "self";
  }
  return selectValue(value, BACKEND_VALUES, DEFAULT_STACK.backend);
}

export function normalizeStackState(value: unknown): StackState | null {
  const raw = asRecord(value);
  if (!raw) return null;

  const draft = {
    projectName:
      typeof raw.projectName === "string" && raw.projectName.length > 0
        ? raw.projectName
        : DEFAULT_STACK.projectName,
    database: selectValue(raw.database, DATABASE_VALUES, DEFAULT_STACK.database),
    orm: selectValue(raw.orm, ORM_VALUES, DEFAULT_STACK.orm),
    backend: normalizeBackend(raw.backend),
    runtime: selectValue(raw.runtime, RUNTIME_VALUES, DEFAULT_STACK.runtime),
    frontend: normalizeFrontends(raw),
    addons: selectValues(raw.addons, ADDONS_VALUES, DEFAULT_STACK.addons),
    examples: selectValues(raw.examples, EXAMPLES_VALUES, DEFAULT_STACK.examples),
    testing: selectValues(raw.testing, TESTING_VALUES, DEFAULT_STACK.testing),
    auth: selectValue(raw.auth, AUTH_VALUES, DEFAULT_STACK.auth),
    payments: selectValues(raw.payments, PAYMENTS_VALUES),
    observability: selectValues(
      raw.observability,
      ["getmonitor", "himetrica"] as const,
      DEFAULT_STACK.observability,
    ),
    communication: selectValue(
      raw.communication,
      COMMUNICATION_VALUES,
      DEFAULT_STACK.communication,
    ),
    git: readBoolean(raw.git, DEFAULT_STACK.git),
    packageManager: selectValue(
      raw.packageManager,
      PACKAGE_MANAGER_VALUES,
      DEFAULT_STACK.packageManager,
    ),
    install: readBoolean(raw.install, DEFAULT_STACK.install),
    dbSetup: selectValue(raw.dbSetup, DATABASE_SETUP_VALUES, DEFAULT_STACK.dbSetup),
    api: selectValue(raw.api, API_VALUES, DEFAULT_STACK.api),
    webDeploy: selectValue(raw.webDeploy, WEB_DEPLOY_VALUES, DEFAULT_STACK.webDeploy),
    serverDeploy: selectValue(raw.serverDeploy, SERVER_DEPLOY_VALUES, DEFAULT_STACK.serverDeploy),
  };

  const parsed = ProjectConfigDraftSchema.safeParse(draft);
  if (!parsed.success) return null;

  return {
    ...parsed.data,
    yolo: readBoolean(raw.yolo, DEFAULT_STACK.yolo),
  };
}

export function getFrontendSelection(
  frontends: readonly Frontend[],
  category: FrontendCategory,
): Frontend[] {
  const selected = frontends.filter(category === "webFrontend" ? isWebFrontend : isNativeFrontend);
  return selected.length > 0 ? selected : ["none"];
}

export function replaceFrontendSelection(
  frontends: readonly Frontend[],
  category: FrontendCategory,
  selection: readonly string[],
): Frontend[] {
  const isCategoryFrontend = category === "webFrontend" ? isWebFrontend : isNativeFrontend;
  const retained = frontends.filter((frontend) => !isCategoryFrontend(frontend));
  const selected = selection.filter(isFrontend).filter((frontend) => frontend !== "none");
  const next = [...retained, ...selected].filter(
    (frontend, index, all) => all.indexOf(frontend) === index,
  );
  return next.length > 0 ? next : ["none"];
}

export function stackStateToProjectConfig(stack: StackState): ProjectConfig {
  const { yolo: ignoredYolo, ...draft } = stack;
  void ignoredYolo;
  return {
    ...draft,
    projectDir: "/virtual",
    relativePath: "./virtual",
  };
}
