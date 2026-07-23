"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { SiBun, SiNpm, SiPnpm } from "react-icons/si";

import CopyCommandButton from "@/app/(home)/_components/copy-command-button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  DEFAULT_PACKAGE_MANAGER,
  getCreateCommand,
  PACKAGE_MANAGERS,
  type PackageManager,
} from "@/lib/create-commands";
import { cn } from "@/lib/utils";

const PM_ICONS: Record<PackageManager, IconType> = {
  bun: SiBun,
  pnpm: SiPnpm,
  npm: SiNpm,
};

export type HeroInstallCardProps = {
  className?: string;
  /** Default package manager. Default "bun". */
  defaultManager?: PackageManager;
};

/**
 * Hero install control:
 * - eyebrow + package manager select sit **outside** the script shell
 * - PM trigger shows icon (react-icons/si), not the label text
 * - bordered script shell = command line + copy only
 */
export default function HeroInstallCard({
  className,
  defaultManager = DEFAULT_PACKAGE_MANAGER,
}: HeroInstallCardProps) {
  const [selectedManager, setSelectedManager] = useState<PackageManager>(defaultManager);
  const command = getCreateCommand(selectedManager);
  const SelectedIcon = PM_ICONS[selectedManager];

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {/* Meta row — outside the script shell */}
      <div className="flex items-center justify-between gap-3">
        <p className="ui-kicker text-muted-foreground">Iniciar com</p>
        <Select
          value={selectedManager}
          onValueChange={(value) => {
            if (value == null) return;
            setSelectedManager(value as PackageManager);
          }}
        >
          <SelectTrigger
            id="hero-install-pm"
            size="sm"
            aria-label={`Gerenciador de pacotes: ${selectedManager}`}
            className={cn(
              "h-11 min-h-11 w-auto min-w-0 gap-1.5 border-0 bg-transparent px-1.5 py-1.5",
              "text-foreground shadow-none ring-0",
              "hover:bg-transparent hover:text-primary dark:bg-transparent dark:hover:bg-transparent",
              "focus-visible:border-0 focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            <SelectedIcon className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">{selectedManager}</span>
          </SelectTrigger>
          <SelectContent align="end" className="min-w-36">
            {PACKAGE_MANAGERS.map((manager) => {
              const Icon = PM_ICONS[manager];
              return (
                <SelectItem key={manager} value={manager}>
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="font-mono tracking-[0.06em]">{manager}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Script shell — transparent border; gold only on copy control */}
      {/*
        Explicit px radius: dark shell sets --radius: 0, so rounded-xl ≈ 4px (reads square).
      */}
      <div className="flex items-center gap-2 overflow-hidden rounded-[12px] border border-rule p-2.5 sm:gap-3 sm:p-3">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground sm:text-sm">
          <code className="font-mono">{command}</code>
        </p>

        <CopyCommandButton
          command={command}
          className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-primary bg-primary px-0 text-primary-foreground transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-3"
        />
      </div>
    </div>
  );
}
