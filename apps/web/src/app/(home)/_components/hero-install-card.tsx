"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DEFAULT_PACKAGE_MANAGER, getCreateCommand } from "@/lib/create-commands";
import { cn } from "@/lib/utils";

export type HeroInstallCardProps = {
  className?: string;
};

/**
 * Hero install control: frosted script shell is fully clickable to copy the default command.
 */
export default function HeroInstallCard({ className }: HeroInstallCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const command = getCreateCommand(DEFAULT_PACKAGE_MANAGER);

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
    <div className={cn("w-fit max-w-full", className)}>
      {/*
        Explicit px radius: dark shell sets --radius: 0, so rounded-xl ≈ 4px (reads square).
      */}
      <button
        type="button"
        onClick={copyCommand}
        className={cn(
          "flex w-fit max-w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[12px] border-0 px-5 py-2.5 text-left sm:px-6 sm:py-3",
          "bg-white/8 shadow-none backdrop-blur-md backdrop-saturate-150",
          "transition-colors hover:bg-white/12",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          copied && "bg-white/16 hover:bg-white/20",
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
