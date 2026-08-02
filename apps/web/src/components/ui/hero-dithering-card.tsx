"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { lazy, Suspense, useEffect, useState } from "react";

import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { cn } from "@/lib/utils";

const PRIMARY_FALLBACK = "#c49314";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })),
);

function useThemePrimary(): string {
  const [primary, setPrimary] = useState(PRIMARY_FALLBACK);

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      setPrimary(value || PRIMARY_FALLBACK);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return primary;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    return onReducedMotionChange(setReduced);
  }, []);

  return reduced;
}

export type CTASectionProps = {
  className?: string;
};

/**
 * Centered marketing CTA card with Paper Design dithering atmosphere.
 * Used as the default home hero.
 */
export function CTASection({ className }: CTASectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const primary = useThemePrimary();
  const reducedMotion = usePrefersReducedMotion();

  const shaderSpeed = reducedMotion ? 0 : isHovered ? 0.6 : 0.2;

  return (
    <section
      id="top"
      aria-label="Seção principal"
      className={cn(
        // Cancel layout header offset so the stage paints edge-to-edge under the fixed bar.
        "relative -mt-[var(--site-header-height)] flex h-svh min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-card",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Suspense fallback={<div className="absolute inset-0 bg-muted/20" aria-hidden />}>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen"
          aria-hidden
        >
          <Dithering
            colorBack="#00000000"
            colorFront={primary}
            shape="warp"
            type="4x4"
            speed={shaderSpeed}
            className="size-full"
            minPixelRatio={1}
          />
        </div>
      </Suspense>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            {!reducedMotion ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            ) : null}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Stack em minutos
        </div>

        <h1
          className={cn(
            "ui-display mb-8 max-w-[16ch] text-5xl font-medium leading-[1.05] tracking-tight text-foreground",
            "md:text-7xl lg:text-8xl",
          )}
        >
          Construa sem
          <br />
          <span className="text-foreground/80">começar do zero.</span>
        </h1>

        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.
          Limpo, preciso e do seu jeito.
        </p>

        <Link
          href="/new"
          className={cn(
            "group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-12",
            "text-base font-medium text-primary-foreground transition-all duration-300",
            "hover:scale-105 hover:bg-primary/90 hover:ring-4 hover:ring-primary/20 active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <span className="relative z-10">Monte sua stack</span>
          <ArrowRight
            aria-hidden
            className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}

export default CTASection;
