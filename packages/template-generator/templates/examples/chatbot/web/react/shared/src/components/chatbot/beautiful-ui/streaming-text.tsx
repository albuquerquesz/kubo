"use client";

/*
 * ADAPTED from Beautiful UI "Streaming Text" (StreamingText), MIT — see ./LICENSE.
 * Changes: renders the real streamed answer (markdown via Streamdown) instead of the
 * scripted token loop; the caret, the delayed action row and the follow-up list keep the
 * original look. Citations/sources were dropped (the built-in agent returns none).
 */

import type { ReactNode } from "react";
import { Streamdown } from "streamdown";

import { CssIcon } from "../css-icons";

export type StreamingLabels = {
  /** heading above the follow-up prompts */
  followUps: string;
};

const DEFAULT_LABELS: StreamingLabels = {
  followUps: "Follow-ups",
};

export default function StreamingText({
  content,
  streaming,
  actions,
  followUps = [],
  labels,
  onFollowUp,
}: {
  /** the text received so far */
  content: string;
  /** true while tokens are still arriving */
  streaming: boolean;
  /** per-message actions, revealed once the stream completes */
  actions?: ReactNode;
  /** follow-up prompt suggestions shown once the stream completes */
  followUps?: string[];
  labels?: Partial<StreamingLabels>;
  onFollowUp?: (text: string, index: number) => void;
}) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const done = !streaming;

  return (
    <div className="w-full">
      <div className="kc-markdown">
        <Streamdown>{content}</Streamdown>
        {streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 rounded-full bg-ink"
            style={{ animation: "fade-in 150ms ease-out both" }}
          />
        )}
      </div>

      {/* action icons row */}
      {actions && (
        <div
          className="mt-2 flex items-center gap-0.5 transition-opacity duration-400"
          style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
        >
          {actions}
        </div>
      )}

      {/* follow-ups */}
      {followUps.length > 0 && (
        <div
          className="mt-2.5 transition-opacity duration-400"
          style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
        >
          <p className="text-[12px] font-medium text-ink-2">{l.followUps}</p>
          <div className="mt-0.5 flex flex-col">
            {followUps.map((text, i) => (
              <button
                key={text}
                type="button"
                onClick={() => onFollowUp?.(text, i)}
                className="-mx-1.5 flex items-center gap-2 rounded-[7px] border-b border-line
                  px-1.5 py-1.5 text-left text-[12.5px] text-ink transition-colors
                  duration-100 hover:bg-hover-2"
                style={
                  done
                    ? { animation: `fade-up 350ms cubic-bezier(0.23,1,0.32,1) ${i * 90}ms both` }
                    : { opacity: 0 }
                }
              >
                <span className="text-ink-3" style={{ transform: "rotate(-90deg)" }}>
                  <CssIcon name="chevron" size={11} />
                </span>
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
