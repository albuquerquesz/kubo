"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  DEFAULT_PACKAGE_MANAGER,
  getCreateCommand,
  type PackageManager,
} from "@/lib/create-commands";
import { cn } from "@/lib/utils";

export type HeroInstallCardProps = {
  className?: string;
  /** Override create command for tests. Defaults to bun create string. */
  command?: string;
  /** Default package manager when `command` is omitted. Default "bun". */
  defaultManager?: PackageManager;
};

/**
 * Horizontal install shell for the hero right rail:
 * mark thumb + default create command + copy control.
 * Full package-manager switching lives in CommandSection below the fold.
 */
export default function HeroInstallCard({
  className,
  command: commandProp,
  defaultManager = DEFAULT_PACKAGE_MANAGER,
}: HeroInstallCardProps) {
  const [copied, setCopied] = useState(false);
  const command = commandProp ?? getCreateCommand(defaultManager);

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
        "flex w-full items-center gap-2.5 rounded-xl border border-rule bg-card p-2 sm:gap-3 sm:p-2.5",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted sm:size-14"
      >
        <Image
          src="/assets/kubo-mark.png"
          alt=""
          width={56}
          height={56}
          className="size-9 object-contain sm:size-10"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs text-foreground sm:text-sm">
          <span className="text-primary" aria-hidden>
            ${" "}
          </span>
          <code className="font-mono">{command}</code>
        </p>
      </div>

      <button
        type="button"
        onClick={copyCommand}
        className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-rule bg-background px-0 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-3"
        aria-label={copied ? "Command copied" : "Copy command"}
      >
        <span className="sr-only" aria-live="polite">
          {copied ? "Command copied" : "Copy command"}
        </span>
        <span
          className="hidden font-mono text-xs uppercase tracking-[0.08em] sm:inline"
          aria-hidden
        >
          {copied ? "Copied" : "Copy"}
        </span>
        {copied ? (
          <Check className="size-4 text-primary" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
