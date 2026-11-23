/** Where the CopilotKit runtime (AG-UI) is mounted in this app. */
export const CHATBOT_RUNTIME_URL = "/api/copilotkit";

/** Small JSON endpoint next to the runtime: which model is used and whether its key is set. */
export const CHATBOT_STATUS_URL = `${CHATBOT_RUNTIME_URL}/kubo-status`;

export type ChatbotStatus = {
  model: string;
  configured: boolean;
  /** the environment variable that must hold the provider key */
  envVar?: string;
};

export function isChatbotStatus(value: unknown): value is ChatbotStatus {
  return (
    typeof value === "object" &&
    value !== null &&
    "model" in value &&
    typeof value.model === "string" &&
    "configured" in value &&
    typeof value.configured === "boolean"
  );
}
