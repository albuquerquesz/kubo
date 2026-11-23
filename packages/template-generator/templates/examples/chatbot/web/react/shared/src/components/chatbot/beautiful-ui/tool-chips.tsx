"use client";

/*
 * ADAPTED from Beautiful UI "Tool Chips" (ToolChips), MIT — see ./LICENSE.
 * Changes: rows come from the agent's real tool calls (no timed reveal), each row shows a
 * running/complete state, file-diff chips and the diff preview portal were removed, and
 * SVG glyphs were replaced by CSS icons.
 *
 * An agent run as compact rows: a tool call with an inline chip. Hover a row to reveal
 * its chevron; every row expands to show what the tool received and returned.
 */

import { useState } from "react";

import { CssIcon } from "../css-icons";

export type ToolDetailLine = { text: string; tone?: "add" };

export type ToolStep = {
  id: string;
  label: string;
  chip: string;
  running: boolean;
  detail: ToolDetailLine[];
};

export default function ToolChips({
  steps,
  header,
  className,
}: {
  steps: ToolStep[];
  header?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const title = header ?? `${steps.length} tool call${steps.length === 1 ? "" : "s"}`;

  const toggleRow = (id: string) =>
    setOpenRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={`w-full max-w-md pb-1${className ? ` ${className}` : ""}`}>
      {/* collapsed run header */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="-mx-1.5 flex w-fit items-center gap-1.5 rounded-control px-1.5 py-1 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover-2"
      >
        <span
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <CssIcon name="chevron" size={11} />
        </span>
        <span className="tabular-nums">{title}</span>
      </button>

      {/* tool call rows */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        {/* -mx-1 + px-1.5 keeps content at the same x while giving the
            row hover pills room inside this overflow-hidden clip box */}
        <div className="-mx-1 overflow-hidden px-1.5 pb-1">
          <div className="mt-1.5 flex flex-col gap-1">
            {steps.map((row) => {
              const rowOpen = openRows.has(row.id);
              return (
                <div
                  key={row.id}
                  style={{ animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" }}
                >
                  <button
                    type="button"
                    aria-expanded={rowOpen}
                    onClick={() => toggleRow(row.id)}
                    className="group/row -mx-[3px] flex h-7 w-[calc(100%+6px)] min-w-0 items-center gap-2 rounded-control px-[3px] text-left transition-colors duration-100 hover:bg-hover-2"
                  >
                    <span className="relative flex size-4 shrink-0 items-center justify-center text-ink-3">
                      <span
                        className={`flex transition-opacity duration-100 group-hover/row:opacity-0 ${rowOpen ? "opacity-0" : ""}`}
                      >
                        <CssIcon name={row.running ? "loading" : "tool"} size={13} />
                      </span>
                      <span
                        className={`absolute flex transition-[opacity,transform] duration-150 group-hover/row:opacity-100 ${rowOpen ? "opacity-100" : "opacity-0"}`}
                        style={{ transform: rowOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        <CssIcon name="chevron" size={11} />
                      </span>
                    </span>
                    <span className="shrink-0 text-[12.5px] font-medium text-ink">{row.label}</span>
                    <span
                      className="inline-flex h-5.5 min-w-0 flex-1 cursor-pointer items-center truncate rounded-chip bg-field px-1.5
                        font-mono text-[11.5px] text-ink-2 shadow-hairline transition-colors duration-100 hover:bg-hover-2"
                    >
                      {row.chip}
                    </span>
                  </button>

                  {/* expanded detail */}
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-300"
                    style={{
                      gridTemplateRows: rowOpen ? "1fr" : "0fr",
                      opacity: rowOpen ? 1 : 0,
                      transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mt-0.5 mb-1 ml-2 flex flex-col gap-0.5 border-l border-line py-0.5 pl-3.5">
                        {row.detail.map((line, index) => (
                          <span
                            key={`${index}-${line.text.slice(0, 16)}`}
                            className={`truncate font-mono text-[11.5px] leading-[1.6] ${line.tone === "add" ? "text-green" : "text-ink-2"}`}
                          >
                            {line.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
