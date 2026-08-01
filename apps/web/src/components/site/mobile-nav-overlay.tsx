"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    requestAnimationFrame(() => onCloseComplete?.());
  }, [onOpenChange, onCloseComplete]);

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
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Navegação mobile"
      className={cn(
        "fixed inset-0 z-50 flex h-dvh w-full items-center justify-center",
        "pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-black/50" onClick={close} />

      <button
        ref={closeButtonRef}
        type="button"
        onClick={close}
        className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-10 flex size-11 items-center justify-center text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Fechar"
      >
        <X className="size-6" />
      </button>

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
    </div>
  );
}
