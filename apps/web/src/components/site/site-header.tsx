"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";

import { MobileNavOverlay, type MobileNavLink } from "@/components/site/mobile-nav-overlay";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [{ href: "/#documentation", label: "Docs" }] as const;

const exploreGroups = [
  {
    label: "Entenda",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/analytics", label: "Análise de uso" },
      { href: "/stack", label: "Exibição da stack" },
    ],
  },
  {
    label: "Comunidade",
    links: [
      { href: "/sponsors", label: "Patrocinadores" },
      { href: "https://discord.gg/ZYsbjpDaM5", label: "Discord" },
      { href: "https://x.com/byalbuquerquesz", label: "X" },
    ],
  },
] as const;

function buildMobileNavLinks(): MobileNavLink[] {
  const seen = new Set<string>();
  const links: MobileNavLink[] = [];

  const push = (href: string, label: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    links.push({ href, label });
  };

  for (const link of primaryLinks) {
    push(link.href, link.label);
  }
  // Site pages only — socials stay in the header utility row, not the overlay.
  for (const link of exploreGroups.find((group) => group.label === "Entenda")?.links ?? []) {
    push(link.href, link.label);
  }
  push("/sponsors", "Patrocinadores");
  push("/new", "Monte sua stack");

  return links;
}

const mobileNavLinks = buildMobileNavLinks();

const socialLinks = [
  {
    href: "https://x.com/byalbuquerquesz",
    label: "Kubo no X",
    icon: FaXTwitter,
  },
  {
    href: "https://discord.gg/ZYsbjpDaM5",
    label: "Kubo no Discord",
    icon: FaDiscord,
  },
  {
    href: "https://github.com/albuquerquesz/kubo",
    label: "Kubo no GitHub",
    icon: FaGithub,
  },
] as const;

/** Shared fixed-bar height — keep mark, nav, utilities, and layout offset in sync. */
const headerRowClass = "h-12";

const utilityLinkClass =
  "flex items-center justify-center border-rule border-l px-3 font-mono text-sm text-muted-foreground tracking-[0.04em] transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3.5";

function BrandMark() {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-1.5 overflow-hidden border-rule border-r px-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-2 sm:px-2.5",
        headerRowClass,
      )}
      aria-label="Início Kubo"
    >
      <span aria-hidden className="relative size-7 shrink-0 overflow-hidden sm:size-8">
        <Image
          src="/assets/kubo-mark.png"
          alt=""
          width={32}
          height={32}
          className="size-7 object-contain sm:size-8"
        />
      </span>
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

function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(utilityLinkClass, "w-12 lg:hidden", headerRowClass)}
        aria-label="Abrir navegação"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5" />
      </button>
      <MobileNavOverlay
        open={isOpen}
        onOpenChange={setIsOpen}
        links={mobileNavLinks}
        onCloseComplete={() => triggerRef.current?.focus()}
      />
    </>
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
            buttonVariants({ variant: "cta", size: "xl" }),
            "hidden min-w-36 border-0 text-base sm:inline-flex",
            headerRowClass,
          )}
        >
          Montar stack
          <ArrowUpRight
            data-icon="inline-end"
            className="size-5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
          />
        </Link>
        <MobileNavigation />
      </div>
    </header>
  );
}
