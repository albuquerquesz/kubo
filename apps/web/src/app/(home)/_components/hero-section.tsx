"use client";

import { useRef } from "react";

import { ScrollTrigger } from "@/lib/motion/gsap-client";
import { playHeroStickyScale } from "@/lib/motion/timelines/hero-sticky-scale";
import { playHeroScrollRevealIcons } from "@/lib/motion/timelines/scroll-reveal-icons";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";
import ScrollRevealIcons, { type ScrollRevealIconsHandle } from "./scroll-reveal-icons";
import SignalField from "./signal-field";

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
 * Family B host (strategy B — sticky-stage occupancy).
 * Mobile: in-flow shrink-wrap in the mission cell.
 * Desktop: absolute layer sized ~64%×44% of sticky shell so scale 1 takes the stage
 * (Mistral offset ~924×396 on 1440×900). Bottom-left of the host sits near the
 * right-rail / upper-band corner so rest (scale ~0.47) still reads as a right chip.
 */
const rightTopHostClass =
  "origin-bottom-left will-change-transform motion-reduce:transform-none " +
  // Mobile / <lg: normal flow in R1
  "w-full " +
  // Desktop: sticky-stage layer (positioned against sticky-shell)
  "lg:absolute lg:z-[1] lg:flex lg:w-[64%] lg:h-[44%] lg:min-h-[16rem] " +
  "lg:flex-col lg:items-start lg:justify-end " +
  // left 70% + width 64% overflows right (clipped by sticky overflow-x-hidden);
  // bottom 40% = upper/lower 60/40 split so origin sits on the band seam.
  "lg:left-[70%] lg:bottom-[40%] " +
  "lg:box-border lg:px-10 lg:pb-10 lg:pt-6";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const scaleTargetRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconsRef = useRef<ScrollRevealIconsHandle>(null);

  useGsapContext(
    () => {
      const trigger = sectionRef.current;
      const target = scaleTargetRef.current;
      const sticky = stickyRef.current;
      if (!trigger || !target) return;

      const sentences = sentenceRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      const icons = iconsRef.current?.getIcons() ?? [];

      const scaleHandle = playHeroStickyScale({
        trigger,
        target,
        sticky,
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
        Sticky shell ≈ one viewport under the fixed header.
        Critical: fixed height / no flex-1 — shell must be shorter than the 200dvh
        section so CSS sticky can pin (Mistral: .js-sticky lg:min-h-dvh in 200dvh host).
        overflow-x-hidden: host may extend past the right edge at rest (stage layer).
      */}
      <div
        ref={stickyRef}
        data-hero-motion="sticky-shell"
        className={
          "relative flex w-full flex-col min-h-[calc(100svh-3rem)] " +
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
          {/* L1 — title, bottom of upper band */}
          <div className={upperBandClass}>
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
            R1 — mission cell.
            Mobile: Family B host in-flow.
            Desktop: host is absolute sticky-stage (see host classes); cell keeps rail border.
          */}
          <div
            className={
              upperBandClass + " border-rule border-t bg-background lg:border-t-0 lg:border-l"
            }
          >
            <div
              ref={scaleTargetRef}
              data-hero-motion="right-top-host"
              data-hero-occupancy-strategy="sticky-stage"
              className={rightTopHostClass}
            >
              <ScrollRevealIcons ref={iconsRef} />
              <p className="text-2xl leading-[1.3] font-medium text-foreground sm:text-[1.65rem] lg:text-[1.75rem]">
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

          {/* L2 — empty structural band (desktop only; keeps shared row track) */}
          <div className="hidden border-rule border-t bg-background lg:block" aria-hidden />

          {/* R2 — scroll cue + install card (shares lower row track with L2) */}
          <div className="border-rule border-t bg-background lg:border-l">
            <HeroRailLower scrollTargetId="product" />
          </div>
        </div>

        <SignalField />
      </div>
    </section>
  );
}
