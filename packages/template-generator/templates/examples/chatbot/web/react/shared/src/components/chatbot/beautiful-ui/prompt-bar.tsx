"use client";

/*
 * ADAPTED from Beautiful UI "Prompt Bar" (PromptBar), MIT — see ./LICENSE.
 * Changes: the self-running demo, the @ sources / slash menus, third-party brand marks,
 * fake dictation, attachments and the `glimm` WebGL sweep were removed. Kept: the
 * auto-growing textarea that moves wrapped text above the controls, the hero ("tall")
 * sizing, the Rounded/Pill variants, the model label and the tactile send button, which
 * turns into a stop button while the agent runs. Glyphs are CSS icons.
 */

import { useLayoutEffect, useRef, useState } from "react";

import { CssIcon } from "../css-icons";

export default function PromptBar({
  variant = "Rounded",
  tall = false,
  placeholder,
  modelLabel,
  running = false,
  disabled = false,
  autoFocus = false,
  onSend,
  onStop,
}: {
  variant?: "Rounded" | "Pill";
  /** hero sizing: a multi-line input with controls on their own row */
  tall?: boolean;
  placeholder?: string;
  /** shown next to the send button, e.g. the configured model */
  modelLabel?: string;
  /** the agent is answering: the send button becomes stop */
  running?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onSend?: (text: string) => void;
  onStop?: () => void;
}) {
  const pill = variant === "Pill";
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const wide = expanded || tall;
  const controlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<HTMLSpanElement>(null);

  /* Move wrapped text above the controls, then grow to a compact maximum. */
  useLayoutEffect(() => {
    const input = inputRef.current;
    const controls = controlsRef.current;
    const measure = measureRef.current;
    if (!input || !controls || !measure) return;

    const fixedControlsWidth = 28 + (modelRef.current?.offsetWidth ?? 0);
    const inlineGaps = 4 * 2;
    const inlineInputWidth = controls.clientWidth - fixedControlsWidth - inlineGaps;
    const needsFullWidth = draft.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) {
      setExpanded(needsFullWidth);
    }

    const minHeight = tall ? 68 : 28;
    const maxHeight = tall ? 180 : 140;
    input.style.height = "0px";
    const contentHeight = input.scrollHeight;
    input.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    input.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, [draft, expanded, tall]);

  const canSend = !disabled && draft.trim().length > 0;
  const send = () => {
    if (!canSend || running) return;
    onSend?.(draft.trim());
    setDraft("");
  };

  return (
    <div data-promptbar className="w-full">
      <div
        className={`relative isolate flex flex-col overflow-hidden border border-line bg-surface shadow-card transition-[border-color,border-radius] duration-150 focus-within:border-line-strong ${
          tall ? "gap-2.5 p-3.5" : "gap-1.5 p-1.5"
        } ${pill ? (wide ? "rounded-[24px]" : "rounded-full") : tall ? "rounded-[22px]" : "rounded-[14px]"}`}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute text-[14px] leading-[18px] whitespace-pre"
        >
          {draft}
        </span>

        <div
          ref={controlsRef}
          className="grid grid-cols-[minmax(0,1fr)_auto_28px] items-end gap-x-1 gap-y-1.5"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            autoFocus={autoFocus}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                send();
              }
            }}
            placeholder={placeholder ?? "Write a message…"}
            aria-label="Prompt"
            className={`${tall ? "min-h-[68px] px-2 py-2 text-[15px] leading-6" : "min-h-7 px-1.5 py-[5px] text-[14px] leading-[18px]"} w-full min-w-0 resize-none bg-transparent text-ink outline-none [overflow-wrap:anywhere] placeholder:text-ink-3 disabled:opacity-50 ${
              wide ? "col-span-full col-start-1 row-start-1" : "col-start-1 row-start-1"
            }`}
          />

          {/* model label */}
          {modelLabel ? (
            <span
              ref={modelRef}
              title="Set CHATBOT_MODEL to change the model"
              className={`flex h-7 shrink-0 items-center gap-1 px-1.5 font-mono text-[11.5px] text-ink-3 ${
                pill ? "rounded-full" : "rounded-[8px]"
              } ${wide ? "col-start-2 row-start-2 justify-self-end" : "col-start-2 row-start-1"}`}
            >
              {modelLabel}
            </span>
          ) : (
            <span className={wide ? "col-start-2 row-start-2" : "col-start-2 row-start-1"} />
          )}

          {/* send / stop — tactile square (round in the pill variant) */}
          <button
            type="button"
            aria-label={running ? "Stop" : "Send"}
            disabled={running ? false : !canSend}
            onClick={running ? onStop : send}
            className={`flex size-7 shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.94] ${
              pill ? "rounded-full" : "rounded-[8px]"
            } ${wide ? "col-start-3 row-start-2" : "col-start-3 row-start-1"}`}
            style={{
              background: canSend || running ? "var(--ink)" : "var(--line-strong)",
              color: canSend || running ? "var(--surface)" : "var(--ink-2)",
            }}
          >
            <CssIcon name={running ? "stop" : "send"} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
