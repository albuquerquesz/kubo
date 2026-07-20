"use client";

import { ArrowUpRight, Check, Copy, FileCode2, GitBranch, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

type PackageManager = "bun" | "pnpm" | "npm";

const commands: Record<PackageManager, string> = {
  bun: "bun create kubots@latest",
  pnpm: "pnpm create kubots@latest",
  npm: "npx create-kubots@latest",
};

const generatedFiles = [
  { depth: 0, name: "apps/", kind: "dir" },
  { depth: 1, name: "web/", kind: "dir" },
  { depth: 1, name: "server/", kind: "dir" },
  { depth: 0, name: "packages/", kind: "dir" },
  { depth: 1, name: "db/", kind: "dir" },
  { depth: 1, name: "auth/", kind: "dir" },
  { depth: 0, name: "turbo.json", kind: "file" },
] as const;

export default function CommandSection() {
  const [selectedManager, setSelectedManager] = useState<PackageManager>("bun");
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(commands[selectedManager]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="product" className="ui-scroll-target border-rule border-b">
      <div className="grid border-rule lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">01 / Compose</p>
        </div>
        <div className="border-rule p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2 className="ui-display max-w-4xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92]">
            Choose the parts.
            <br />
            Keep the whole.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Kubo resolves compatible choices into a codebase you can read, change, and deploy on
            your own terms.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        <div className="flex flex-col border-rule bg-card lg:col-span-5 lg:border-r">
          <div className="flex flex-wrap items-center justify-between gap-4 border-rule border-b p-5 sm:p-6">
            <span className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" aria-hidden />
              <span className="ui-kicker">Start from your terminal</span>
            </span>
            <div className="flex border border-rule" role="group" aria-label="Package manager">
              {(Object.keys(commands) as PackageManager[]).map((manager) => (
                <button
                  key={manager}
                  type="button"
                  className={cn(
                    "ui-kicker min-h-11 min-w-16 border-rule px-3 transition-colors not-last:border-r hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                    selectedManager === manager
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
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
          </div>

          <div className="flex flex-1 flex-col justify-between gap-12 p-5 sm:p-8 lg:p-10">
            <div className="border border-rule bg-background">
              <div className="flex items-center justify-between border-rule border-b px-4 py-3">
                <span className="ui-kicker text-muted-foreground">~/projects</span>
                <span className="flex gap-1" aria-hidden>
                  <span className="size-1.5 bg-muted-foreground/40" />
                  <span className="size-1.5 bg-muted-foreground/40" />
                  <span className="size-1.5 bg-primary" />
                </span>
              </div>
              <div className="flex min-h-32 items-center gap-3 overflow-x-auto px-4 py-6 font-mono text-sm sm:text-base">
                <span className="text-primary">$</span>
                <code className="whitespace-nowrap">{commands[selectedManager]}</code>
              </div>
              <button
                type="button"
                className="ui-kicker flex min-h-12 w-full items-center justify-between border-rule border-t px-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                onClick={copyCommand}
              >
                <span aria-live="polite">{copied ? "Command copied" : "Copy command"}</span>
                {copied ? (
                  <Check className="size-4 text-primary" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
              <div className="bg-card p-4">
                <span className="ui-kicker text-muted-foreground">Prompt</span>
                <strong className="mt-2 block text-2xl">Guided</strong>
              </div>
              <div className="bg-card p-4">
                <span className="ui-kicker text-muted-foreground">Result</span>
                <strong className="mt-2 block text-2xl">Editable</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden lg:col-span-7">
          <div className="ui-rule-grid absolute inset-0 opacity-35" aria-hidden />
          <div className="relative flex min-h-[42rem] flex-col justify-between p-5 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between">
              <span className="ui-kicker text-muted-foreground">Generated architecture</span>
              <span className="ui-kicker text-primary">Type graph intact</span>
            </div>

            <div className="mx-auto grid w-full max-w-2xl grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-y-3">
              <div className="border border-primary bg-primary p-5 text-primary-foreground">
                <span className="ui-kicker">Client</span>
                <strong className="mt-2 block text-xl">App Router</strong>
              </div>
              <div className="h-px bg-primary" aria-hidden />
              <div className="border border-rule bg-background p-5">
                <span className="ui-kicker text-muted-foreground">Contract</span>
                <strong className="mt-2 block text-xl">Typed API</strong>
              </div>

              <div className="col-start-3 h-8 w-px justify-self-center bg-primary" aria-hidden />

              <div className="col-start-3 border border-rule bg-background p-5">
                <span className="ui-kicker text-muted-foreground">Server</span>
                <strong className="mt-2 block text-xl">Runtime</strong>
              </div>

              <div className="col-start-3 h-8 w-px justify-self-center bg-primary" aria-hidden />

              <div className="col-start-3 border border-rule bg-background p-5">
                <span className="ui-kicker text-muted-foreground">Data</span>
                <strong className="mt-2 block text-xl">Schema</strong>
              </div>
            </div>

            <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2">
              <div className="bg-background p-5">
                <GitBranch className="size-4 text-primary" aria-hidden />
                <p className="mt-4 font-semibold">Compatible combinations</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Invalid paths disappear before generation.
                </p>
              </div>
              <Link
                href="/new"
                className="group flex min-h-36 flex-col justify-between bg-primary p-5 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >
                <FileCode2 className="size-4" aria-hidden />
                <span className="flex items-end justify-between gap-4 text-xl font-semibold">
                  Open the visual builder
                  <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-rule border-t px-5 py-4 sm:px-8">
        <p className="ui-kicker text-muted-foreground">
          Output preview /{" "}
          {generatedFiles.map((file) => (
            <span key={file.name} className="mr-4 inline-block text-foreground">
              {file.depth > 0 ? "↳ " : ""}
              {file.name}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
