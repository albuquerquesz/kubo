"use client";

import Link from "next/link";

import { HeaderAccount } from "@/components/auth/header-account";
import { KuboMark } from "@/components/brand/kubo-mark";
import { cn } from "@/lib/utils";

const primaryLinks = [{ href: "/docs", label: "Docs" }] as const;

const headerRowClass = "h-12";

const utilityLinkClass =
  "flex items-center justify-center border-rule border-l px-3 font-mono text-sm text-muted-foreground tracking-[0.04em] transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3.5";

const ctaClass =
  "inline-flex min-w-32 shrink-0 select-none items-center justify-center bg-primary px-5 font-semibold text-base text-primary-foreground tracking-[-0.02em] transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

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
        <HeaderAccount
          className={cn(utilityLinkClass, headerRowClass)}
          ctaClassName={cn(ctaClass, headerRowClass)}
        />
      </div>
    </header>
  );
}
