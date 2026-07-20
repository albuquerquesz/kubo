"use client";

import { ArrowDown } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

import HeroInstallCard from "./hero-install-card";

export type HeroRailLowerProps = {
  /** Target for the scroll cue (e.g. `product`). */
  scrollTargetId?: string;
  className?: string;
};

/**
 * Lower-right hero band: scroll cue + install card.
 * Vertical measure is owned by the parent 2×2 grid (not local flex %).
 */
export default function HeroRailLower({
  scrollTargetId = "product",
  className,
}: HeroRailLowerProps) {
  const scrollToNextSection = useCallback(() => {
    const target = document.getElementById(scrollTargetId);
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [scrollTargetId]);

  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] flex-col px-4 pt-10 pb-8 sm:px-5 lg:px-10 lg:pb-12",
        className,
      )}
    >
      <button
        type="button"
        onClick={scrollToNextSection}
        className="flex w-fit flex-col gap-2 text-foreground transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Scroll to next section"
      >
        <ArrowDown
          aria-hidden
          className="size-4 animate-fading-arrow-scroll-1"
          strokeWidth={1.75}
        />
        <ArrowDown
          aria-hidden
          className="size-4 animate-fading-arrow-scroll-2"
          strokeWidth={1.75}
        />
        <ArrowDown
          aria-hidden
          className="size-4 animate-fading-arrow-scroll-3"
          strokeWidth={1.75}
        />
      </button>

      <div className="mt-auto pt-10">
        <HeroInstallCard />
      </div>
    </div>
  );
}
