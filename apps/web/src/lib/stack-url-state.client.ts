"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

import { DEFAULT_STACK, type StackState } from "@/lib/constant";

import { sanitizeStackState } from "./sanitize-stack-addons";
import { stackUrlKeys } from "./stack-url-keys";

const legacyFrontendUrlKeys = {
  legacyWebFrontend: "fe-w",
  legacyNativeFrontend: "fe-n",
} as const;

const allStackUrlKeys = { ...stackUrlKeys, ...legacyFrontendUrlKeys };

export const stackParsers = {
  projectName: parseAsString.withDefault(DEFAULT_STACK.projectName),
  frontend: parseAsArrayOf(parseAsString).withDefault([]),
  runtime: parseAsString.withDefault(DEFAULT_STACK.runtime),
  backend: parseAsString.withDefault(DEFAULT_STACK.backend),
  api: parseAsString.withDefault(DEFAULT_STACK.api),
  database: parseAsString.withDefault(DEFAULT_STACK.database),
  orm: parseAsString.withDefault(DEFAULT_STACK.orm),
  dbSetup: parseAsString.withDefault(DEFAULT_STACK.dbSetup),
  auth: parseAsString.withDefault(DEFAULT_STACK.auth),
  payments: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.payments),
  observability: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.observability),
  communication: parseAsString.withDefault(DEFAULT_STACK.communication),
  packageManager: parseAsString.withDefault(DEFAULT_STACK.packageManager),
  addons: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.addons),
  testing: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.testing),
  examples: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.examples),
  git: parseAsBoolean.withDefault(DEFAULT_STACK.git),
  install: parseAsBoolean.withDefault(DEFAULT_STACK.install),
  webDeploy: parseAsString.withDefault(DEFAULT_STACK.webDeploy),
  serverDeploy: parseAsString.withDefault(DEFAULT_STACK.serverDeploy),
  yolo: parseAsBoolean.withDefault(DEFAULT_STACK.yolo),
  legacyWebFrontend: parseAsArrayOf(parseAsString).withDefault([]),
  legacyNativeFrontend: parseAsArrayOf(parseAsString).withDefault([]),
  viewMode: parseAsStringEnum<"command" | "preview">(["command", "preview"]).withDefault("command"),
  selectedFile: parseAsString.withDefault(""),
};

export const stackQueryStatesOptions = {
  history: "replace" as const,
  shallow: true,
  urlKeys: allStackUrlKeys,
  clearOnDefault: true,
};

export function useStackState() {
  const [queryState, setQueryState] = useQueryStates(stackParsers, stackQueryStatesOptions);
  const stack = sanitizeStackState(queryState);
  const viewMode = queryState.viewMode;
  const selectedFile = queryState.selectedFile;

  const clearLegacyFrontendQuery = {
    legacyWebFrontend: null,
    legacyNativeFrontend: null,
  };

  const updateStack = async (
    updates: Partial<StackState> | ((prev: StackState) => Partial<StackState>),
  ) => {
    const newStack = typeof updates === "function" ? updates(stack) : updates;
    const finalStack = sanitizeStackState({ ...stack, ...newStack });
    await setQueryState({ ...finalStack, viewMode, selectedFile, ...clearLegacyFrontendQuery });
  };

  const setViewMode = async (mode: "command" | "preview") => {
    await setQueryState({ viewMode: mode, selectedFile });
  };

  const setSelectedFile = async (filePath: string | null) => {
    await setQueryState({ selectedFile: filePath || "" });
  };

  return [stack, updateStack, viewMode, setViewMode, selectedFile, setSelectedFile] as const;
}
