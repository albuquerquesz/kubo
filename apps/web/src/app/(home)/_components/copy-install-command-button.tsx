"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_COMMAND = "bun create kubojs@latest";

type CopyInstallCommandButtonProps = {
  command?: string;
  className?: string;
};

export default function CopyInstallCommandButton({
  command = DEFAULT_COMMAND,
  className,
}: CopyInstallCommandButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

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
    <button
      type="button"
      onClick={copyCommand}
      className={cn(
        "inline-flex h-12 max-w-full cursor-pointer items-center gap-2 rounded-md bg-white/10 px-5 text-left transition-colors",
        "hover:bg-white/15",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      aria-label={copied ? "Comando copiado" : `Copiar comando: ${command}`}
      title={copied ? "Copiado" : "Clique para copiar"}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? "Comando copiado" : "Copiar comando"}
      </span>
      <code className="break-all font-mono text-[0.8125rem] leading-6 text-white/90">
        {command}
      </code>
      {copied ? <Check className="size-3.5 shrink-0 text-white" aria-hidden /> : null}
    </button>
  );
}
