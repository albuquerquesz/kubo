"use client";

import { useRef } from "react";

import { ScrollTrigger } from "@/lib/motion/gsap-client";
import { playHeroStickyScale } from "@/lib/motion/timelines/hero-sticky-scale";
import { playHeroScrollRevealIcons } from "@/lib/motion/timelines/scroll-reveal-icons";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";
import ScrollRevealIcons, { type ScrollRevealIconsHandle } from "./scroll-reveal-icons";

/** Editorial line breaks — three lines only (right-rail sentence strategy). */
const mission = [
  "Um app TypeScript full-stack",
  "a partir de um comando",
  "com cada camada tipada.",
] as const;

/**
 * Shared horizontal band padding so title + mission sit on the same bottom edge
 * of the upper grid row (pb matches across columns).
 */
const upperBandClass =
  "flex h-full min-h-[10rem] flex-col justify-end px-4 py-10 sm:min-h-[12rem] sm:px-5 min-[1440px]:min-h-0 min-[1440px]:px-6 min-[1440px]:pt-0 min-[1440px]:pb-10 min-[1680px]:px-8 min-[1920px]:px-10";

/**
 * Family B host — in-flow inside R1 card (Mistral model).
 * Large desktop type + padding create the unscaled offset box; GSAP scale
 * 0.47→1 makes rest look like a rail chip and end like stage type.
 *
 * Desktop: `min-[1440px]:w-max` so nowrap mission lines size the host past the 30% rail.
 * End pose centers the host in the sticky shell (stage takeover).
 */
