import {
  backendAllowsAiExample,
  backendAllowsApi,
  backendAllowsOnlyNoneApi,
  getCommunicationCompatibilityIssue,
  evaluate,
  CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS,
  WEB_FRONTENDS_REQUIRING_ORPC,
  isCommunicationProvider,
} from "@kubojs/types";
import { Result } from "better-result";

import type {
  Addons,
  API,
  Auth,
  Backend,
  Frontend,
  Examples,
  Payments,
  Communication,
  ProjectConfig,
  Runtime,
  ServerDeploy,
  Testing,
  WebDeploy,
} from "../types";
import { WEB_FRAMEWORKS } from "./compatibility";
import {
  getCompatibilityValidationMessage,
  validateWithCompatibilityEvaluator,
} from "./compatibility-adapter";
import { ValidationError } from "./errors";

type ValidationResult = Result<void, ValidationError>;
type AddonCompatibilityConfig = Pick<ProjectConfig, "frontend" | "auth" | "backend" | "runtime">;
const TASK_RUNNER_ADDONS: readonly Addons[] = ["turborepo", "vite-plus"];
/** Mutually exclusive code-quality linters (one slot). */
export const LINTER_ADDONS: readonly Addons[] = ["biome", "oxlint"];

export function isLinterAddon(addon: string): boolean {
  return LINTER_ADDONS.some((value) => value === addon);
}

/**
 * When adding a code-quality linter, drop sibling linters so only one remains.
 * Last-selected linter wins. Task runners stay validation-only (reject on dual).
 */
export function mergeAddonsExclusive(
  existingAddons: readonly Addons[],
  addonsToAdd: readonly Addons[],
): { updatedAddons: Addons[]; removedAddons: Addons[] } {
  const removed = new Set<Addons>();
  let result = [...existingAddons];

  for (const addon of addonsToAdd) {
    if (LINTER_ADDONS.includes(addon)) {
      for (const current of result) {
        if (LINTER_ADDONS.includes(current) && current !== addon) {
          removed.add(current);
        }
      }
      result = result.filter((current) => !LINTER_ADDONS.includes(current) || current === addon);
    }

    if (!result.includes(addon) && addon !== "none") {
      result.push(addon);
    }
  }

  return { updatedAddons: result, removedAddons: [...removed] };
}
export {
  CONVEX_BETTER_AUTH_INCOMPATIBLE_FRONTENDS,
  CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS,
} from "@kubojs/types";

export function isWebFrontend(value: Frontend) {
  return WEB_FRAMEWORKS.includes(value);
}

export function isPlaywrightAllowed(frontends: Frontend[] = []) {
  return frontends.some((frontend) => isWebFrontend(frontend));
}

export function validateTestingAgainstFrontends(
  testing: Testing[] = [],
  frontends: Frontend[] = [],
): ValidationResult {
  return validateWithCompatibilityEvaluator({ testing, frontend: frontends }, undefined, [
    "testing-frontend",
  ]);
}

export function splitFrontends(values: Frontend[] = []): {
  web: Frontend[];
  native: Frontend[];
} {
  const web = values.filter((f) => isWebFrontend(f));
  const native = values.filter(
    (f) => f === "native-bare" || f === "native-uniwind" || f === "native-unistyles",
  );
  return { web, native };
}

export function validateApiFrontendCompatibility(
  api: API | undefined,
  frontends: Frontend[] = [],
): ValidationResult {
  return validateWithCompatibilityEvaluator({ api, frontend: frontends }, undefined, [
    "api-frontend",
  ]);
}

export function isFrontendAllowedWithBackend(
  frontend: Frontend,
  backend?: ProjectConfig["backend"],
  auth?: Auth,
) {
  const issueCodes = evaluate({ backend, auth, frontend: [frontend] }).issues.map(
    ({ code }) => code,
  );
  return !issueCodes.some((code) =>
    [
      "backend-convex-frontend",
      "backend-convex-better-auth-frontend",
      "backend-self-frontend",
      "auth-frontend",
    ].includes(code),
  );
}

export function supportsConvexBetterAuth(frontends: readonly Frontend[] = []) {
  return frontends.some((frontend) =>
    CONVEX_BETTER_AUTH_SUPPORTED_FRONTENDS.some((supported) => supported === frontend),
  );
}

export function allowedApisForFrontends(
  frontends: Frontend[] = [],
  backend?: ProjectConfig["backend"],
) {
  if (backendAllowsOnlyNoneApi(backend)) return ["none"] as const;

  const supportsTrpc = !frontends.some((frontend) =>
    WEB_FRONTENDS_REQUIRING_ORPC.includes(frontend),
  );
  const base: API[] = ["trpc", "orpc", "orval", "none"];
  return base.filter(
    (api) => (api !== "trpc" || supportsTrpc) && isApiCompatibleWithBackend(api, backend),
  );
}

export function isApiCompatibleWithBackend(
  api: API | undefined,
  backend?: ProjectConfig["backend"],
): boolean {
  return api !== "orval" || backendAllowsApi(backend, "orval");
}

export function isExampleTodoAllowed(
  backend?: ProjectConfig["backend"],
  database?: ProjectConfig["database"],
  api?: API,
) {
  return !evaluate({ backend, database, api, examples: ["todo"] }).issues.some(({ code }) =>
    ["example-todo-database", "example-todo-api", "example-todo-orval"].includes(code),
  );
}

export function isExampleAIAllowedForBackend(
  backend: ProjectConfig["backend"] | undefined,
  example: string,
): boolean {
  return example !== "ai" || backendAllowsAiExample(backend);
}

export function isExampleAIAllowed(backend?: ProjectConfig["backend"], frontends: Frontend[] = []) {
  return !evaluate({ backend, frontend: frontends, examples: ["ai"] }).issues.some(({ code }) =>
    ["example-ai-frontend", "example-ai-backend"].includes(code),
  );
}

