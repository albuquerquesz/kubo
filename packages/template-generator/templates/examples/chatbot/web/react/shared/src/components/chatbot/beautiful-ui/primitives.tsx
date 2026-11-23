"use client";

/*
 * RECREATED — not copied. Beautiful UI's ApprovalCard imports `Button` and `GlideMenu`
 * from the site's own atoms, which the site does not publish. These are written from
 * scratch for this template to match the props and look ApprovalCard expects.
 * See ./LICENSE for the components that are adapted from Beautiful UI.
 */

import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

const BUTTON_VARIANTS = {
  ghost: "text-ink-2 hover:bg-hover hover:text-ink",
  accent: "bg-ink text-surface shadow-btn hover:opacity-90",
} as const;

const BUTTON_SIZES = {
  sm: "h-7 px-2.5 text-[12.5px]",
  md: "h-8 px-3 text-[13px]",
} as const;

export function Button({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-[background-color,color,opacity,transform] duration-150 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}${className ? ` ${className}` : ""}`}
    />
  );
}

/** A list whose rows share one highlight that glides to the hovered `[data-menu-row]`. */
export function GlideMenu({
  children,
  className,
  highlightClassName,
}: {
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;
    const row = event.target.closest("[data-menu-row]");
    if (!(row instanceof HTMLElement) || !rootRef.current?.contains(row)) return;
    setBox({ top: row.offsetTop, height: row.offsetHeight });
    setVisible(true);
  };

  return (
    <div
      ref={rootRef}
      onPointerOver={onPointerOver}
      onPointerLeave={() => setVisible(false)}
      className={`relative${className ? ` ${className}` : ""}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute${highlightClassName ? ` ${highlightClassName}` : ""}`}
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: visible && box ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}
