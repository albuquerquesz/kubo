"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa6";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/#product", label: "Product" },
  { href: "/#capabilities", label: "System" },
] as const;

const exploreGroups = [
  {
    label: "Understand",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/analytics", label: "Usage analytics" },
      { href: "/stack", label: "Stack display" },
    ],
  },
  {
    label: "Community",
    links: [
      { href: "/showcase", label: "Project showcase" },
      { href: "/sponsors", label: "Sponsors" },
      { href: "https://discord.gg/ZYsbjpDaM5", label: "Discord" },
    ],
  },
] as const;

const githubUrl = "https://github.com/AmanVarshney01/create-better-t-stack";

function BrandMark() {
  return (
    <Link
      href="/"
      className="flex h-14 shrink-0 items-center gap-1.5 border-rule border-r px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-2 sm:px-5"
      aria-label="Kubo home"
    >
      <span aria-hidden className="relative size-10 shrink-0 overflow-hidden sm:size-11">
        <Image
          src="/assets/kubo-mark.png"
          alt=""
          width={44}
          height={44}
          className="size-10 object-contain sm:size-11"
        />
      </span>
    </Link>
  );
}

function DesktopNavigation() {
  return (
    <nav className="hidden h-14 items-stretch lg:flex" aria-label="Primary navigation">
      {primaryLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex min-w-24 items-center justify-center border-rule border-r px-5 font-mono text-xs text-muted-foreground uppercase tracking-[0.08em] transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeNavigation = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;

    const bodyOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const firstElement = focusableElements.at(0);
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-lg"
        className="h-14 w-14 border-rule border-l lg:hidden"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </Button>
      {isOpen && (
        <div
          ref={panelRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex min-h-svh flex-col overflow-hidden bg-background"
        >
          <div className="flex min-h-14 shrink-0 items-center justify-between border-rule border-b px-5 py-3">
            <div>
              <p className="text-base font-semibold">Navigate Kubo</p>
              <p className="text-muted-foreground text-xs">
                Build, inspect, and share a TypeScript stack.
              </p>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              className="min-h-10 gap-2 font-mono text-xs uppercase tracking-[0.08em]"
              onClick={closeNavigation}
            >
              Close
              <X />
            </Button>
          </div>

          <nav aria-label="Mobile navigation links" className="grid min-h-0 flex-1 overflow-y-auto">
            {[...primaryLinks, { href: "/docs", label: "Docs" }].map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeNavigation}
                className="group grid min-h-20 grid-cols-[3rem_1fr_auto] items-center border-rule border-b px-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xl font-semibold">{link.label}</span>
                <ArrowUpRight className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto shrink-0">
            <Link
              href="/new"
              onClick={closeNavigation}
              className="flex min-h-16 items-center justify-between border-rule border-b bg-primary px-5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
              Build your stack
              <ArrowUpRight />
            </Link>

            <div className="grid gap-px bg-rule p-px sm:grid-cols-2">
              {exploreGroups.flatMap((group) =>
                group.links.map((link) => (
                  <Link
                    key={`${group.label}-${link.href}`}
                    href={link.href}
                    onClick={closeNavigation}
                    className="min-h-14 bg-background px-5 py-4 font-mono text-xs text-muted-foreground uppercase tracking-[0.08em] hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    {link.label}
                  </Link>
                )),
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/95 transition-colors duration-150">
      <div className="ui-frame flex h-14 items-stretch border-b border-rule">
        <BrandMark />
        <DesktopNavigation />
        <div className="min-w-0 flex-1" />
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 items-center gap-2 border-rule border-l px-4 font-mono text-xs text-muted-foreground uppercase tracking-[0.08em] hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          aria-label="Kubo on GitHub"
        >
          <FaGithub />
          <span className="hidden md:inline">GitHub</span>
        </a>
        <Link
          href="/new"
          className={cn(
            buttonVariants({ size: "lg" }),
            "hidden h-14 min-w-36 border-0 px-5 sm:inline-flex",
          )}
        >
          Build a stack
          <ArrowUpRight data-icon="inline-end" />
        </Link>
        <MobileNavigation />
      </div>
    </header>
  );
}
