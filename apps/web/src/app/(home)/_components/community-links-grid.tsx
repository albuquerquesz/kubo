"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AUTO_FOCUS_INTERVAL_MS = 2200;
const AUTO_FOCUS_RESUME_DELAY_MS = 3000;

type CommunityEntry = {
  title: string;
  description: string;
  href: string;
  image: string;
};

const communityEntries: CommunityEntry[] = [
  {
    title: "Instale skills para seu agente.",
    description:
      "Adicione playbooks de Next, Elysia, Prisma e shadcn ao Cursor, Codex ou Claude Code.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-brain-v2.png",
  },
  {
    title: "Conecte o MCP do Kubo.",
    description: "Planeje stacks, consulte schemas e gere projetos direto no seu agente de IA.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-link.png",
  },
  {
    title: "Adicione recursos depois.",
    description: "Use kubojs add para incluir PWA, Tauri, S3, OpenTUI, lint e mais sem recomeçar.",
    href: "/docs/cli#add",
    image: "/assets/gold-puzzle.png",
  },
  {
    title: "Automatize com segurança.",
    description: "Use create-json, add-json, schema e dry-run em scripts, CI e fluxos com agentes.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-workflow.png",
  },
];

export default function CommunityLinksGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    grid.addEventListener("mouseleave", handleMouseLeave);

    return () => grid.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % communityEntries.length);
    }, AUTO_FOCUS_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  useEffect(() => {
    if (isHovered || isFocused) {
      return;
    }

    const resumeTimeout = window.setTimeout(() => {
      setIsPaused(false);
    }, AUTO_FOCUS_RESUME_DELAY_MS);

    return () => window.clearTimeout(resumeTimeout);
  }, [isFocused, isHovered]);

  const activateCard = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  };

  return (
    <div
      ref={gridRef}
      className="relative mt-4 grid grid-cols-1 border-r border-b border-rule sm:grid-cols-2 xl:grid-cols-4"
    >
      {communityEntries.map((entry, index) => {
        const isExternal = entry.href.startsWith("http");
        const showProgress = activeIndex === index && !isPaused && !prefersReducedMotion;

        return (
          <Link
            key={entry.title}
            href={entry.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            data-active={activeIndex === index}
            className="group flex min-w-0 flex-col bg-muted transition-colors duration-300 ease-out hover:bg-primary/10 data-[active=true]:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            onMouseEnter={() => {
              setIsHovered(true);
              activateCard(index);
            }}
            onFocus={() => {
              setIsFocused(true);
              activateCard(index);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
          >
            <article className="relative flex min-h-[30rem] min-w-0 flex-col border-rule border-t border-l p-6 pb-4 sm:min-h-[36rem] sm:p-8 sm:pb-4">
              {showProgress ? (
                <span
                  key={`progress-${activeIndex}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-primary"
                  style={{
                    animation: `community-card-progress ${AUTO_FOCUS_INTERVAL_MS}ms linear forwards`,
                  }}
                />
              ) : null}
              <Image
                src={entry.image}
                alt=""
                width={96}
                height={96}
                className="size-10 object-contain object-left-top sm:size-12"
                aria-hidden
                unoptimized
              />
              <div className="mt-auto">
                <h3 className="min-w-0 max-w-full break-words text-balance text-lg font-semibold leading-tight tracking-tight sm:text-2xl">
                  {entry.title}
                </h3>
                <div className="mt-4 grid grid-rows-[auto] transition-[grid-template-rows,margin] duration-300 ease-out lg:mt-0 lg:grid-rows-[0fr] lg:overflow-hidden lg:group-data-[active=true]:mt-4 lg:group-data-[active=true]:grid-rows-[1fr] lg:group-hover:mt-4 lg:group-hover:grid-rows-[1fr] lg:group-focus-within:mt-4 lg:group-focus-within:grid-rows-[1fr]">
                  <p className="min-h-0 min-w-0 max-w-full break-words leading-relaxed text-pretty text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
