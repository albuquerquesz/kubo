"use client";

import { cn } from "@/lib/utils";

import HeroRailLower from "./hero-rail-lower";

type HeroInstallStripProps = {
  className?: string;
};

/**
 * Compact install controls relocated out of the hero visual frame.
 * Keeps the copyable command discoverable below the fold.
 */
export default function HeroInstallStrip({ className }: HeroInstallStripProps) {
  return (
    <section
      aria-label="Comando de instalação"
      className={cn("relative z-10 border-rule border-b bg-background", className)}
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-6 lg:px-12">
        <p className="max-w-sm text-sm leading-snug text-muted-foreground sm:text-base">
          Comece no terminal com o gerenciador de pacotes da sua preferência.
        </p>
        <div className="w-full min-w-0 max-w-xl rounded-[8px] border border-rule bg-card/60 p-3 text-left shadow-[0_12px_32px_color-mix(in_srgb,var(--background)_20%,transparent)] backdrop-blur-md sm:p-3.5">
          <HeroRailLower />
        </div>
      </div>
    </section>
  );
}
