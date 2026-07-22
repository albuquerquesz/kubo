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
  "A full-stack TypeScript app",
  "from one command",
  "with every layer typed.",
] as const;

/**
 * Shared horizontal band padding so title + mission sit on the same bottom edge
 * of the upper grid row (pb matches across columns).
 */
const upperBandClass =
  "flex h-full min-h-[10rem] flex-col justify-end px-4 py-10 sm:min-h-[12rem] sm:px-5 lg:min-h-0 lg:px-10 lg:pt-0 lg:pb-10";

/**
 * Family B host — in-flow inside R1 card (Mistral model).
 * Large desktop type + padding create the unscaled offset box; GSAP scale
 * 0.47→1 makes rest look like a rail chip and end like stage type.
 *
 * Desktop: `lg:w-max` so nowrap mission lines size the host past the 30% rail.
 * End pose centers the host in the sticky shell (stage takeover).
 */
const rightTopHostClass =
  "relative z-20 origin-bottom-left will-change-transform motion-reduce:transform-none " +
  "flex w-full flex-col items-start justify-end " +
  "lg:w-max lg:max-w-none " +
  // Mistral: lg:p-20 (80px)
  "lg:p-16 xl:p-20";

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
        "min-h-[calc(100svh-3rem)] lg:min-h-[200dvh]"
      }
      aria-label="Hero"
    >
      {/*
        Sticky shell ≈ one viewport under the fixed header = full stage.
        overflow-x-hidden: scaled host may extend past the right rail (Mistral).
      */}
      <div
        ref={stickyRef}
        data-hero-motion="sticky-shell"
        className={
          "relative flex w-full flex-col bg-background min-h-[calc(100svh-3rem)] " +
          "lg:sticky lg:top-12 " +
          "lg:h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-3rem)] " +
          "lg:overflow-x-hidden"
        }
      >
        {/*
          One parent grid owns both the ~70/30 columns and the 60/40 rows.
          Height is 100% of the sticky shell only (not the tall section).
        */}
        <div
          className={
            "grid h-full min-h-0 w-full flex-1 grid-cols-1 " +
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,30%)] " +
            "lg:grid-rows-[minmax(0,3fr)_minmax(0,2fr)]"
          }
        >
          {/* L1 — title; Family B2 translateY + opacity exit */}
          <div ref={titleWrapRef} data-hero-motion="title-exit" className={upperBandClass}>
            <HeroDisplayTitle
              title="One command. Every layer."
              className={
                "text-foreground text-[clamp(2rem,8vw,2.75rem)] leading-[1.02] " +
                "lg:text-[clamp(2.5rem,4.5vw,4.5rem)] lg:leading-[0.95] " +
                "[&_*]:text-foreground"
              }
            >
              One command.
              <br />
              Every layer.
            </HeroDisplayTitle>
          </div>

          {/*
            R1 — mission card. Host is in-flow (not absolute stage layer).
            overflow-visible so scale can paint over R2; z-20 host covers chrome.
          */}
          <div
            className={
              upperBandClass +
              " overflow-visible border-rule border-t bg-background lg:border-t-0 lg:border-l"
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
                  "text-2xl leading-[1.25] sm:text-[1.65rem] " +
                  "lg:text-[3.5rem] lg:leading-[1.12]"
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
                      className="block will-change-transform lg:text-nowrap"
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
            className="hidden bg-background lg:block"
            aria-hidden
          />

          {/* R2 — scroll cue + install card; fades as stage clears */}
          <div
            ref={stageClearLowerRef}
            data-hero-motion="stage-clear"
            className="bg-background lg:border-l"
          >
            <HeroRailLower scrollTargetId="product" />
          </div>
        </div>
      </div>
    </section>
  );
}
