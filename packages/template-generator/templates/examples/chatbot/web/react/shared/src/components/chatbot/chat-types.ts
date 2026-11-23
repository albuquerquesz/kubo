import type { useAgent } from "@copilotkit/react-core/v2";

/** An AG-UI message as exposed by the CopilotKit agent. */
export type AgentMessage = ReturnType<typeof useAgent>["agent"]["messages"][number];

export type Conversation = {
  id: string;
  title: string;
  messages: AgentMessage[];
  updatedAt: number;
};

export type ChatbotTheme = "dark" | "light";

const MESSAGE_ROLES = new Set(["user", "assistant", "tool", "reasoning", "system", "developer"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Shallow guard for messages read back from localStorage (the trust boundary). */
export function isAgentMessage(value: unknown): value is AgentMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.role === "string" &&
    MESSAGE_ROLES.has(value.role)
  );
}

export function isConversation(value: unknown): value is Conversation {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.updatedAt === "number" &&
    Array.isArray(value.messages) &&
    value.messages.every(isAgentMessage)
  );
}

/** Plain text of a message, whatever shape its content has. */
export function messageText(message: AgentMessage): string {
  if (!("content" in message)) return "";
  const { content } = message;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part: unknown) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("");
}
