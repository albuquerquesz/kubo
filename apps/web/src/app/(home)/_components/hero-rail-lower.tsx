"use client";

import { cn } from "@/lib/utils";

import HeroInstallCard from "./hero-install-card";

export type HeroRailLowerProps = {
  className?: string;
};

/** Compact hero utility rail containing the installer controls. */
export default function HeroRailLower({ className }: HeroRailLowerProps) {
  return (
    <div className={cn("w-fit max-w-full", className)}>
      <HeroInstallCard />
    </div>
  );
}
