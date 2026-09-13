import {
  createLoader,
  createSerializer,
  parseAsArrayOf as parseAsArrayOfServer,
  parseAsBoolean as parseAsBooleanServer,
  parseAsString as parseAsStringServer,
  type UrlKeys,
} from "nuqs/server";

import { DEFAULT_STACK, type StackState } from "@/lib/constant";
import { sanitizeStackState } from "@/lib/sanitize-stack-addons";
import { stackUrlKeys } from "@/lib/stack-url-keys";

const legacyFrontendUrlKeys = {
  legacyWebFrontend: "fe-w",
  legacyNativeFrontend: "fe-n",
} as const;

const allStackUrlKeys = { ...stackUrlKeys, ...legacyFrontendUrlKeys };

const canonicalServerStackParsers = {
  projectName: parseAsStringServer.withDefault(DEFAULT_STACK.projectName),
  frontend: parseAsArrayOfServer(parseAsStringServer).withDefault([]),
  runtime: parseAsStringServer.withDefault(DEFAULT_STACK.runtime),
  backend: parseAsStringServer.withDefault(DEFAULT_STACK.backend),
  api: parseAsStringServer.withDefault(DEFAULT_STACK.api),
  database: parseAsStringServer.withDefault(DEFAULT_STACK.database),
  orm: parseAsStringServer.withDefault(DEFAULT_STACK.orm),
  dbSetup: parseAsStringServer.withDefault(DEFAULT_STACK.dbSetup),
  auth: parseAsStringServer.withDefault(DEFAULT_STACK.auth),
  payments: parseAsArrayOfServer(parseAsStringServer).withDefault(DEFAULT_STACK.payments),
  observability: parseAsArrayOfServer(parseAsStringServer).withDefault(DEFAULT_STACK.observability),
  communication: parseAsStringServer.withDefault(DEFAULT_STACK.communication),
  packageManager: parseAsStringServer.withDefault(DEFAULT_STACK.packageManager),
  addons: parseAsArrayOfServer(parseAsStringServer).withDefault(DEFAULT_STACK.addons),
  testing: parseAsArrayOfServer(parseAsStringServer).withDefault(DEFAULT_STACK.testing),
  examples: parseAsArrayOfServer(parseAsStringServer).withDefault(DEFAULT_STACK.examples),
  git: parseAsBooleanServer.withDefault(DEFAULT_STACK.git),
  install: parseAsBooleanServer.withDefault(DEFAULT_STACK.install),
  webDeploy: parseAsStringServer.withDefault(DEFAULT_STACK.webDeploy),
  serverDeploy: parseAsStringServer.withDefault(DEFAULT_STACK.serverDeploy),
  yolo: parseAsBooleanServer.withDefault(DEFAULT_STACK.yolo),
};

const serverStackParsers = {
  ...canonicalServerStackParsers,
  legacyWebFrontend: parseAsArrayOfServer(parseAsStringServer).withDefault([]),
  legacyNativeFrontend: parseAsArrayOfServer(parseAsStringServer).withDefault([]),
};

const rawLoadStackParams = createLoader(serverStackParsers, {
  urlKeys: allStackUrlKeys as UrlKeys<typeof serverStackParsers>,
});

export const serializeStackParams = createSerializer(canonicalServerStackParsers, {
  urlKeys: stackUrlKeys as UrlKeys<typeof canonicalServerStackParsers>,
});

export async function loadStackParams(
  searchParams: Parameters<typeof rawLoadStackParams>[0],
): Promise<StackState> {
  const stackState = await rawLoadStackParams(searchParams);
  return sanitizeStackState(stackState);
}

export type LoadedStackState = Awaited<ReturnType<typeof loadStackParams>>;
