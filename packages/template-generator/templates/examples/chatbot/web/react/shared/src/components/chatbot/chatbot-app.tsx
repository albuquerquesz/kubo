"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { CHATBOT_RUNTIME_URL } from "../../lib/chatbot/config";
import { ChatThread } from "./chat-thread";
import { ConversationSidebar } from "./conversation-sidebar";
import { CssIcon } from "./css-icons";
import { useChatbotTheme, useConversations } from "./use-conversations";

/**
 * The chatbot screen: conversation sidebar (a drawer on small screens) + the active thread.
 * CopilotKit talks to the runtime in this app over AG-UI at CHATBOT_RUNTIME_URL.
 */
export default function ChatbotApp() {
  const { theme, setTheme } = useChatbotTheme();
  const {
    ready,
    conversations,
    active,
    selectConversation,
    createConversation,
    deleteConversation,
    saveMessages,
  } = useConversations();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const newChat = () => {
    createConversation();
    setDrawerOpen(false);
  };

  return (
    <CopilotKitProvider runtimeUrl={CHATBOT_RUNTIME_URL}>
      <div
        data-theme={theme}
        className="kubo-chatbot relative flex h-full min-h-0 w-full overflow-hidden"
      >
        <ConversationSidebar
          conversations={conversations}
          activeId={active?.id ?? null}
          open={drawerOpen}
          theme={theme}
          onClose={() => setDrawerOpen(false)}
          onNewChat={newChat}
          onSelect={(id) => {
            selectConversation(id);
            setDrawerOpen(false);
          }}
          onDelete={deleteConversation}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <main className="min-w-0 flex-1">
          {ready && active ? (
            <ChatThread
              key={active.id}
              conversation={active}
              onMessagesChange={saveMessages}
              onThemeChange={setTheme}
              onOpenSidebar={() => setDrawerOpen(true)}
              onNewChat={newChat}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-3">
              <CssIcon name="loading" size={18} />
            </div>
          )}
        </main>
      </div>
    </CopilotKitProvider>
  );
}
