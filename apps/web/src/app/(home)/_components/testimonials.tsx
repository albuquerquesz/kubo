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
    title: "See what shipped.",
    description: "Browse real stacks shipped by the community.",
    href: "/showcase",
    kind: "project",
    icon: LayoutGrid,
  },
  {
    title: "Watch the ecosystem.",
    description: "See which technologies developers combine.",
    href: "/analytics",
    kind: "project",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Bring your stack.",
    description: "Compare choices and unblock your next stack.",
    href: "https://discord.gg/ZYsbjpDaM5",
    kind: "note",
    icon: MessagesSquare,
  },
  {
    title: "Read the layers.",
    description: "Follow each layer from generator to app.",
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
      className="group flex w-[86%] shrink-0 snap-start flex-col bg-card transition-colors duration-150 ease-out hover:bg-[#2d2b20] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:w-[58%] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink"
    >
      <article className="flex min-h-96 flex-col p-6 sm:min-h-[28rem] sm:p-8">
        <Icon className="size-6 text-primary" aria-hidden />
        <div className="mt-auto">
          <h3 className="max-w-md text-3xl font-semibold leading-tight tracking-tight transition-transform duration-300 ease-out lg:group-hover:duration-700 lg:group-hover:-translate-y-1 lg:group-focus-within:duration-700 lg:group-focus-within:-translate-y-1">
            {entry.title}
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground transition-[max-height,opacity,transform] duration-[300ms] ease-out lg:max-h-0 lg:translate-y-2 lg:overflow-hidden lg:opacity-0 lg:group-hover:duration-[800ms] lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:duration-[800ms] lg:group-focus-within:max-h-24 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
            {entry.description}
          </p>
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
      description: "Watch a community member ship a TypeScript stack.",
      href: `https://www.youtube.com/watch?v=${video.embedId}`,
      kind: "video" as const,
      icon: Play,
    })),
    ...tweets.map((tweet, index) => ({
      title: `Dispatch ${String(index + 1).padStart(2, "0")} from the community.`,
      description: "See the stack, context, and implementation notes.",
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
