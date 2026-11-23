"use client";

/*
 * ADAPTED from Beautiful UI "Thinking" (ThinkingState), MIT — see ./LICENSE.
 * Changes: driven by live props (`working`, `rows`) instead of the timed demo sequence,
 * only the Steps and Reasoning variants are kept, SVG glyphs replaced by CSS icons.
 *
 *   Steps      step list with spinner → muted checks
 *   Reasoning  prose reasoning that expands, then settles
 *
 * The trace expands while the agent works and stays expandable once it settles.
 */

import { useLayoutEffect, useRef, useState } from "react";

import { CssIcon } from "../css-icons";

export type ThinkingRow = {
  primary: string;
  secondary?: string;
};

export default function ThinkingState({
  variant = "Reasoning",
  working,
  rows,
  active = "Thinking",
  done = "Thought it through",
}: {
  variant?: "Steps" | "Reasoning";
  /** true while the agent is still producing this trace */
  working: boolean;
  rows: ThinkingRow[];
  active?: string;
  done?: string;
}) {
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const expanded = manualExpanded ?? working;
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [rows, expanded, variant, working]);

  return (
    <div className="flex w-full flex-col">
      {/* header */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((current) => !(current ?? working))}
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-1.5 py-1
          transition-colors duration-100 hover:bg-hover-2"
      >
        <span
          className="flex shrink-0 transition-colors duration-200"
          style={{ color: working ? "var(--ink-2)" : "var(--ink-3)" }}
        >
          <CssIcon name={working ? "thinking" : "sparkle"} size={15} />
        </span>
        <span role="status" className="contents">
          {working ? (
            <span
              className="bg-clip-text text-[13px] font-medium whitespace-nowrap text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              {active}
            </span>
          ) : (
            <span
              className="text-[13px] font-medium whitespace-nowrap text-ink-2"
              style={{ animation: "fade-in 350ms ease-out both" }}
            >
              {done}
            </span>
          )}
        </span>
        <span
          className="text-ink-3 transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <CssIcon name="chevron" size={12} />
        </span>
      </button>

      {/* expandable trace */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] w-px bg-line"
              style={{
                top: -8,
                height: lineHeight ? lineHeight - 2 : 0,
                transition: "height 500ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {rows.map((row, i) => (
                <div
                  key={`${i}-${row.primary.slice(0, 24)}`}
                  className="flex min-h-7 w-full items-center gap-2 rounded-[6px] px-1.5 py-0.5 text-left"
                  style={{
                    animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${Math.min(i, 4) * 120}ms both`,
                  }}
                >
                  {variant === "Steps" &&
                    (i < rows.length - 1 || !working ? (
                      <span className="text-ink-3">
                        <CssIcon name="check" size={13} />
                      </span>
                    ) : (
                      <span className="text-ink-2">
                        <CssIcon name="loading" size={12} />
                      </span>
                    ))}
                  <span
                    className={`min-w-0 text-[12.5px] ${variant === "Reasoning" ? "whitespace-pre-wrap leading-relaxed text-ink-2" : "truncate font-medium text-ink"}`}
                  >
                    {row.primary}
                  </span>
                  {row.secondary && (
                    <span className="shrink-0 font-mono text-[11.5px] text-ink-3">
                      {row.secondary}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
