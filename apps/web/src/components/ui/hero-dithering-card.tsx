"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { KuboMarkMotion, type KuboMarkMotionHandle } from "@/components/brand/kubo-mark-motion";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_PACKAGE_MANAGER, getCreateCommand } from "@/lib/create-commands";
import { fireCtaConfetti } from "@/lib/motion/cta-confetti";
import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  playHeroContentIntro,
  waitForHeroIntroGate,
} from "@/lib/motion/timelines/hero-content-intro";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { cn } from "@/lib/utils";

import "./hero-dithering-card.css";

const PRIMARY_FALLBACK = "#c49314";
const HERO_TITLE = "Construa sem começar do zero.";

void import("@paper-design/shaders-react");

const Dithering = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })),
  { ssr: false, loading: () => null },
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

function HeroDitherShader({
  primary,
  speed,
  onReady,
}: {
  primary: string;
  speed: number;
  onReady: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let done = false;
    const mark = () => {
      if (done) return;
      done = true;
      onReady();
    };

    if (host.querySelector("canvas")) {
      const id = requestAnimationFrame(() => mark());
      return () => cancelAnimationFrame(id);
    }

    const observer = new MutationObserver(() => {
      if (host.querySelector("canvas")) {
        observer.disconnect();
        requestAnimationFrame(() => mark());
      }
    });
    observer.observe(host, { childList: true, subtree: true });

    const safety = window.setTimeout(mark, 1000);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, [onReady]);

  return (
    <div ref={hostRef} className="hero-dither-shader size-full">
      <Dithering
        colorBack="#00000000"
        colorFront={primary}
        shape="warp"
        type="4x4"
        speed={speed}
        className="size-full"
        minPixelRatio={1}
      />
    </div>
  );
}

export type CTASectionProps = {
  className?: string;
};

export function CTASection({ className }: CTASectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<KuboMarkMotionHandle>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const primary = useThemePrimary();
  const reducedMotion = usePrefersReducedMotion();
  const command = getCreateCommand(DEFAULT_PACKAGE_MANAGER);

  const shaderSpeed = reducedMotion ? 0 : isHovered ? 0.6 : 0.2;

  const onShaderReady = useCallback(() => {
    setShaderReady(true);
  }, []);

  useGsapContext(
    () => {
      const root = contentRef.current;
      const badge = badgeRef.current;
      const title = titleRef.current;
      const body = bodyRef.current;
      const cta = ctaRef.current;
      if (!root || !badge || !title || !body || !cta) return;

      if (prefersReducedMotion()) {
        return playHeroContentIntro({ root, badge, title, body, cta });
      }

      const abort = new AbortController();
      let killIntro: (() => void) | undefined;

      void (async () => {
        await waitForHeroIntroGate({
          minHoldMs: 0,
          fontsTimeoutMs: 150,
          signal: abort.signal,
        });

        if (abort.signal.aborted) return;
        killIntro = playHeroContentIntro({ root, badge, title, body, cta });
      })();

      return () => {
        abort.abort();
        killIntro?.();
      };
    },
    { scope: contentRef, dependencies: [HERO_TITLE] },
  );

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const root = contentRef.current;
      if (root?.dataset.heroIntro === "pending") {
        root.dataset.heroIntro = "done";
      }
    }, 1400);
    return () => window.clearTimeout(id);
  }, []);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);

      const cta = ctaRef.current;
      if (cta) fireCtaConfetti(cta);
      markRef.current?.celebrate();

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="top"
      aria-label="Seção principal"
      className={cn(
        "relative -mt-[var(--site-header-height)] flex h-svh min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="hero-dither-stage pointer-events-none absolute inset-0 z-0"
        data-shader-ready={shaderReady ? "true" : "false"}
        aria-hidden
      >
        <div className="hero-dither-fallback" />

        <div
          className={cn(
            "absolute inset-0 opacity-55 mix-blend-multiply dark:opacity-45 dark:mix-blend-screen",
          )}
        >
          <HeroDitherShader primary={primary} speed={shaderSpeed} onReady={onShaderReady} />
        </div>
      </div>

      <div
        ref={contentRef}
        className="hero-content relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center"
        data-hero-intro="pending"
      >
        <div ref={badgeRef} className="mb-8 flex items-center justify-center" aria-hidden>
          <KuboMarkMotion ref={markRef} className="h-14 w-auto" idle />
        </div>

        <h1
          ref={titleRef}
          className={cn(
            "ui-grotesk mb-8 max-w-[16ch] text-5xl font-medium leading-[1.05] tracking-tight text-foreground",
            "md:text-7xl lg:text-8xl",
          )}
        >
          Construa sem
          <br />
          <span className="text-foreground/80">começar do zero.</span>
        </h1>

        <p
          ref={bodyRef}
          className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.
          Limpo, preciso e do seu jeito.
        </p>

        <button
          ref={ctaRef}
          type="button"
          onClick={copyCommand}
          className={cn(buttonVariants({ variant: "cta", size: "xl" }), "relative")}
          aria-label={copied ? "Comando copiado" : `Copiar comando: ${command}`}
          title={copied ? "Copiado" : "Clique para copiar"}
        >
          <span className="sr-only" aria-live="polite">
            {copied ? "Comando copiado" : "Copiar comando"}
          </span>
          <code className="max-w-[min(100%,28rem)] truncate font-mono text-sm tracking-[0.04em] sm:text-base">
            {command}
          </code>
        </button>
      </div>
    </section>
  );
}

export default CTASection;
