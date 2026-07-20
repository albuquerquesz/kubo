"use client";

import { Box, Layers, Terminal, type LucideIcon } from "lucide-react";
import { useRef, type RefObject } from "react";

import {
  playScrollRevealIcons,
  SCROLL_REVEAL_ICONS_DEFAULTS,
  SCROLL_REVEAL_ICONS_HERO,
} from "@/lib/motion/timelines/scroll-reveal-icons";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { cn } from "@/lib/utils";

const defaultIcons: LucideIcon[] = [Terminal, Layers, Box];

export type ScrollRevealIconsProps = {
  className?: string;
  /** Lucide icons or custom components — 3 recommended. */
  icons?: LucideIcon[];
  /**
   * ScrollTrigger root. Prefer the hero section when icons are already in the
   * initial viewport so scrub starts at rest (yPercent 100) on page load.
   * Hero pin uses Family B window (start top top → icons end before scale locks).
   */
  triggerRef?: RefObject<HTMLElement | null>;
};

/**
 * Desktop-only decorative icon row: each icon rises from a bottom overflow mask
 * scrubbed to scroll (Mistral grammar, original Kubo icons only).
 */
export default function ScrollRevealIcons({
  className,
  icons = defaultIcons,
  triggerRef,
}: ScrollRevealIconsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGsapContext(
    () => {
      const trigger = triggerRef?.current ?? rowRef.current;
      if (!trigger) return;

      const iconEls = iconRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      if (iconEls.length === 0) return;

      // Hero section trigger: scrub across sticky pin (Family B range).
      // Self-trigger: enter-viewport defaults (75% → 35%).
      const usingSectionTrigger = Boolean(triggerRef?.current);
      const range = usingSectionTrigger ? SCROLL_REVEAL_ICONS_HERO : SCROLL_REVEAL_ICONS_DEFAULTS;
      const handle = playScrollRevealIcons({
        icons: iconEls,
        trigger,
        start: range.start,
        end: range.end,
        scrub: range.scrub,
        stagger: range.stagger,
      });

      return handle.kill;
    },
    {
      scope: rowRef,
      dependencies: [icons, triggerRef],
    },
  );

  return (
    <div ref={rowRef} className={cn("mb-6 hidden gap-4 lg:flex", className)} aria-hidden>
      {icons.map((Icon, i) => (
        <div key={i} className="flex size-14 overflow-hidden text-primary">
          {/*
            CSS rest state keeps icons clipped before GSAP hydrates (no FOUC).
            motion-reduce shows final state without waiting for JS.
          */}
          <span
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="block size-full translate-y-full will-change-transform motion-reduce:translate-y-0"
          >
            <Icon className="size-full" strokeWidth={1.25} />
          </span>
        </div>
      ))}
    </div>
  );
}
