"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

import { KuboMark } from "@/components/brand/kubo-mark";
import { cn } from "@/lib/utils";

const primaryLinks = [{ href: "/#documentation", label: "Docs" }] as const;

const socialLinks = [
  {
    href: "https://x.com/byalbuquerquesz",
    label: "Kubo no X",
    icon: FaXTwitter,
  },
  {
    href: "https://github.com/albuquerquesz/kubo",
    label: "Kubo no GitHub",
    icon: FaGithub,
  },
] as const;

const headerRowClass = "h-12";

const utilityLinkClass =
  "flex items-center justify-center border-rule border-l px-3 font-mono text-sm text-muted-foreground tracking-[0.04em] transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3.5";

function BrandMark() {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center border-rule border-r px-3 transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3.5",
        headerRowClass,
      )}
      aria-label="Início Kubo"
    >
      <KuboMark className="h-7 w-auto" title="Kubo" />
    </Link>
  );
}

function DesktopNavigation() {
  return (
    <nav
      className={cn("hidden items-stretch lg:flex", headerRowClass)}
      aria-label="Navegação principal"
    >
      {primaryLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex min-w-24 items-center justify-center border-rule border-r px-5 font-mono text-xs text-muted-foreground tracking-[0.04em] transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-rule border-b bg-background/95 transition-colors duration-150",
        className,
      )}
    >
      <div className="flex w-full items-stretch">
        <BrandMark />
        <DesktopNavigation />
        <div className="min-w-0 flex-1" />
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={cn(utilityLinkClass, headerRowClass)}
              aria-label={link.label}
            >
              <Icon className="size-5" />
            </a>
          );
        })}
        <Link
          href="/new"
          className={cn(
            "group/button inline-flex shrink-0 select-none items-center justify-center gap-2 border-0 bg-primary px-5",
            "rounded-none font-semibold text-base tracking-[-0.02em] text-primary-foreground transition-all",
            "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
            "min-w-36",
            headerRowClass,
          )}
        >
          Montar stack
          <ArrowUpRight
            data-icon="inline-end"
            className="size-5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
