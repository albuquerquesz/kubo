import path from "node:path";

import { normalizePayments } from "@kubojs/types";
import { Result } from "better-result";

import type {
  API,
  Auth,
  Backend,
  CLIInput,
  Database,
  DatabaseSetup,
  Observability,
  Communication,
  ORM,
  PackageManager,
  ProjectConfig,
  Runtime,
  ServerDeploy,
  WebDeploy,
} from "../types";
import { ValidationError } from "./errors";

export function processArrayOption<T>(options: (T | "none")[] | undefined) {
  if (!options || options.length === 0) return [];
  if (options.includes("none" as T | "none")) return [];
  return options.filter((item): item is T => item !== "none");
}

export function deriveProjectName(projectName?: string, projectDirectory?: string) {
  if (projectName) {
    return projectName;
  }
  if (projectDirectory) {
    return path.basename(path.resolve(process.cwd(), projectDirectory));
  }
  return "";
}

export function processFlags(options: CLIInput, projectName?: string) {
  const config: Partial<ProjectConfig> = {};

  if (options.api) {
    config.api = options.api as API;
  }

  if (options.addonOptions) {
    config.addonOptions = options.addonOptions;
  }

  if (options.dbSetupOptions) {
    config.dbSetupOptions = options.dbSetupOptions;
  }

  if (options.backend) {
    config.backend = options.backend as Backend;
  }

  if (options.database) {
    config.database = options.database as Database;
  }

  if (options.orm) {
    config.orm = options.orm as ORM;
  }

  if (options.auth !== undefined) {
    config.auth = options.auth as Auth;
  }

  if (options.payments !== undefined) {
    config.payments = normalizePayments(options.payments);
  }

  if (options.observability !== undefined)
    config.observability = normalizeObservability(options.observability);
  if (options.disableObservability) config.observability = [];

  if (options.communication !== undefined) {
    config.communication = options.communication as Communication;
  }

  if (options.git !== undefined) {
    config.git = options.git;
  }

  if (options.install !== undefined) {
    config.install = options.install;
  }

  if (options.runtime) {
    config.runtime = options.runtime as Runtime;
  }

  if (options.dbSetup) {
    config.dbSetup = options.dbSetup as DatabaseSetup;
  }

  if (options.packageManager) {
    config.packageManager = options.packageManager as PackageManager;
  }

  if (options.webDeploy) {
    config.webDeploy = options.webDeploy as WebDeploy;
  }

  if (options.serverDeploy) {
    config.serverDeploy = options.serverDeploy as ServerDeploy;
  }

  const derivedName = deriveProjectName(projectName, options.projectDirectory);
  if (derivedName) {
    config.projectName = projectName || derivedName;
  }

  if (options.frontend && options.frontend.length > 0) {
    config.frontend = processArrayOption(options.frontend);
  }

  if (options.addons && options.addons.length > 0) {
    config.addons = processArrayOption(options.addons);
  }

  if (options.examples && options.examples.length > 0) {
    config.examples = processArrayOption(options.examples);
  }

  if (options.testing && options.testing.length > 0) {
    config.testing = processArrayOption(options.testing);
  }

  return config;
}

export function normalizeObservability(value: unknown): Observability {
  if (value === "none" || value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      values.filter(
        (item): item is Observability[number] => item === "getmonitor" || item === "himetrica",
      ),
    ),
  ];
}

export function getProvidedFlags(options: CLIInput) {
  return new Set(
    Object.keys(options).filter((key) => options[key as keyof CLIInput] !== undefined),
  );
}

function validateNoneExclusivity<T>(
  options: (T | "none")[] | undefined,
  optionName: string,
): Result<void, ValidationError> {
  if (!options || options.length === 0) return Result.ok(undefined);

  if (options.includes("none" as T | "none") && options.length > 1) {
    return Result.err(
      new ValidationError({
        message: `Cannot combine 'none' with other ${optionName}.`,
      }),
    );
  }
  return Result.ok(undefined);
}

export function validateArrayOptions(options: CLIInput): Result<void, ValidationError> {
  if (options.disableObservability && options.observability !== undefined) {
    return Result.err(
      new ValidationError({
        message: "Cannot combine '--disable-observability' with '--observability'.",
      }),
    );
  }

  const frontendResult = validateNoneExclusivity(options.frontend, "frontend options");
  if (frontendResult.isErr()) return frontendResult;

  const addonsResult = validateNoneExclusivity(options.addons, "addons");
  if (addonsResult.isErr()) return addonsResult;

  const examplesResult = validateNoneExclusivity(options.examples, "examples");
  if (examplesResult.isErr()) return examplesResult;

  const testingResult = validateNoneExclusivity(options.testing, "testing");
  if (testingResult.isErr()) return testingResult;

  return Result.ok(undefined);
}
