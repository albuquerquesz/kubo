"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { SiBun, SiNpm, SiPnpm } from "react-icons/si";

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
  selectedManager?: PackageManager;
  onSelectedManagerChange?: (manager: PackageManager) => void;
};

/**
 * Hero install control:
 * - eyebrow + package manager select sit **outside** the script shell
 * - PM trigger shows icon (react-icons/si), not the label text
 * - bordered script shell is fully clickable to copy the command
 */
export default function HeroInstallCard({
  className,
  defaultManager = DEFAULT_PACKAGE_MANAGER,
  selectedManager: controlledManager,
  onSelectedManagerChange,
}: HeroInstallCardProps) {
  const [internalManager, setInternalManager] = useState<PackageManager>(defaultManager);
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const selectedManager = controlledManager ?? internalManager;
  const command = getCreateCommand(selectedManager);
  const SelectedIcon = PM_ICONS[selectedManager];

  useEffect(() => {
    setCopied(false);
  }, [command]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("flex w-fit max-w-full flex-col gap-1.5", className)}>
      {/* Meta row — outside the script shell */}
      <div className="flex items-center justify-between gap-3">
        <p className="ui-kicker tracking-[0.18em] text-muted-foreground">Iniciar com</p>
        <Select
          value={selectedManager}
          onValueChange={(value) => {
            if (value == null) return;
            const manager = value as PackageManager;
            setInternalManager(manager);
            onSelectedManagerChange?.(manager);
          }}
        >
          <SelectTrigger
            id="hero-install-pm"
            size="sm"
            aria-label={`Gerenciador de pacotes: ${selectedManager}`}
            className={cn(
              "h-10 min-h-10 w-auto min-w-0 gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1.5",
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
                  <span className="font-mono tracking-[0.12em]">{manager}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Script shell — whole card copies on click */}
      {/*
        Explicit px radius: dark shell sets --radius: 0, so rounded-xl ≈ 4px (reads square).
      */}
      <button
        type="button"
        onClick={copyCommand}
        className={cn(
          "flex w-fit max-w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[12px] border border-rule px-5 py-2.5 text-left sm:px-6 sm:py-3",
          "transition-colors hover:border-foreground/25 hover:bg-foreground/[0.03]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          copied && "border-primary/40",
        )}
        aria-label={copied ? "Comando copiado" : `Copiar comando: ${command}`}
        title={copied ? "Copiado" : "Clique para copiar"}
      >
        <span className="sr-only" aria-live="polite">
          {copied ? "Comando copiado" : "Copiar comando"}
        </span>
        <p className="whitespace-nowrap font-mono text-xs tracking-[0.08em] text-foreground sm:text-sm">
          <code className="font-mono tracking-[0.08em]">{command}</code>
        </p>
        {copied ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
      </button>
    </div>
  );
}
