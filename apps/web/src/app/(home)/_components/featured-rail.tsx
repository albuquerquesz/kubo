"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

export type FeaturedRailItem = {
  id: string;
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

export type FeaturedRailProps = {
  /**
   * Mission copy as intentional line breaks (Mistral right-rail grammar).
   * Prefer a string array; a single string is split on newlines.
   */
  mission: string | readonly string[];
  kicker?: string;
  items: readonly FeaturedRailItem[];
  /** Target for the optional scroll cue (e.g. `#product`). */
  scrollTargetId?: string;
  className?: string;
};

/**
 * Right-rail grammar from the Mistral featured column:
 * mission (bottom-biased) → triple arrow pulse → kicker + horizontal card.
 */
export default function FeaturedRail({
  mission,
  kicker = "Featured",
  items,
  scrollTargetId = "product",
  className,
}: FeaturedRailProps) {
  const active = items[0];

  const missionLines =
    typeof mission === "string"
      ? mission
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : mission;

  const scrollToNextSection = useCallback(() => {
    const target = document.getElementById(scrollTargetId);
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [scrollTargetId]);

  if (!active) return null;

  return (
    <aside
      className={cn(
        "flex h-full min-h-[28rem] w-full flex-col border-rule border-t bg-background sm:min-h-[32rem] lg:min-h-0 lg:border-t-0 lg:border-l",
        className,
      )}
      aria-label="Mission and featured links"
    >
      <div className="flex min-h-[16rem] flex-[4] flex-col justify-end px-4 py-10 sm:px-5 lg:px-10 lg:py-0 lg:pb-10">
        {/*
          Mistral right-rail sentence strategy: intentional line blocks + lg:text-nowrap
          so breaks are editorial, not viewport-reflow. sr-only holds full sentence.
        */}
        <p className="text-2xl leading-[1.3] font-medium text-foreground sm:text-[1.65rem] lg:text-[1.75rem]">
          <span className="sr-only">{missionLines.join(" ")}</span>
          <span aria-hidden className="flex flex-col items-start">
            {missionLines.map((line) => (
              <span key={line} className="block lg:text-nowrap">
                {line}
              </span>
            ))}
          </span>
        </p>
      </div>

      <div className="flex min-h-[12rem] flex-[1.5] flex-col border-rule border-t px-4 pt-10 pb-6 sm:px-5 lg:px-10 lg:pb-10">
        <button
          type="button"
          onClick={scrollToNextSection}
          className="flex w-fit flex-col gap-2.5 text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Scroll to next section"
        >
          <ArrowDown
            aria-hidden
            className="size-6 animate-fading-arrow-scroll-1"
            strokeWidth={1.75}
          />
          <ArrowDown
            aria-hidden
            className="size-6 animate-fading-arrow-scroll-2"
            strokeWidth={1.75}
          />
          <ArrowDown
            aria-hidden
            className="size-6 animate-fading-arrow-scroll-3"
            strokeWidth={1.75}
          />
        </button>

        <div className="mt-auto flex flex-col gap-2 pt-10">
          <p className="ui-kicker text-muted-foreground">{kicker}</p>

          <Link
            href={active.href}
            className="flex w-full items-center gap-4 rounded-[12px] border border-rule p-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={active.imageSrc}
                alt={active.imageAlt}
                width={64}
                height={64}
                className="size-16 object-cover"
              />
            </span>
            <span className="min-w-0 text-sm leading-snug font-medium text-foreground sm:text-base">
              {active.title}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
