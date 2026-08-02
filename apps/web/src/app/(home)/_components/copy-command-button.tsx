"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyCommandButtonProps = {
  command: string;
  className?: string;
  onCopyStateChange?: (copied: boolean) => void;
};

export default function CopyCommandButton({
  command,
  className,
  onCopyStateChange,
}: CopyCommandButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCopied(false);
  }, [command]);

  useEffect(() => {
    onCopyStateChange?.(copied);
  }, [copied, onCopyStateChange]);

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
    <button
      type="button"
      onClick={copyCommand}
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "min-w-10 px-0 sm:min-w-11 sm:px-3",
        className,
      )}
      aria-label={copied ? "Comando copiado" : "Copiar comando"}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? "Comando copiado" : "Copiar comando"}
      </span>
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  );
}
