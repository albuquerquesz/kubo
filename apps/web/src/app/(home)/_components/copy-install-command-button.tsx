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
        "inline-flex max-w-full cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors",
        "hover:border-[#f5f5f5]/20 hover:bg-[#f5f5f5]/5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      aria-label={copied ? "Comando copiado" : `Copiar comando: ${command}`}
      title={copied ? "Copiado" : "Clique para copiar"}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? "Comando copiado" : "Copiar comando"}
      </span>
      <code className="break-all font-mono text-[0.8125rem] leading-6 text-[#f5f5f5]/55">
        {command}
      </code>
      {copied ? <Check className="size-3.5 shrink-0 text-[#f5f5f5]/70" aria-hidden /> : null}
    </button>
  );
}
