"use client";

import { useEffect, useState } from "react";

import { CssIcon, type CssIconName } from "./css-icons";

type Feedback = "up" | "down" | null;

function ActionButton({
  label,
  icon,
  state,
  onClick,
}: {
  label: string;
  icon: CssIconName;
  state?: "done" | "on";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={state === "on" ? true : undefined}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover-2 hover:text-ink-2"
    >
      <CssIcon name={icon} size={15} state={state} />
    </button>
  );
}

/** Copy, regenerate and thumbs up/down under an assistant answer. */
export function MessageActions({
  text,
  canRegenerate,
  onRegenerate,
  onFeedback,
}: {
  text: string;
  canRegenerate: boolean;
  onRegenerate: () => void;
  /** hook this up to your analytics or database to collect ratings */
  onFeedback?: (feedback: Feedback) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const rate = (value: Exclude<Feedback, null>) => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    onFeedback?.(next);
  };

  return (
    <>
      <ActionButton
        label={copied ? "Copied" : "Copy"}
        icon="copy"
        state={copied ? "done" : undefined}
        onClick={copy}
      />
      {canRegenerate && <ActionButton label="Regenerate" icon="refresh" onClick={onRegenerate} />}
      <ActionButton
        label="Good response"
        icon="thumb-up"
        state={feedback === "up" ? "on" : undefined}
        onClick={() => rate("up")}
      />
      <ActionButton
        label="Bad response"
        icon="thumb-down"
        state={feedback === "down" ? "on" : undefined}
        onClick={() => rate("down")}
      />
    </>
  );
}
