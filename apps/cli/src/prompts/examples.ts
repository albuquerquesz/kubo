import { log } from "@clack/prompts";

import { DEFAULT_CONFIG } from "../constants";
import type { API, Backend, Database, Examples, Frontend } from "../types";
import {
  isExampleAIAllowed,
  isExampleAIAllowedForBackend,
  isExampleChatbotAllowed,
  isExampleTodoAllowed,
} from "../utils/compatibility-rules";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableMultiselect } from "./navigable";

type ExampleOption = { value: Examples; label: string; hint: string };

/** `ai` and `chatbot` both generate a chat screen, so only one of them can be picked. */
function hasConflictingChatExamples(examples: readonly Examples[]): boolean {
  return examples.includes("ai") && examples.includes("chatbot");
}

export async function getExamplesChoice(
  examples?: Examples[],
  database?: Database,
  frontends?: Frontend[],
  backend?: Backend,
  api?: API,
  previousValue?: Examples[],
) {
  if (examples !== undefined) return examples;

  if (backend === "none") {
    return [];
  }

  const options: ExampleOption[] = [];

  if (isExampleTodoAllowed(backend, database, api)) {
    options.push({
      value: "todo",
      label: "Todo App",
      hint: "A simple CRUD example app",
    });
  }

  if (isExampleAIAllowed(backend, frontends ?? []) && isExampleAIAllowedForBackend(backend, "ai")) {
    options.push({
      value: "ai",
      label: "AI Chat",
      hint: "A simple AI chat interface using AI SDK",
    });
  }

  if (isExampleChatbotAllowed(backend, frontends ?? [])) {
    options.push({
      value: "chatbot",
      label: "Chatbot",
      hint: "Grok-style assistant with CopilotKit (AG-UI); not combinable with AI Chat",
    });
  }

  if (options.length === 0) return [];

  let initialValues = (previousValue ?? DEFAULT_CONFIG.examples)?.filter((ex) =>
    options.some((o) => o.value === ex),
  );

  while (true) {
    const response = await navigableMultiselect<Examples>({
      message: "Include examples",
      options,
      required: false,
      initialValues,
    });

    if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });
    if (!hasConflictingChatExamples(response)) return response;

    log.warn("'AI Chat' and 'Chatbot' both generate a chat screen. Pick only one of them.");
    initialValues = response.filter((example) => example !== "ai");
  }
}
