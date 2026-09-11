const MAX_STRING_LENGTH = 128;
const MAX_LIST_ITEMS = 20;
const MAX_LIST_ITEM_LENGTH = 64;
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
] as const;

const LIST_KEYS = ["frontend", "addons", "examples"] as const;
const BOOLEAN_KEYS = ["git", "install"] as const;
const ALLOWED_KEYS = new Set<string>([...STRING_KEYS, ...LIST_KEYS, ...BOOLEAN_KEYS, "payments"]);

export type AnalyticsEventPayload = {
  database?: string;
  orm?: string;
  backend?: string;
  runtime?: string;
  frontend?: string[];
  addons?: string[];
  examples?: string[];
  auth?: string;
  payments?: string;
  git?: boolean;
  packageManager?: string;
  install?: boolean;
  dbSetup?: string;
  api?: string;
  webDeploy?: string;
  serverDeploy?: string;
  cli_version?: string;
  node_version?: string;
  platform?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function parseAnalyticsEventPayload(input: unknown): AnalyticsEventPayload | null {
  if (!isRecord(input)) return null;
  if (Object.keys(input).some((key) => !ALLOWED_KEYS.has(key))) return null;

  const database = readOptionalString(input.database);
  const orm = readOptionalString(input.orm);
  const backend = readOptionalString(input.backend);
  const runtime = readOptionalString(input.runtime);
  const auth = readOptionalString(input.auth);
  const packageManager = readOptionalString(input.packageManager);
  const dbSetup = readOptionalString(input.dbSetup);
  const api = readOptionalString(input.api);
  const webDeploy = readOptionalString(input.webDeploy);
  const serverDeploy = readOptionalString(input.serverDeploy);
  const cliVersion = readOptionalString(input.cli_version);
  const nodeVersion = readOptionalString(input.node_version);
  const platform = readOptionalString(input.platform);

  if (
    database === INVALID ||
    orm === INVALID ||
    backend === INVALID ||
    runtime === INVALID ||
    auth === INVALID ||
    packageManager === INVALID ||
    dbSetup === INVALID ||
    api === INVALID ||
    webDeploy === INVALID ||
    serverDeploy === INVALID ||
    cliVersion === INVALID ||
    nodeVersion === INVALID ||
    platform === INVALID
  ) {
    return null;
  }

  const frontend = readOptionalStringList(input.frontend);
  const addons = readOptionalStringList(input.addons);
  const examples = readOptionalStringList(input.examples);
  if (frontend === INVALID || addons === INVALID || examples === INVALID) return null;

  const git = readOptionalBoolean(input.git);
  const install = readOptionalBoolean(input.install);
  if (git === INVALID || install === INVALID) return null;

  const payments = input.payments;
  let normalizedPayments: string | undefined;
  if (payments !== undefined) {
    if (typeof payments === "string") {
      if (payments.length > MAX_STRING_LENGTH) return null;
      normalizedPayments = payments;
    } else {
      const paymentList = readOptionalStringList(payments);
      if (paymentList === INVALID || paymentList === undefined) return null;
      normalizedPayments = paymentList.length > 0 ? paymentList.join(",") : undefined;
    }
  }

  return {
    database,
    orm,
    backend,
    runtime,
    frontend,
    addons,
    examples,
    auth,
    payments: normalizedPayments,
    git,
    packageManager,
    install,
    dbSetup,
    api,
    webDeploy,
    serverDeploy,
    cli_version: cliVersion,
    node_version: nodeVersion,
    platform,
  };
}
