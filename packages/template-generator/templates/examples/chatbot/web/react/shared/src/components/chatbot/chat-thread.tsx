"use client";

import {
  ToolCallStatus,
  useAgent,
  useCopilotKit,
  useFrontendTool,
  useHumanInTheLoop,
  useRenderToolCall,
  type ReactHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { z } from "zod";

import { CHATBOT_STATUS_URL, isChatbotStatus, type ChatbotStatus } from "../../lib/chatbot/config";
import ApprovalCard from "./beautiful-ui/approval-card";
import { AgentSection, UserBubble } from "./beautiful-ui/chat-bubble";
import PromptBar from "./beautiful-ui/prompt-bar";
import StreamingText from "./beautiful-ui/streaming-text";
import ThinkingState from "./beautiful-ui/thinking-state";
import ToolChips, { type ToolDetailLine, type ToolStep } from "./beautiful-ui/tool-chips";
import { messageText, type AgentMessage, type ChatbotTheme, type Conversation } from "./chat-types";
import { CssIcon } from "./css-icons";
import { MessageActions } from "./message-actions";

type AssistantMessage = Extract<AgentMessage, { role: "assistant" }>;
type ToolMessage = Extract<AgentMessage, { role: "tool" }>;
type ToolCall = NonNullable<AssistantMessage["toolCalls"]>[number];
type CoreAgent = Parameters<ReturnType<typeof useCopilotKit>["copilotkit"]["runAgent"]>[0]["agent"];

const SUGGESTIONS = [
  "Explain the AG-UI protocol in two sentences",
  "Switch to the light theme",
  "Plan a weekend trip and ask me to pick the city",
];

/* ── Frontend tools the agent can call ─────────────────────────────── */

const themeSchema = z.object({ theme: z.enum(["light", "dark"]) });

const askUserSchema = z.object({
  question: z.string().describe("The question to show the user"),
  options: z.array(z.string()).min(1).max(6).describe("Choices the user can pick from"),
  multiple: z.boolean().optional().describe("Allow picking more than one option"),
});
type AskUserArgs = z.infer<typeof askUserSchema>;
type AskUserRenderProps = ComponentProps<ReactHumanInTheLoop<AskUserArgs>["render"]>;

const ASK_USER_TOOL = "askUser";

/** Human-in-the-loop: the agent pauses until the user answers this card. */
function AskUserCard(props: AskUserRenderProps) {
  if (props.status === ToolCallStatus.InProgress) {
    return (
      <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
        <CssIcon name="loading" size={13} /> Preparing a question…
      </div>
    );
  }
  if (props.status === ToolCallStatus.Complete) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-tint py-1 pr-2.5 pl-1.5 text-[12.5px] font-medium text-green">
        <CssIcon name="check" size={11} /> Answer sent
      </span>
    );
  }
  const { args, respond } = props;
  return (
    <ApprovalCard
      questions={[
        { q: args.question, type: args.multiple ? "check" : "radio", options: args.options },
      ]}
      labels={{ send: "Send answer", sentMessage: "Answer sent" }}
      onSubmitted={(answers) => void respond({ answers })}
      onDismiss={() => void respond({ dismissed: true })}
    />
  );
}

function useChatbotTools(onThemeChange: (theme: ChatbotTheme) => void) {
  useFrontendTool(
    {
      name: "setTheme",
      description: "Switch the chat interface between the light and the dark theme.",
      parameters: themeSchema,
      handler: async ({ theme }) => {
        onThemeChange(theme);
        return `Theme switched to ${theme}.`;
      },
    },
    [onThemeChange],
  );

  useHumanInTheLoop<AskUserArgs>({
    name: ASK_USER_TOOL,
    description:
      "Ask the user to pick or confirm something before you continue. Use it for anything destructive, irreversible or ambiguous.",
    parameters: askUserSchema,
    render: AskUserCard,
  });
}

/* ── Rendering helpers ─────────────────────────────────────────────── */

