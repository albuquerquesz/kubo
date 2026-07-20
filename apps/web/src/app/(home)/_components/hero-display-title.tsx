"use client";

import { useRef } from "react";

import { playHeroDisplayIntroWhenVisible } from "@/lib/motion/timelines/hero-display-intro";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { cn } from "@/lib/utils";

export type HeroDisplayTitleProps = {
  /** Full plain string for the SEO h1 (no JSX). */
  title: string;
  /** Visual lines; may include emphasis nodes and <br />. */
  children: React.ReactNode;
  className?: string;
  /** Play when mounted / visible. Default true. */
  autoplay?: boolean;
  /** Char stagger jitter multiplier. Default 1. */
  randomness?: number;
  /**
   * Optional Mistral-style line height grow + selective glyph doubling.
   * Default false — Kubo ships the clean masked rise only.
   */
  grow?: boolean;
};

/**
 * Dual-title hero display:
 * - `h1.sr-only` for SEO + accessibility
 * - decorative `p` with GSAP masked char rise (`aria-hidden`)
 */
export default function HeroDisplayTitle({
  title,
  children,
  className,
  autoplay = true,
  randomness = 1,
  grow = false,
}: HeroDisplayTitleProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useGsapContext(
    () => {
      const el = titleRef.current;
      if (!el) return;

      return playHeroDisplayIntroWhenVisible({
        root: el,
        autoplay,
        randomness,
        grow,
      });
    },
    {
      scope: rootRef,
      dependencies: [autoplay, randomness, grow, title],
    },
  );

  return (
    <div ref={rootRef} className="relative max-w-5xl">
      <h1 className="sr-only">{title}</h1>
      <p
        ref={titleRef}
        className={cn("ui-display js-hero-title text-foreground", className)}
        aria-hidden="true"
      >
        {children}
      </p>
    </div>
  );
}