export function validateWebDeployRequiresWebFrontend(
  webDeploy: WebDeploy | undefined,
  hasWebFrontendFlag: boolean,
): ValidationResult {
  return hasWebFrontendFlag
    ? Result.ok(undefined)
    : validateWithCompatibilityEvaluator({ webDeploy, frontend: [] }, undefined, [
        "web-deploy-frontend",
      ]);
}

export function validateServerDeployRequiresBackend(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
): ValidationResult {
  return validateWithCompatibilityEvaluator({ serverDeploy, backend }, undefined, [
    "server-deploy-backend",
  ]);
}

/**
 * Validates server deploys that require a separate server application.
 * Cloudflare is validated by the Workers-specific rules below this layer.
 */
export function validateServerDeploy(
  serverDeploy: ServerDeploy | undefined,
  backend: Backend | undefined,
  runtime: Runtime | undefined,
): ValidationResult {
  return validateWithCompatibilityEvaluator({ serverDeploy, backend, runtime }, undefined, [
    "server-deploy-backend",
    "server-deploy-runtime",
  ]);
}

export function validateDockerWebDeployDesktopAddons(
  webDeploy: WebDeploy | undefined,
  addons: Addons[] | undefined,
  frontend: Frontend[] | undefined,
  backend: Backend | undefined,
  auth: Auth | undefined,
): ValidationResult {
  return validateWithCompatibilityEvaluator(
    { webDeploy, addons, frontend, backend, auth },
    undefined,
    ["web-deploy-desktop-addon"],
  );
}

export function validateAddonCompatibility(
  addon: Addons,
  frontend: Frontend[],
  auth?: Auth,
  backend?: Backend,
  _runtime?: Runtime,
): { isCompatible: boolean; reason?: string } {
  const issue = evaluate({ addons: [addon], frontend, auth, backend }).issues.find(({ code }) =>
    ["addon-task-runner", "addon-linter", "addon-frontend", "addon-backend", "addon-auth"].includes(
      code,
    ),
  );
  return issue
    ? {
        isCompatible: false,
        reason: getCompatibilityValidationMessage(issue, {
          addons: [addon],
          frontend,
          auth,
          backend,
        }),
      }
    : { isCompatible: true };
}

export function getCompatibleAddons(
  allAddons: Addons[],
  frontend: Frontend[],
  existingAddons: Addons[] = [],
  auth?: Auth,
  backend?: Backend,
  runtime?: Runtime,
) {
  return allAddons.filter((addon) => {
    if (existingAddons.includes(addon)) return false;

    if (addon === "none") return false;

    if (
      TASK_RUNNER_ADDONS.includes(addon) &&
      existingAddons.some((existingAddon) => TASK_RUNNER_ADDONS.includes(existingAddon))
    ) {
      return false;
    }

    const { isCompatible } = validateAddonCompatibility(addon, frontend, auth, backend, runtime);
    return isCompatible;
  });
}

export function validateAddonsAgainstFrontends(
  addons: Addons[] = [],
  frontends: Frontend[] = [],
  auth?: Auth,
  backend?: Backend,
  runtime?: Runtime,
): ValidationResult {
  return validateWithCompatibilityEvaluator(
    { addons, frontend: frontends, auth, backend, runtime },
    undefined,
    ["addon-task-runner", "addon-linter", "addon-frontend", "addon-backend", "addon-auth"],
  );
}

export function validateAddonsAgainstConfig(
  addons: Addons[] = [],
  config: Partial<AddonCompatibilityConfig>,
): ValidationResult {
  return validateAddonsAgainstFrontends(
    addons,
    config.frontend ?? [],
    config.auth,
    config.backend,
    config.runtime,
  );
}

export function validateCommunicationCompatibility(
  communication: Communication | undefined,
  backend: Backend | undefined,
  runtime?: Runtime,
  serverDeploy?: ServerDeploy,
): ValidationResult {
  if (!isCommunicationProvider(communication)) return Result.ok(undefined);
  const issue = getCommunicationCompatibilityIssue({
    provider: communication,
    backend,
    runtime,
    serverDeploy,
  });
  if (!issue) return Result.ok(undefined);
  if (issue === "workers-unsupported") {
    return Result.err(
      new ValidationError({
        message:
          "AraraHQ requires the official Node SDK and is not compatible with Edge/Workers runtimes. Use a Node/Bun server deployment or Convex Node Action.",
      }),
    );
  }
  const providerName =
    communication === "resend" ? "Resend" : communication === "notifique" ? "Notifique" : "AraraHQ";
  return Result.err(
    new ValidationError({
      message: `${providerName} communication requires a server backend. Please choose a backend or use '--communication none'.`,
    }),
  );
}

export function validatePaymentsCompatibility(
  payments: Payments | undefined,
  auth: Auth | undefined,
  backend: Backend | undefined,
  frontends: Frontend[] = [],
  orm?: ProjectConfig["orm"],
  database?: ProjectConfig["database"],
): ValidationResult {
  return validateWithCompatibilityEvaluator(
    { payments, auth, backend, frontend: frontends, orm, database },
    undefined,
    ["payment"],
  );
}

export function validateExamplesCompatibility(
  examples: Examples[] | undefined,
  backend: ProjectConfig["backend"] | undefined,
  database: ProjectConfig["database"] | undefined,
  frontend?: Frontend[],
  api?: API,
): ValidationResult {
  return validateWithCompatibilityEvaluator(
    { examples, backend, database, frontend, api },
    undefined,
    [
      "example-todo-database",
      "example-todo-api",
      "example-todo-orval",
      "example-ai-frontend",
      "example-ai-backend",
    ],
  );
}
