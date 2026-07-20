"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type CommunityEntry = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  kind: "video" | "note" | "project";
};

const RAIL_EDGE_TOLERANCE = 24;

const fallbackEntries: CommunityEntry[] = [
  {
    eyebrow: "Project showcase",
    title: "Inspect what people shipped.",
    description:
      "Browse real projects created from different combinations of runtimes, databases, and frontends.",
    href: "/showcase",
    cta: "Open showcase",
    kind: "project",
  },
  {
    eyebrow: "Public analytics",
    title: "Watch the ecosystem choose.",
    description:
      "See which technologies developers combine and how stack preferences change over time.",
    href: "/analytics",
    cta: "Explore analytics",
    kind: "project",
  },
  {
    eyebrow: "Discord community",
    title: "Bring the strange stack.",
    description:
      "Compare architecture choices, get unstuck, and help shape what the generator supports next.",
    href: "https://discord.gg/ZYsbjpDaM5",
    cta: "Join Discord",
    kind: "note",
  },
];

function CommunityCard({ entry }: { entry: CommunityEntry }) {
  const isExternal = entry.href.startsWith("http");

  return (
    <article className="w-[86%] shrink-0 snap-start border border-rule bg-card sm:w-[58%] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink">
      <div className="flex min-h-96 flex-col justify-between p-6 sm:min-h-[28rem] sm:p-8">
        <div>
          <p className="ui-kicker text-muted-foreground">{entry.eyebrow}</p>
          <h3 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight">
            {entry.title}
          </h3>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">{entry.description}</p>
        </div>
        <Link
          href={entry.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="group mt-auto flex min-h-12 items-center justify-between pt-10 font-mono text-xs uppercase tracking-[0.1em] text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {entry.cta}
          <ArrowUpRight className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export default function Testimonials({
  videos,
  tweets,
}: {
  videos: Array<{ embedId: string; title: string }>;
  tweets: Array<{ tweetId: string }>;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  const liveEntries: CommunityEntry[] = [
    ...videos.map((video) => ({
      eyebrow: "Community walkthrough",
      title: video.title,
      description:
        "Watch a community member build, explain, and adapt a generated TypeScript stack.",
      href: `https://www.youtube.com/watch?v=${video.embedId}`,
      cta: "Watch video",
      kind: "video" as const,
    })),
    ...tweets.map((tweet, index) => ({
      eyebrow: "Community field note",
      title: `Dispatch ${String(index + 1).padStart(2, "0")} from the community.`,
      description: "Open the original post to see the stack, context, and implementation notes.",
      href: `https://x.com/i/status/${tweet.tweetId}`,
      cta: "Read original post",
      kind: "note" as const,
    })),
  ];

  const entries = liveEntries.length > 0 ? [...liveEntries, ...fallbackEntries] : fallbackEntries;

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    setCanGoBack(rail.scrollLeft > RAIL_EDGE_TOLERANCE);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - RAIL_EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, [updateControls]);

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.78,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section aria-labelledby="community-title" className="border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">Community / Field notes</p>
        </div>
        <div className="p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2
            id="community-title"
            className="ui-display max-w-4xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92]"
          >
            The work
            <br />
            <span className="text-primary">leaves a trail.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Real builds, public decisions, and community notes—available without an autoplay loop.
          </p>
        </div>
      </div>

      <div className="border-rule border-t">
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto p-5 sm:p-8 lg:p-10"
          onScroll={updateControls}
          tabIndex={0}
          aria-label="Community stories"
        >
          {entries.map((entry, index) => (
            <CommunityCard key={`${entry.href}-${index}`} entry={entry} />
          ))}
        </div>

        <div className="flex items-center justify-between border-rule border-t">
          <p className="ui-kicker px-5 text-muted-foreground sm:px-8">
            Manual rail / {entries.length} entries
          </p>
          <div className="flex">
            <button
              type="button"
              className="grid size-14 place-items-center border-rule border-l text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              aria-label="Previous community stories"
              disabled={!canGoBack}
              onClick={() => moveRail(-1)}
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              className="grid size-14 place-items-center border-rule border-l text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              aria-label="Next community stories"
              disabled={!canGoForward}
              onClick={() => moveRail(1)}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
