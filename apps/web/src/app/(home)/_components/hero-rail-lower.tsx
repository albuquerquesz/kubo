"use client";

import { cn } from "@/lib/utils";

import HeroInstallCard, { type HeroInstallCardProps } from "./hero-install-card";

export type HeroRailLowerProps = {
  className?: string;
  selectedManager?: HeroInstallCardProps["selectedManager"];
  onSelectedManagerChange?: HeroInstallCardProps["onSelectedManagerChange"];
};

/** Compact hero utility rail containing the installer controls. */
export default function HeroRailLower({
  className,
  selectedManager,
  onSelectedManagerChange,
}: HeroRailLowerProps) {
  return (
    <div className={cn("w-full", className)}>
      <HeroInstallCard
        selectedManager={selectedManager}
        onSelectedManagerChange={onSelectedManagerChange}
        showCopyButton={false}
      />
    </div>
  );
}