const rightTopHostClass =
  "relative z-20 origin-bottom-left will-change-transform motion-reduce:transform-none " +
  "flex w-full flex-col items-start justify-end " +
  "min-[1440px]:w-max min-[1440px]:max-w-none " +
  // Desktop intermediario: menos inset para a rail preservar massa visual.
  "min-[1440px]:p-10 min-[1680px]:p-14 min-[1920px]:p-18";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const scaleTargetRef = useRef<HTMLDivElement>(null);
  const stageClearLowerRef = useRef<HTMLDivElement>(null);
  const stageClearL2Ref = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconsRef = useRef<ScrollRevealIconsHandle>(null);

  useGsapContext(
    () => {
      const trigger = sectionRef.current;
      const target = scaleTargetRef.current;
      const sticky = stickyRef.current;
      const title = titleWrapRef.current;
      if (!trigger || !target) return;

      const sentences = sentenceRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      const icons = iconsRef.current?.getIcons() ?? [];
      const stageClear = [stageClearLowerRef.current, stageClearL2Ref.current].filter(
        (el): el is HTMLDivElement => el !== null,
      );

      const scaleHandle = playHeroStickyScale({
        trigger,
        target,
        sticky,
        title,
        stageClear,
        sentences,
      });

      const iconsHandle =
        icons.length > 0 ? playHeroScrollRevealIcons({ icons, trigger }) : { kill: () => {} };

      // Layout is settled; refresh pin distances for both ST instances
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        iconsHandle.kill();
        scaleHandle.kill();
      };
    },
    {
      scope: sectionRef,
      dependencies: [],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      data-hero-motion="sticky-pin"
      className={
        // Mobile: one viewport. Desktop: tall scroll track (~200dvh) for Family B pin travel.
        // Children must NOT flex-grow into this height or sticky never pins.
        "ui-scroll-target relative w-full border-rule border-b " +
        "min-[1440px]:left-1/2 min-[1440px]:w-screen min-[1440px]:max-w-none min-[1440px]:-translate-x-1/2 " +
        "min-h-[calc(100svh-3rem)] min-[1440px]:min-h-[200dvh]"
      }
      aria-label="Seção principal"
    >
      {/*
        Sticky shell ≈ one viewport under the fixed header = full stage.
        overflow-x-hidden: scaled host may extend past the right rail (Mistral).
      */}
      <div
        ref={stickyRef}
        data-hero-motion="sticky-shell"
        className={
          "hero-shell relative flex w-full flex-col border-rule border-t bg-background min-h-[calc(100svh-3rem)] " +
          "min-[1440px]:sticky min-[1440px]:top-12 " +
          "min-[1440px]:h-[calc(100dvh-3rem)] min-[1440px]:min-h-[calc(100dvh-3rem)] min-[1440px]:max-h-[calc(100dvh-3rem)] " +
          "min-[1440px]:overflow-x-hidden"
        }
      >
        {/*
          One parent grid owns both the ~70/30 columns and the 60/40 rows.
          Height is 100% of the sticky shell only (not the tall section).
        */}
        <div
          className={
            "grid h-full min-h-0 w-full flex-1 grid-cols-1 " +
            "min-[1440px]:grid-cols-[minmax(58rem,1.2fr)_minmax(34rem,0.8fr)] " +
            "min-[1440px]:grid-rows-[minmax(0,3fr)_minmax(0,2fr)]"
          }
        >
          {/* L1 — title; Family B2 translateY + opacity exit */}
          <div ref={titleWrapRef} data-hero-motion="title-exit" className={upperBandClass}>
            <HeroDisplayTitle
              title="Um comando. Todas as camadas."
              className={
                "text-foreground text-[clamp(2.5rem,9vw,3.25rem)] leading-[1.02] " +
                "sm:text-[clamp(3rem,8vw,4rem)] sm:leading-[0.98] " +
                "lg:text-[clamp(3.5rem,7vw,5rem)] lg:leading-[0.95] " +
                "min-[1440px]:text-[clamp(3.4rem,5.2vw,5.75rem)] min-[1440px]:leading-[0.93] " +
                "[&_*]:text-foreground"
              }
            >
              Um comando.
              <br />
              Todas as camadas.
            </HeroDisplayTitle>
          </div>

          {/*
            R1 — mission card. Host is in-flow (not absolute stage layer).
            overflow-visible so scale can paint over R2; z-20 host covers chrome.
          */}
          <div
            className={
              upperBandClass +
              " overflow-visible border-rule border-t border-b bg-muted/10 min-[1440px]:border-t-0 min-[1440px]:border-l"
            }
          >
            <div
              ref={scaleTargetRef}
              data-hero-motion="right-top-host"
              data-hero-occupancy-strategy="in-flow-type-pad"
              className={rightTopHostClass}
            >
              <ScrollRevealIcons ref={iconsRef} />
              {/*
                ~56px desktop type (Mistral mission size). Rest optical ≈ font×0.47.
              */}
              <p
                className={
                  "font-medium text-foreground " +
                  "text-2xl leading-[1.25] sm:text-[2rem] sm:leading-[1.18] " +
                  "lg:text-[2.75rem] lg:leading-[1.08] " +
                  "min-[1440px]:text-[4rem] min-[1440px]:leading-[1.08]"
                }
              >
                <span className="sr-only">{mission.join(" ")}</span>
                <span aria-hidden className="flex flex-col items-start">
                  {mission.map((line, i) => (
                    <span
                      key={line}
                      ref={(el) => {
                        sentenceRefs.current[i] = el;
                      }}
                      data-hero-motion="mission-line"
                      className="block will-change-transform min-[1440px]:text-nowrap"
                    >
                      {line}
                    </span>
                  ))}
                </span>
              </p>
            </div>
          </div>

          {/* L2 — empty structural band; fades as stage clears */}
          <div
            ref={stageClearL2Ref}
            data-hero-motion="stage-clear"
            className="hidden bg-background min-[1440px]:block"
            aria-hidden
          />

          {/* R2 — scroll cue + install card; fades as stage clears */}
          <div
            ref={stageClearLowerRef}
            data-hero-motion="stage-clear"
            className="bg-background min-[1440px]:border-l"
          >
            <HeroRailLower scrollTargetId="product" />
          </div>
        </div>
      </div>
    </section>
  );
}
