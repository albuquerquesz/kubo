/*
 * Icons drawn only with CSS (borders, pseudo-elements and keyframes in ./chatbot.css).
 * No SVG, image or icon package: each icon is an empty span plus a few child spans.
 * Animations are disabled under `prefers-reduced-motion`.
 */

import type { CSSProperties } from "react";

type IconStyle = CSSProperties & { "--kc-icon-size": string };

export type CssIconName =
  | "send"
  | "stop"
  | "new-chat"
  | "thinking"
  | "loading"
  | "copy"
  | "menu"
  | "refresh"
  | "thumb-up"
  | "thumb-down"
  | "chevron"
  | "close"
  | "check"
  | "sidebar"
  | "sun"
  | "moon"
  | "sparkle"
  | "tool";

/** Icons that need extra strokes beyond `::before` / `::after`. */
const CHILD_SPANS: Partial<Record<CssIconName, number>> = {
  copy: 1,
  menu: 3,
  "thumb-up": 1,
  "thumb-down": 1,
};

export function CssIcon({
  name,
  size = 16,
  state,
  className,
}: {
  name: CssIconName;
  size?: number;
  /** drives state transitions such as copy → check, menu → close, thumb on */
  state?: "done" | "open" | "on" | "active";
  className?: string;
}) {
  const children = CHILD_SPANS[name] ?? 0;
  const style: IconStyle = { "--kc-icon-size": `${size}px` };
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={`kc-icon kc-icon-${name}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {Array.from({ length: children }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}
