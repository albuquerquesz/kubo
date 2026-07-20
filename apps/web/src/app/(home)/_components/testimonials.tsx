"use client";

import {
  BookOpen,
  ChartNoAxesColumn,
  LayoutGrid,
  MessagesSquare,
  type LucideIcon,
  Play,
  Quote,
} from "lucide-react";
import Link from "next/link";

type CommunityEntry = {
  title: string;
  description: string;
  href: string;
  kind: "video" | "note" | "project";
  icon: LucideIcon;
};

const fallbackEntries: CommunityEntry[] = [
  {
    title: "Inspect what people shipped.",
    description:
      "Browse real projects created from different combinations of runtimes, databases, and frontends.",
    href: "/showcase",
    kind: "project",
    icon: LayoutGrid,
  },
  {
    title: "Watch the ecosystem choose.",
    description:
      "See which technologies developers combine and how stack preferences change over time.",
    href: "/analytics",
    kind: "project",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Bring the strange stack.",
    description:
      "Compare architecture choices, get unstuck, and help shape what the generator supports next.",
    href: "https://discord.gg/ZYsbjpDaM5",
    kind: "note",
    icon: MessagesSquare,
  },
  {
    title: "Read how the layers fit.",
    description: "Walk through generators, stack choices, and how each layer wires into the next.",
    href: "/docs",
    kind: "project",
    icon: BookOpen,
  },
];

function CommunityCard({ entry }: { entry: CommunityEntry }) {
  const isExternal = entry.href.startsWith("http");
  const Icon = entry.icon;

  return (
    <Link
      href={entry.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group flex w-[86%] shrink-0 snap-start flex-col bg-card transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:w-[58%] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink"
    >
      <article className="flex min-h-96 flex-col justify-between p-6 sm:min-h-[28rem] sm:p-8">
        <Icon className="size-6 text-primary" aria-hidden />
        <div>
          <h3 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            {entry.title}
          </h3>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">{entry.description}</p>
        </div>
      </article>
    </Link>
  );
}

export default function Testimonials({
  videos,
  tweets,
}: {
  videos: Array<{ embedId: string; title: string }>;
  tweets: Array<{ tweetId: string }>;
}) {
  const liveEntries: CommunityEntry[] = [
    ...videos.map((video) => ({
      title: video.title,
      description:
        "Watch a community member build, explain, and adapt a generated TypeScript stack.",
      href: `https://www.youtube.com/watch?v=${video.embedId}`,
      kind: "video" as const,
      icon: Play,
    })),
    ...tweets.map((tweet, index) => ({
      title: `Dispatch ${String(index + 1).padStart(2, "0")} from the community.`,
      description: "Open the original post to see the stack, context, and implementation notes.",
      href: `https://x.com/i/status/${tweet.tweetId}`,
      kind: "note" as const,
      icon: Quote,
    })),
  ];

  const entries = liveEntries.length > 0 ? [...liveEntries, ...fallbackEntries] : fallbackEntries;

  return (
    <section aria-label="Community" className="border-rule border-b">
      <div className="p-5 sm:p-8 lg:p-10">
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-px overflow-x-auto border border-rule bg-rule"
          tabIndex={0}
          aria-label="Community stories"
        >
          {entries.map((entry, index) => (
            <CommunityCard key={`${entry.href}-${index}`} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
