"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import {
  CREATE_COMMANDS,
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGERS,
  type PackageManager,
} from "@/lib/create-commands";
import { cn } from "@/lib/utils";

export type HeroInstallCardProps = {
  className?: string;
  /** Default package manager. Default "bun". */
  defaultManager?: PackageManager;
};

/**
 * Compact create-command control for the hero right rail:
 * package manager tabs + monospace command + copy.
 */
export default function HeroInstallCard({
  className,
  defaultManager = DEFAULT_PACKAGE_MANAGER,
}: HeroInstallCardProps) {
  const [selectedManager, setSelectedManager] = useState<PackageManager>(defaultManager);
  const [copied, setCopied] = useState(false);

  const command = CREATE_COMMANDS[selectedManager];

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-rule bg-card p-3 sm:p-3.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex min-h-11 overflow-hidden rounded-lg border border-rule"
          role="group"
          aria-label="Package manager"
        >
          {PACKAGE_MANAGERS.map((manager) => (
            <button
              key={manager}
              type="button"
              className={cn(
                "ui-kicker min-h-11 min-w-12 border-rule px-2.5 transition-colors duration-150 ease-out not-last:border-r hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:min-w-14 sm:px-3",
                selectedManager === manager
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground",
              )}
              aria-pressed={selectedManager === manager}
              onClick={() => {
                setSelectedManager(manager);
                setCopied(false);
              }}
            >
              {manager}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={copyCommand}
          className="ui-kicker flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-rule bg-background px-3 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          aria-label={copied ? "Command copied" : "Copy command"}
        >
          <span className="sr-only" aria-live="polite">
            {copied ? "Command copied" : "Copy command"}
          </span>
          <span className="hidden sm:inline" aria-hidden>
            {copied ? "Copied" : "Copy"}
          </span>
          {copied ? (
            <Check className="size-4 text-primary" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </button>
      </div>

      <div className="flex min-h-11 items-center gap-2 overflow-x-auto rounded-lg border border-rule bg-background px-3 py-2.5 font-mono text-xs sm:text-sm">
        <span className="shrink-0 text-primary" aria-hidden>
          $
        </span>
        <code className="whitespace-nowrap text-foreground">{command}</code>
      </div>
    </div>
  );
}
