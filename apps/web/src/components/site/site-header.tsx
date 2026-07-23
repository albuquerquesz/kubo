"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [{ href: "/#product", label: "Produto" }] as const;

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
      { href: "/showcase", label: "Exibição de projetos" },
      { href: "/sponsors", label: "Patrocinadores" },
      { href: "https://discord.gg/ZYsbjpDaM5", label: "Discord" },
      { href: "https://x.com/byalbuquerquesz", label: "X" },
    ],
  },
] as const;

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
        className={cn("w-12 border-rule border-l lg:hidden", headerRowClass)}
        aria-label="Abrir navegação"
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
          aria-label="Navegação mobile"
          className="fixed inset-0 z-50 flex min-h-svh flex-col overflow-hidden bg-background"
        >
          <div className="flex min-h-14 shrink-0 items-center justify-between border-rule border-b px-5 py-3">
            <div>
              <p className="text-base font-semibold">Navegar no Kubo</p>
              <p className="text-muted-foreground text-xs">
                Crie, inspecione e compartilhe uma stack TypeScript.
              </p>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              className="min-h-10 gap-2 font-mono text-xs uppercase tracking-[0.08em]"
              onClick={closeNavigation}
            >
              Fechar
              <X />
            </Button>
          </div>

          <nav
            aria-label="Links de navegação mobile"
            className="grid min-h-0 flex-1 overflow-y-auto"
          >
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
              className={cn(
                buttonVariants({ variant: "cta" }),
                "min-h-16 w-full justify-between rounded-none border-0 border-rule border-b px-5",
              )}
            >
              Monte sua stack
              <ArrowUpRight
                data-icon="inline-end"
                className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
              />
            </Link>

            <div className="grid gap-px bg-rule p-px sm:grid-cols-2">
              {exploreGroups.flatMap((group) =>
                group.links.map((link) => (
                  <Link
                    key={`${group.label}-${link.href}`}
                    href={link.href}
                    onClick={closeNavigation}
                    className="min-h-14 bg-background px-5 py-4 font-mono text-xs text-muted-foreground uppercase tracking-[0.08em] transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
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

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 bg-background/95 transition-colors duration-150",
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
            buttonVariants({ variant: "cta", size: "lg" }),
            "hidden min-w-36 border-0 px-4 text-base sm:inline-flex sm:px-5",
            headerRowClass,
          )}
        >
          Monte uma stack
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
