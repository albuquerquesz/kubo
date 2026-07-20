"use client";

import { useRef } from "react";

import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";
import ScrollRevealIcons from "./scroll-reveal-icons";
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

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="ui-scroll-target flex min-h-[calc(100svh-3rem)] w-full flex-col border-rule border-b"
      aria-label="Hero"
    >
      {/*
        One parent grid owns both the ~70/30 columns and the 60/40 rows.
        Shared row tracks force the mid-rule (border-t on lower cells) to align.
        DOM order = mobile reading order: title → mission → install (empty L2 hidden <lg).
        Header offset uses 3rem to match site-header h-12.
      */}
      <div
        className={
          "grid min-h-[calc(100svh-3rem)] w-full flex-1 grid-cols-1 " +
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

        {/* R1 — mission, same upper row + same bottom padding as title */}
        <div
          className={
            upperBandClass + " border-rule border-t bg-background lg:border-t-0 lg:border-l"
          }
        >
          <ScrollRevealIcons triggerRef={sectionRef} />
          <p className="text-2xl leading-[1.3] font-medium text-foreground sm:text-[1.65rem] lg:text-[1.75rem]">
            <span className="sr-only">{mission.join(" ")}</span>
            <span aria-hidden className="flex flex-col items-start">
              {mission.map((line) => (
                <span key={line} className="block lg:text-nowrap">
                  {line}
                </span>
              ))}
            </span>
          </p>
        </div>

        {/* L2 — empty structural band (desktop only; keeps shared row track) */}
        <div className="hidden border-rule border-t bg-background lg:block" aria-hidden />

        {/* R2 — scroll cue + install card (shares lower row track with L2) */}
        <div className="border-rule border-t bg-background lg:border-l">
          <HeroRailLower scrollTargetId="product" />
        </div>
      </div>

      <SignalField />
    </section>
  );
}
