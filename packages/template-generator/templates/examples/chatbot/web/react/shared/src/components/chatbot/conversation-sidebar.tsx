"use client";

import type { ChatbotTheme, Conversation } from "./chat-types";
import { CssIcon } from "./css-icons";
import { KuboCta } from "./kubo-cta";

export function ConversationSidebar({
  conversations,
  activeId,
  open,
  theme,
  onClose,
  onNewChat,
  onSelect,
  onDelete,
  onToggleTheme,
}: {
  conversations: Conversation[];
  activeId: string | null;
  /** drawer state on small screens; the sidebar is always visible from `md` up */
  open: boolean;
  theme: ChatbotTheme;
  onClose: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTheme: () => void;
}) {
  const saved = conversations.filter((conversation) => conversation.messages.length > 0);

  return (
    <>
      {/* mobile backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Conversations"
        className={`absolute inset-y-0 left-0 z-30 flex w-72 max-w-[85%] flex-col border-r border-line bg-canvas transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] md:static md:z-auto md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
          <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <CssIcon name="sparkle" size={16} />
            Chatbot
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="primitive-icon-button text-ink-3 transition-colors hover:bg-hover hover:text-ink md:hidden"
          >
            <CssIcon name="close" size={14} />
          </button>
        </div>

        <div className="px-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-[13px] font-medium text-ink transition-colors duration-100 hover:bg-hover"
          >
            <CssIcon name="new-chat" size={16} />
            New chat
          </button>
        </div>

        <nav className="mt-3 min-h-0 flex-1 overflow-y-auto px-2">
          <p className="px-2.5 pb-1 text-[11.5px] font-medium text-ink-3">History</p>
          {saved.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[12.5px] text-ink-3">
              Your conversations show up here.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {saved.map((conversation) => {
                const active = conversation.id === activeId;
                return (
                  <li key={conversation.id} className="group relative">
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => onSelect(conversation.id)}
                      className={`flex h-8 w-full items-center rounded-control pr-8 pl-2.5 text-left text-[13px] transition-colors duration-100 ${
                        active ? "bg-hover-2 text-ink" : "text-ink-2 hover:bg-hover hover:text-ink"
                      }`}
                    >
                      <span className="truncate">{conversation.title}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete “${conversation.title}”`}
                      onClick={() => onDelete(conversation.id)}
                      className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-[6px] text-ink-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100"
                    >
                      <CssIcon name="close" size={11} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <div className="flex flex-col gap-2 border-t border-line p-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-8 items-center gap-2.5 rounded-control px-2.5 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover hover:text-ink"
          >
            <CssIcon name={theme === "dark" ? "sun" : "moon"} size={15} />
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>
          <KuboCta />
        </div>
      </aside>
    </>
  );
}
