"use client";

import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { fireCtaConfetti } from "@/lib/motion/cta-confetti";
import { cn } from "@/lib/utils";

const DEFAULT_COMMAND = "bun create kubojs@latest";

type CopyInstallCommandButtonProps = {
  command?: string;
  className?: string;
  compact?: boolean;
  /**
   * Fire the shared CTA confetti burst after a successful copy.
   * Default false so secondary / quiet placements stay calm.
   */
  confetti?: boolean;
  /** Called only after a successful clipboard write. */
  onCopied?: () => void;
};

export default function CopyInstallCommandButton({
  command = DEFAULT_COMMAND,
  className,
  compact = false,
  confetti = false,
  onCopied,
}: CopyInstallCommandButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      onCopied?.();

      if (confetti) {
        const anchor = buttonRef.current;
        if (anchor) fireCtaConfetti(anchor);
      }

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
    <button
      ref={buttonRef}
      type="button"
      onClick={copyCommand}
      className={cn(
        buttonVariants({ variant: "cta", size: "xl" }),
        compact && "h-12 gap-2 px-4 text-sm sm:px-4",
        "relative no-underline",
        className,
      )}
      aria-label={copied ? "Comando copiado" : `Copiar comando: ${command}`}
      title={copied ? "Copiado" : "Clique para copiar"}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? "Comando copiado" : "Copiar comando"}
      </span>
      <code
        className={cn(
          "max-w-[min(100%,28rem)] truncate font-mono text-sm tracking-[0.04em]",
          !compact && "sm:text-base",
        )}
      >
        {command}
      </code>
    </button>
  );
}
