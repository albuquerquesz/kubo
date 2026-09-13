import { evaluate, normalizePayments, type CompatibilityIssueCode } from "@kubojs/types";

import type { ProjectConfig } from "../../src/types";

export type MatrixRule = CompatibilityIssueCode;

export interface MatrixOracleResult {
  valid: boolean;
  rules: readonly MatrixRule[];
}

function toCompatibilityConfig(config: ProjectConfig) {
  return {
    backend: config.backend,
    runtime: config.runtime,
    database: config.database,
    orm: config.orm,
    frontend: config.frontend,
    api: config.api,
    auth: config.auth,
    payments: normalizePayments(config.payments),
    addons: config.addons,
    testing: config.testing,
    examples: config.examples,
    dbSetup: config.dbSetup,
    webDeploy: config.webDeploy,
    serverDeploy: config.serverDeploy,
    communication: config.communication,
  };
}

export function evaluateMatrixConfig(config: ProjectConfig): MatrixOracleResult {
  const evaluation = evaluate(toCompatibilityConfig(config));
  const rules = [...new Set(evaluation.issues.map(({ code }) => code))];

  return {
    valid: evaluation.valid,
    rules,
  };
}

export function formatMatrixConfig(config: ProjectConfig) {
  return JSON.stringify(
    {
      database: config.database,
      orm: config.orm,
      backend: config.backend,
      runtime: config.runtime,
      frontend: config.frontend,
      api: config.api,
      auth: config.auth,
      payments: config.payments,
      dbSetup: config.dbSetup,
      webDeploy: config.webDeploy,
      serverDeploy: config.serverDeploy,
      examples: config.examples,
    },
    null,
    2,
  );
}
