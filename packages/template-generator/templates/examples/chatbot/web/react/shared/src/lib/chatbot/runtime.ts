/*
 * Server-only: the CopilotKit runtime that serves the chatbot over AG-UI.
 * The API route (Next.js `app/api/copilotkit/[[...slug]]` or TanStack Start
 * `routes/api/copilotkit/$`) forwards every request to `handleChatbotRequest`.
 *
 * Swap the agent here: `BuiltInAgent` accepts any "provider/model" string or an AI SDK
 * LanguageModel, and `agents` can hold any AG-UI agent (LangGraph, Mastra, your own...).
 */
import { BuiltInAgent, CopilotRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

import { CHATBOT_RUNTIME_URL, CHATBOT_STATUS_URL, type ChatbotStatus } from "./config";

const DEFAULT_MODEL = "google/gemini-2.5-flash";

/** Which environment variable holds the key for each provider prefix of CHATBOT_MODEL. */
const PROVIDER_KEYS: Record<string, string> = {
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  gemini: "GOOGLE_GENERATIVE_AI_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

const SYSTEM_PROMPT = `You are a helpful assistant inside a web app generated with Kubo.
Answer in the user's language and format answers with Markdown.
You can switch the interface between the light and the dark theme with the setTheme tool.
Before doing anything destructive, irreversible or ambiguous, call askUser and wait for the answer.`;

function resolveModel() {
  const model = process.env.CHATBOT_MODEL?.trim() || DEFAULT_MODEL;
  const envVar = PROVIDER_KEYS[model.split("/")[0] ?? ""];
  const apiKey = envVar ? process.env[envVar]?.trim() : undefined;
  return { model, envVar, apiKey };
}

export function getChatbotStatus(): ChatbotStatus {
  const { model, envVar, apiKey } = resolveModel();
  // Unknown providers are left to the runtime, which reports its own error.
  return { model, envVar, configured: envVar === undefined || Boolean(apiKey) };
}

let handler: ((request: Request) => Promise<Response>) | undefined;

function getRuntimeHandler() {
  if (handler) return handler;
  const { model, apiKey } = resolveModel();
  const runtime = new CopilotRuntime({
    agents: {
      default: new BuiltInAgent({ model, apiKey, prompt: SYSTEM_PROMPT }),
    },
  });
  handler = createCopilotRuntimeHandler({ runtime, basePath: CHATBOT_RUNTIME_URL });
  return handler;
}

export async function handleChatbotRequest(request: Request): Promise<Response> {
  const status = getChatbotStatus();
  if (new URL(request.url).pathname === CHATBOT_STATUS_URL) {
    return Response.json(status, { headers: { "Cache-Control": "no-store" } });
  }
  if (!status.configured) {
    return Response.json(
      { error: "missing-api-key", envVar: status.envVar, model: status.model },
      { status: 503 },
    );
  }
  return getRuntimeHandler()(request);
}