function preview(value: string, max = 64): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function toolSteps(message: AssistantMessage, results: Map<string, ToolMessage>): ToolStep[] {
  return (message.toolCalls ?? []).map((call) => {
    const result = results.get(call.id);
    const args = call.function.arguments || "{}";
    const detail: ToolDetailLine[] = [{ text: `args ${preview(args, 120)}` }];
    if (result)
      detail.push({ text: `→ ${preview(messageText(result) || "done", 120)}`, tone: "add" });
    return {
      id: call.id,
      label: call.function.name,
      chip: preview(args),
      running: !result,
      detail,
    };
  });
}

/** A changed signature means the conversation needs saving. */
function signature(messages: readonly AgentMessage[]): string {
  const last = messages.at(-1);
  const toolCalls = last?.role === "assistant" ? (last.toolCalls?.length ?? 0) : 0;
  return `${messages.length}:${last?.id ?? ""}:${last ? messageText(last).length : 0}:${toolCalls}`;
}

function lastIndexOfRole(messages: readonly AgentMessage[], role: AgentMessage["role"]): number {
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index]?.role === role) return index;
  }
  return -1;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : "The agent could not answer. Try again.";
}

/* ── Thread ───────────────────────────────────────────────────────── */

export function ChatThread({
  conversation,
  onMessagesChange,
  onThemeChange,
  onOpenSidebar,
  onNewChat,
}: {
  conversation: Conversation;
  onMessagesChange: (id: string, messages: AgentMessage[]) => void;
  onThemeChange: (theme: ChatbotTheme) => void;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}) {
  // The agent is a mutable object: opt out of React Compiler memoization so every
  // streamed update re-renders (Next.js enables the compiler in this template).
  "use no memo";
  const { agent: hookAgent, isReady } = useAgent();
  const { copilotkit } = useCopilotKit();
  // Package boundary: @copilotkit/react-core and @copilotkit/core can resolve two
  // copies of @ag-ui/client (they see different zod versions), so the two
  // AbstractAgent types differ by name only. At runtime it is the same object,
  // created by the core, so we use the core's type for it.
  const agent = hookAgent as unknown as CoreAgent;
  const renderToolCall = useRenderToolCall();
  const [status, setStatus] = useState<ChatbotStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadedAgentRef = useRef<typeof agent | null>(null);
  const initialMessagesRef = useRef(conversation.messages);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useChatbotTools(onThemeChange);

  // Model label + a clear notice when the provider key is missing.
  useEffect(() => {
    const controller = new AbortController();
    fetch(CHATBOT_STATUS_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: unknown) => setStatus(isChatbotStatus(value) ? value : null))
      .catch(() => setStatus(null));
    return () => controller.abort();
  }, []);

  // Load this conversation into the agent (the parent remounts us per conversation).
  useEffect(() => {
    if (!isReady) return;
    agent.threadId = conversation.id;
    agent.setMessages(initialMessagesRef.current);
    loadedAgentRef.current = agent;
    return () => {
      if (agent.isRunning) copilotkit.stopAgent({ agent });
    };
  }, [agent, isReady, conversation.id, copilotkit]);

  const messages = agent.messages;
  const running = agent.isRunning;
  const currentSignature = signature(messages);

  // Persist what the agent streams back.
  useEffect(() => {
    if (loadedAgentRef.current !== agent) return;
    if (currentSignature === signature(conversation.messages)) return;
    onMessagesChange(conversation.id, [...agent.messages]);
  }, [agent, conversation.id, conversation.messages, currentSignature, onMessagesChange]);

  // Keep the newest tokens in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight });
  }, [currentSignature, running]);

  const run = async () => {
    setError(null);
    try {
      await copilotkit.runAgent({ agent });
    } catch (runError) {
      setError(describeError(runError));
    }
  };

  const send = (text: string) => {
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: text });
    void run();
  };

  const regenerate = () => {
    const lastUser = lastIndexOfRole(messages, "user");
    if (lastUser < 0) return;
    agent.setMessages(messages.slice(0, lastUser + 1));
    void run();
  };

  const stop = () => copilotkit.stopAgent({ agent });

  const toolResults = new Map<string, ToolMessage>();
  for (const message of messages) {
    if (message.role === "tool") toolResults.set(message.toolCallId, message);
  }
  const lastAssistantId = messages[lastIndexOfRole(messages, "assistant")]?.id;
  const lastMessage = messages.at(-1);
  const waiting =
    running && (!lastMessage || lastMessage.role === "user" || lastMessage.role === "tool");
  const empty = messages.length === 0;
  const missingKey = status && !status.configured ? status : null;

  const header = (
    <header className="flex h-12 shrink-0 items-center justify-between px-3">
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={onOpenSidebar}
        className="primitive-icon-button text-ink-2 transition-colors hover:bg-hover hover:text-ink md:invisible"
      >
        <CssIcon name="menu" size={16} />
      </button>
      <button
        type="button"
        aria-label="New chat"
        onClick={onNewChat}
        className="primitive-icon-button text-ink-2 transition-colors hover:bg-hover hover:text-ink"
      >
        <CssIcon name="new-chat" size={16} />
      </button>
    </header>
  );

  const notices = (
    <>
      {missingKey && (
        <div
          role="alert"
          className="rounded-card bg-red-tint px-3 py-2 text-[12.5px] leading-relaxed text-red"
        >
          The AI provider key is not configured. Set <code>{missingKey.envVar}</code> in{" "}
          <code>apps/web/.env</code> (model <code>{missingKey.model}</code>) and restart the dev
          server.
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-card bg-red-tint px-3 py-2 text-[12.5px] leading-relaxed text-red"
        >
          {error}
        </div>
      )}
    </>
  );

  const composer = (
    <PromptBar
      tall={empty}
      autoFocus
      running={running}
      disabled={!isReady || Boolean(missingKey)}
      modelLabel={status?.model}
      placeholder={empty ? "What do you want to know?" : "Ask anything"}
      onSend={send}
      onStop={stop}
    />
  );

  if (empty) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
          <div className="flex w-full max-w-2xl flex-col gap-5">
            <h1
              className="text-center text-[28px] font-semibold tracking-tight text-ink"
              style={{ animation: "fade-up 500ms cubic-bezier(0.23,1,0.32,1) both" }}
            >
              How can I help you today?
            </h1>
            {notices}
            {composer}
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!isReady || Boolean(missingKey)}
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover hover:text-ink disabled:opacity-50"
                  style={{
                    animation: `fade-up 400ms cubic-bezier(0.23,1,0.32,1) ${120 + index * 70}ms both`,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-4">
          {messages.map((message) => {
            if (message.role === "user") {
              return <UserBubble key={message.id}>{messageText(message)}</UserBubble>;
            }
            if (message.role === "reasoning") {
              return (
                <ThinkingState
                  key={message.id}
                  variant="Reasoning"
                  working={running && message.id === lastMessage?.id}
                  rows={message.content
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((primary) => ({ primary }))}
                />
              );
            }
            if (message.role !== "assistant") return null;

            const text = messageText(message);
            const streaming = running && message.id === lastMessage?.id;
            const calls: ToolCall[] = message.toolCalls ?? [];
            return (
              <AgentSection key={message.id} label="Assistant" resolving={streaming}>
                <div className="flex flex-col gap-3">
                  {calls.length > 0 && <ToolChips steps={toolSteps(message, toolResults)} />}
                  {calls
                    .filter((call) => call.function.name === ASK_USER_TOOL)
                    .map((call) => (
                      <div key={call.id}>
                        {renderToolCall({ toolCall: call, toolMessage: toolResults.get(call.id) })}
                      </div>
                    ))}
                  {(text || streaming) && (
                    <StreamingText
                      content={text}
                      streaming={streaming}
                      actions={
                        text ? (
                          <MessageActions
                            text={text}
                            canRegenerate={!running && message.id === lastAssistantId}
                            onRegenerate={regenerate}
                          />
                        ) : undefined
                      }
                    />
                  )}
                </div>
              </AgentSection>
            );
          })}
          {waiting && (
            <ThinkingState
              variant="Steps"
              working
              active="Thinking"
              rows={[{ primary: "Reading the conversation" }]}
            />
          )}
        </div>
      </div>
      <div
        className="mx-auto flex w-full max-w-2xl shrink-0 flex-col gap-2 px-4 pt-2 pb-4"
        style={{ animation: "fade-up 420ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        {notices}
        {composer}
      </div>
    </div>
  );
}
