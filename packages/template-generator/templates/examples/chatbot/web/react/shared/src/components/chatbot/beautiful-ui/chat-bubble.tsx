"use client";

/*
 * ADAPTED from Beautiful UI "Chat" (ChatComposer), MIT — see ./LICENSE.
 * Changes: the card's scripted thread was split into reusable pieces — the right-aligned
 * user bubble and the labeled agent section — so a real conversation can render them.
 * The tabbed header and the inline composer are replaced by the sidebar and PromptBar.
 */

import type { ReactNode } from "react";

/* user bubble — right aligned, soft block */
export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end pl-14">
      <div
        className="rounded-xl bg-field px-3 py-1.5 text-[14px] leading-[1.5] whitespace-pre-wrap text-ink
          transition-[opacity,transform] duration-300"
        style={{
          animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* one agent reply: a quiet label row above the body */
export function AgentSection({
  label,
  sub,
  resolving,
  children,
}: {
  label: string;
  sub?: string;
  /** true while the reply is still being produced */
  resolving?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="flex w-full flex-col gap-1.5 transition-[opacity,filter,transform] duration-400"
      style={{
        transformOrigin: "top left",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <div className="flex items-center gap-1 text-[12px] leading-[1.3]">
        <span className="font-medium text-ink">{label}</span>
        {sub && <span className="text-ink-2">{sub}</span>}
        {resolving && <span className="text-ink-3">· writing</span>}
      </div>
      <div className="text-[14px] leading-normal text-ink">{children}</div>
    </div>
  );
}
