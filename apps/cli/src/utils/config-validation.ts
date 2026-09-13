import { Result } from "better-result";

import type { CLIInput, Database, ORM, ProjectConfig } from "../types";
import { validateWithCompatibilityEvaluator } from "./compatibility-adapter";
import { ValidationError } from "./errors";

type ValidationResult = Result<void, ValidationError>;

/**
 * Keeps the prompt-level API stable while compatibility facts live in the
 * shared evaluator.
 */
export function validateOrmDatabaseCompat(
  orm: ORM | undefined,
  database: Database | undefined,
): ValidationResult {
  return validateWithCompatibilityEvaluator({ orm, database });
}

export function validateBackendConstraints(
  config: Partial<ProjectConfig>,
  _providedFlags: Set<string>,
  options: CLIInput,
): ValidationResult {
  return validateWithCompatibilityEvaluator(config, options);
}

export function validateFullConfig(
  config: Partial<ProjectConfig>,
  _providedFlags: Set<string>,
  options: CLIInput,
): ValidationResult {
  return validateWithCompatibilityEvaluator(config, options);
}

export function validateConfigForProgrammaticUse(config: Partial<ProjectConfig>): ValidationResult {
  return validateWithCompatibilityEvaluator(config);
}
