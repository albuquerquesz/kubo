"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import EtherealBeamsCanvas from "./ethereal-beams-canvas";
import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";

const mission = "Um app TypeScript full-stack a partir de um comando com cada camada tipada.";

export default function HeroSection() {
  return (
    <section
      id="top"
      aria-label="Seção principal"
      className="relative isolate min-h-[calc(100svh-3rem)] overflow-hidden bg-background"
    >
      <EtherealBeamsCanvas />
      <div className="ethereal-beams-veil" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[1200px] flex-col items-center justify-center px-4 pt-8 pb-10 text-center sm:px-8 sm:pt-10 sm:pb-12 lg:px-12 lg:pt-12 lg:pb-14">
        <div className="flex w-full flex-col items-center">
          <HeroDisplayTitle
            title="Um comando. Todas as camadas."
            className={cn(
              "max-w-[1050px] text-foreground text-[clamp(3rem,9.5vw,8.5rem)] leading-[0.86]",
              "sm:text-[clamp(4rem,9vw,8.5rem)] lg:leading-[0.84]",
              "[&_*]:text-foreground",
            )}
          >
            Um comando.
            <br />
            Todas as camadas.
          </HeroDisplayTitle>

          <p className="mt-7 max-w-[34rem] text-pretty text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg lg:mt-9 lg:text-xl">
            <span className="sr-only">{mission}</span>
            <span aria-hidden="true">
              Um app TypeScript full-stack{" "}
              <span className="text-foreground/80">a partir de um comando</span> com cada camada
              tipada.
            </span>
          </p>

          <div className="mt-8 flex w-full max-w-[34rem] flex-col items-stretch gap-6 sm:mt-10 lg:mt-11">
            <Link
              href="/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "min-h-12 w-full justify-center gap-3 rounded-[6px] px-6 text-base shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_28%,transparent),0_14px_36px_color-mix(in_srgb,var(--primary)_16%,transparent)] sm:w-auto sm:self-center sm:px-8",
              )}
            >
              Monte sua stack
              <ArrowUpRight data-icon="inline-end" className="size-5" aria-hidden />
            </Link>

            <div className="w-full rounded-[8px] border border-rule bg-card/60 p-3 text-left shadow-[0_16px_42px_color-mix(in_srgb,var(--background)_24%,transparent)] backdrop-blur-md sm:p-4">
              <HeroRailLower />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
