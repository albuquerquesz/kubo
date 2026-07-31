"use client";

import { cn } from "@/lib/utils";

import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";
import MosaicHeroCanvas from "./mosaic-hero-canvas";

const mission =
  "Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.";

export default function HeroSection() {
  return (
    <section
      id="top"
      aria-label="Seção principal"
      /* -mt-12 cancels layout.tsx pt-12 so artwork is full-bleed behind the fixed header */
      className="relative isolate -mt-12 min-h-svh overflow-hidden bg-background"
    >
      <MosaicHeroCanvas />
      <div className="mosaic-hero-veil" aria-hidden="true" />

      <div
        className={cn(
          "relative z-10 flex min-h-svh w-full flex-col",
          "items-start justify-end text-left",
          /* Tighter left gutter so title sits closer to the frame edge */
          "px-4 pb-16 pt-[calc(var(--site-header-height)+1.25rem)]",
          "sm:px-5 sm:pb-[4.25rem] sm:pt-[calc(var(--site-header-height)+1.5rem)]",
          "md:px-6 lg:px-8 lg:pb-[4.5rem]",
        )}
      >
        <div className="flex w-full max-w-[40rem] flex-col items-start">
          <HeroDisplayTitle
            title="Construa sem começar do zero."
            className={cn(
              "max-w-[18ch] text-foreground",
              /* Override .ui-display 600 / −0.065em for a lighter display match */
              "!font-normal tracking-[-0.03em]",
              "text-[clamp(2.5rem,5.5vw,5.25rem)] leading-[1.02]",
              "sm:text-[clamp(2.75rem,5.2vw,5.25rem)]",
              "lg:text-[clamp(4rem,5.8vw,5.25rem)] lg:leading-[1]",
              "[&_*]:text-foreground",
            )}
          >
            Construa sem
            <br />
            começar do zero.
          </HeroDisplayTitle>

          <p
            className={cn(
              "mt-5 max-w-[36rem] text-pretty text-[1.125rem] leading-7 text-muted-foreground",
              "sm:mt-6 sm:text-[1.25rem] sm:leading-7",
              "lg:mt-6",
            )}
          >
            <span className="sr-only">{mission}</span>
            <span aria-hidden="true">
              Escolha as ferramentas certas para sua ideia e{" "}
              <span className="text-foreground/80">comece a construir</span> sem partir do zero.
            </span>
          </p>

          <div className="mt-8 w-fit max-w-full sm:mt-10">
            <HeroRailLower />
          </div>
        </div>
      </div>
    </section>
  );
}
