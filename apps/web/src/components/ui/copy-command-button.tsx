"use client";

import { Check, Copy, SquareTerminal } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CopyCommandButtonProps {
  value: string;
  copied: boolean;
  onCopy: () => void;
  /** Accessible name stem, e.g. "Comando" → "Copiar comando". */
  label?: string;
  icon?: ReactNode;
}

export function CopyCommandButton({
  value,
  copied,
  onCopy,
  label = "Comando",
  icon,
}: CopyCommandButtonProps) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? `${label} copiado` : `Copiar ${label.toLowerCase()}`}
      title={copied ? `${label} copiado` : `Copiar ${label.toLowerCase()}`}
      className="builder-focus-ring group flex h-10 w-full min-w-0 items-center gap-2 rounded-full border border-border bg-muted/10 px-3 text-left transition-all duration-300 hover:scale-105 hover:border-muted-foreground/30 hover:bg-muted/25 hover:ring-4 hover:ring-foreground/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0"
    >
      <span className="shrink-0 text-primary">
        {icon ?? <SquareTerminal className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs group-hover:text-foreground">
        {value}
      </span>
      <span
        className={cn(
          "shrink-0 transition-colors",
          copied
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
