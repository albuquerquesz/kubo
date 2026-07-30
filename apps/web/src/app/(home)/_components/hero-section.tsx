"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import HeroDisplayTitle from "./hero-display-title";
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
          /* 16 / 32–40 / 64px gutters — shared left edge for title, copy, CTA */
          "px-4 pb-16 pt-[calc(var(--site-header-height)+1.25rem)]",
          "sm:px-8 sm:pb-[4.25rem] sm:pt-[calc(var(--site-header-height)+1.5rem)]",
          "md:px-10 lg:px-16 lg:pb-[4.5rem]",
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

          <div className="mt-10 sm:mt-12">
            <Link
              href="/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "xl" }),
                "h-14 min-w-[11rem] gap-2 px-6 text-sm sm:min-w-[12.5rem] sm:text-base",
              )}
            >
              Montar stack
              <ArrowUpRight
                aria-hidden
                data-icon="inline-end"
                className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
