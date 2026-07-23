"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import CopyCommandButton from "@/app/(home)/_components/copy-command-button";
import { buttonVariants } from "@/components/ui/button";
import {
  DEFAULT_PACKAGE_MANAGER,
  getCreateCommand,
  type PackageManager,
} from "@/lib/create-commands";
import { cn } from "@/lib/utils";

import EtherealBeamsCanvas from "./ethereal-beams-canvas";
import HeroDisplayTitle from "./hero-display-title";
import HeroRailLower from "./hero-rail-lower";

const mission =
  "Escolha as ferramentas certas para sua ideia e comece a construir sem partir do zero.";

export default function HeroSection() {
  const [selectedManager, setSelectedManager] = useState<PackageManager>(DEFAULT_PACKAGE_MANAGER);
  const command = getCreateCommand(selectedManager);

  const scrollToNextSection = useCallback(() => {
    const target = document.getElementById("product");
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, []);

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
            title="Construa sem começar do zero."
            className={cn(
              "max-w-[900px] text-foreground text-[clamp(2.75rem,7vw,7rem)] leading-[0.9]",
              "sm:text-[clamp(3.5rem,7vw,7rem)] lg:leading-[0.88]",
              "[&_*]:text-foreground",
            )}
          >
            Construa sem
            <br />
            começar do zero.
          </HeroDisplayTitle>

          <p className="mt-7 max-w-[34rem] text-pretty text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg lg:mt-9 lg:text-xl">
            <span className="sr-only">{mission}</span>
            <span aria-hidden="true">
              Escolha as ferramentas certas para sua ideia e{" "}
              <span className="text-foreground/80">comece a construir</span> sem partir do zero.
            </span>
          </p>

          <div className="mt-8 flex w-full max-w-[34rem] flex-col items-stretch gap-6 sm:mt-10 lg:mt-11">
            <div className="flex flex-row items-stretch justify-center gap-3">
              <Link
                href="/new"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "min-h-12 min-w-0 flex-1 justify-center gap-3 rounded-[6px] px-4 text-base shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_28%,transparent),0_14px_36px_color-mix(in_srgb,var(--primary)_16%,transparent)] sm:w-auto sm:flex-none sm:self-center sm:px-8",
                )}
              >
                Monte sua stack
                <ArrowUpRight data-icon="inline-end" className="size-5" aria-hidden />
              </Link>

              <CopyCommandButton
                command={command}
                className="h-12 min-w-12 rounded-[6px] border border-primary bg-primary px-0 text-primary-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_28%,transparent),0_14px_36px_color-mix(in_srgb,var(--primary)_16%,transparent)] transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-12"
              />
            </div>

            <HeroRailLower
              selectedManager={selectedManager}
              onSelectedManagerChange={setSelectedManager}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToNextSection}
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-foreground/75 transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        aria-label="Rolar para a próxima seção"
      >
        <ArrowDown aria-hidden className="size-5 animate-fading-arrow-scroll-1" strokeWidth={1.5} />
      </button>
    </section>
  );
}
