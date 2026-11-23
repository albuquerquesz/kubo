"use client";

import { useCallback, useEffect, useState } from "react";

import {
  isConversation,
  messageText,
  type AgentMessage,
  type ChatbotTheme,
  type Conversation,
} from "./chat-types";

/*
 * v1 keeps the conversation list in the browser (localStorage). Swap these two helpers for
 * API calls to persist conversations in your database.
 */
const CONVERSATIONS_KEY = "kubo-chatbot:conversations";
const THEME_KEY = "kubo-chatbot:theme";
const MAX_TITLE = 48;

function readStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: the chat keeps working in memory.
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function titleFrom(messages: AgentMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const text = firstUser ? messageText(firstUser).trim().replace(/\s+/g, " ") : "";
  if (!text) return "New chat";
  return text.length > MAX_TITLE ? `${text.slice(0, MAX_TITLE - 1)}…` : text;
}

function blankConversation(): Conversation {
  return { id: newId(), title: "New chat", messages: [], updatedAt: Date.now() };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate after mount so server and client render the same first frame.
  useEffect(() => {
    const stored = readStorage(CONVERSATIONS_KEY);
    const list = Array.isArray(stored) ? stored.filter(isConversation) : [];
    const initial = list.length > 0 ? list : [blankConversation()];
    setConversations(initial);
    setActiveId(initial[0]?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Empty drafts are not worth persisting.
    writeStorage(
      CONVERSATIONS_KEY,
      conversations.filter((conversation) => conversation.messages.length > 0),
    );
  }, [conversations, ready]);

  const createConversation = useCallback(() => {
    const conversation = blankConversation();
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.messages.length > 0),
    ]);
    setActiveId(conversation.id);
    return conversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length > 0 ? next : [blankConversation()];
    });
  }, []);

  // Keep a valid selection when the active conversation is deleted.
  useEffect(() => {
    if (!ready || conversations.some((item) => item.id === activeId)) return;
    setActiveId(conversations[0]?.id ?? null);
  }, [activeId, conversations, ready]);

  const saveMessages = useCallback((id: string, messages: AgentMessage[]) => {
    setConversations((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, messages, title: titleFrom(messages), updatedAt: Date.now() }
            : item,
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
  }, []);

  const active = conversations.find((item) => item.id === activeId) ?? null;

  return {
    ready,
    conversations,
    active,
    selectConversation: setActiveId,
    createConversation,
    deleteConversation,
    saveMessages,
  };
}

/** Dark by default (like the reference layout); the choice is remembered per browser. */
export function useChatbotTheme() {
  const [theme, setThemeState] = useState<ChatbotTheme>("dark");

  useEffect(() => {
    const stored = readStorage(THEME_KEY);
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  const setTheme = useCallback((next: ChatbotTheme) => {
    setThemeState(next);
    writeStorage(THEME_KEY, next);
  }, []);

  return { theme, setTheme };
}
