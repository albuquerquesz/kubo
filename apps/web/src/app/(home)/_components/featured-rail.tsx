"use client";

import { ChevronDown } from "lucide-react";
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
  mission: string;
  kicker?: string;
  items: readonly FeaturedRailItem[];
  /** Target for the optional scroll cue (e.g. `#product`). */
  scrollTargetId?: string;
  className?: string;
};

/**
 * Right-rail grammar from the Mistral featured column:
 * mission (bottom-biased) → triple chevron pulse → kicker + horizontal card.
 */
export default function FeaturedRail({
  mission,
  kicker = "Featured",
  items,
  scrollTargetId = "product",
  className,
}: FeaturedRailProps) {
  const active = items[0];

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
        "flex flex-col border-rule border-t bg-background lg:min-h-[calc(100svh-3.5rem)] lg:border-t-0 lg:border-l",
        className,
      )}
      aria-label="Mission and featured links"
    >
      <div className="flex min-h-[14rem] flex-3 flex-col justify-end px-4 py-10 sm:px-5 lg:px-10 lg:py-0 lg:pb-10">
        <p className="max-w-[22rem] text-xl leading-snug font-normal text-foreground sm:text-[1.35rem] sm:leading-[1.35]">
          {mission}
        </p>
      </div>

      <div className="flex min-h-[16rem] flex-2 flex-col border-rule border-t px-4 pt-10 pb-6 sm:px-5 lg:px-10 lg:pb-10">
        <button
          type="button"
          onClick={scrollToNextSection}
          className="flex w-fit flex-col gap-2 text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Scroll to next section"
        >
          <ChevronDown
            aria-hidden
            className="size-4 animate-fading-arrow-scroll-1"
            strokeWidth={1.75}
          />
          <ChevronDown
            aria-hidden
            className="size-4 animate-fading-arrow-scroll-2"
            strokeWidth={1.75}
          />
          <ChevronDown
            aria-hidden
            className="size-4 animate-fading-arrow-scroll-3"
            strokeWidth={1.75}
          />
        </button>

        <div className="mt-auto flex flex-col gap-2 pt-10">
          <p className="ui-kicker text-muted-foreground">{kicker}</p>

          <Link
            href={active.href}
            className="flex w-full items-center gap-4 rounded-md border border-rule p-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
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
