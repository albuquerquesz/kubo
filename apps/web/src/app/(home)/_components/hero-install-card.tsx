"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import {
  DEFAULT_PACKAGE_MANAGER,
  getCreateCommand,
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
 * Hero install control:
 * - eyebrow + package manager select sit **outside** the script shell
 * - bordered script shell = command line + copy only
 */
export default function HeroInstallCard({
  className,
  defaultManager = DEFAULT_PACKAGE_MANAGER,
}: HeroInstallCardProps) {
  const [selectedManager, setSelectedManager] = useState<PackageManager>(defaultManager);
  const [copied, setCopied] = useState(false);
  const command = getCreateCommand(selectedManager);

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
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {/* Meta row — outside the script shell */}
      <div className="flex items-center justify-between gap-3">
        <p className="ui-kicker text-muted-foreground">Initialize with</p>
        <label className="sr-only" htmlFor="hero-install-pm">
          Package manager
        </label>
        <select
          id="hero-install-pm"
          value={selectedManager}
          aria-label="Package manager"
          onChange={(event) => {
            setSelectedManager(event.target.value as PackageManager);
            setCopied(false);
          }}
          className={cn(
            "ui-kicker min-h-9 cursor-pointer appearance-none border-0 bg-transparent py-1.5 pr-7 pl-1 text-foreground",
            "bg-[length:0.75rem] bg-[right_0.15rem_center] bg-no-repeat",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
            "transition-colors duration-150 ease-out hover:text-primary",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          {PACKAGE_MANAGERS.map((manager) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>
      </div>

      {/* Script shell — command + copy only */}
      {/*
        Explicit px radius: dark shell sets --radius: 0, so rounded-xl ≈ 4px (reads square).
      */}
      <div className="flex items-center gap-2 overflow-hidden rounded-[12px] border border-rule bg-card p-2.5 sm:gap-3 sm:p-3">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground sm:text-sm">
          <span className="text-primary" aria-hidden>
            ${" "}
          </span>
          <code className="font-mono">{command}</code>
        </p>

        <button
          type="button"
          onClick={copyCommand}
          className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-rule bg-background px-0 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-3"
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
    </div>
  );
}
