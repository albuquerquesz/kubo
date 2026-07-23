"use client";

import { Box, Layers, Terminal, type LucideIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

const defaultIcons: LucideIcon[] = [Terminal, Layers, Box];

export type ScrollRevealIconsProps = {
  className?: string;
  /** Lucide icons or custom components — 3 recommended. */
  icons?: LucideIcon[];
  /**
   * Kept for API compatibility — hero now drives the scrub from hero-section
   * via {@link ScrollRevealIconsHandle.getIcons}.
   */
  triggerRef?: RefObject<HTMLElement | null>;
};

export type ScrollRevealIconsHandle = {
  /** Icon elements that receive yPercent scrub (inside overflow masks). */
  getIcons: () => HTMLElement[];
};

/**
 * Desktop-only decorative icon row: each icon rises from a bottom overflow mask
 * scrubbed to scroll (Mistral grammar, original Kubo icons only).
 * Motion is started by the parent hero (shared GSAP context / pin).
 */
const ScrollRevealIcons = forwardRef<ScrollRevealIconsHandle, ScrollRevealIconsProps>(
  function ScrollRevealIcons({ className, icons = defaultIcons }, ref) {
    const rowRef = useRef<HTMLDivElement>(null);
    const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      getIcons: () => iconRefs.current.filter((el): el is HTMLSpanElement => el !== null),
    }));

    return (
      <div
        ref={rowRef}
        data-hero-motion="scroll-reveal-icons"
        className={cn("mb-6 hidden gap-4 min-[1440px]:flex", className)}
        aria-hidden
      >
        {icons.map((Icon, i) => (
          <div key={i} className="flex size-14 overflow-hidden text-primary">
            <span
              ref={(el) => {
                iconRefs.current[i] = el;
              }}
              data-hero-motion="scroll-reveal-icon"
              /*
                FOUC: inline transform only. Parent hero GSAP owns motion after mount.
                Never Tailwind translate-* (CSS longhand stacks with GSAP transform).
              */
              className="block size-full will-change-transform motion-reduce:[transform:translateY(0)]"
              style={{ transform: "translate3d(0, 100%, 0)" }}
            >
              <Icon className="size-full" strokeWidth={1.25} />
            </span>
          </div>
        ))}
      </div>
    );
  },
);

export default ScrollRevealIcons;
