"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type MobileNavLink = {
  href: string;
  label: string;
};

type MobileNavOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: readonly MobileNavLink[];
  /** Called after close so the opener can restore focus. */
  onCloseComplete?: () => void;
};

export function MobileNavOverlay({
  open,
  onOpenChange,
  links,
  onCloseComplete,
}: MobileNavOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
    requestAnimationFrame(() => onCloseComplete?.());
  }, [onOpenChange, onCloseComplete]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const bodyOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
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

    // Focus first nav link (no dedicated close control — dismiss via backdrop / Escape).
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!mounted || !open) return null;

  // Portal to body so we are not trapped in the header's fixed stacking context
  // (fixed-inside-fixed is unreliable on iOS Safari and can leave the page fully
  // visible under a "transparent" looking menu).
  return createPortal(
    <div
      ref={panelRef}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Navegação mobile"
      className={cn(
        // Near-opaque so menu stays readable without fully killing the page behind.
        "fixed inset-0 z-[100] flex h-dvh w-full items-center justify-center bg-black/90",
        "pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-black/90" onClick={close} />

      <nav
        aria-label="Links de navegação mobile"
        className="relative z-10 flex max-h-[min(80dvh,100%)] flex-col items-center gap-6 overflow-y-auto overscroll-contain px-6 py-8"
      >
        {links.map((link) => {
          const isExternal = link.href.startsWith("http");
          const className =
            "font-mono text-lg text-white/90 tracking-[0.04em] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-xl";

          if (isExternal) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className={className}
              >
                {link.label}
              </a>
            );
          }

          return (
            <Link key={link.href} href={link.href} onClick={close} className={className}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>,
    document.body,
  );
}
