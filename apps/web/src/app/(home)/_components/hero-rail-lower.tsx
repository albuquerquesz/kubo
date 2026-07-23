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

/** Compact hero utility rail: functional scroll cue followed by the installer. */
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
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <button
        type="button"
        onClick={scrollToNextSection}
        className="flex w-fit flex-col gap-2 text-foreground transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Rolar para a próxima seção"
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

      <HeroInstallCard />
    </div>
  );
}
