"use client";

import type { LayoutConfig } from "@kubojs/types";
import { ArrowRight, Folder } from "lucide-react";
import { useMemo } from "react";

import { buttonVariants } from "@/components/ui/button";
import { summarizeLayout } from "@/lib/layout-draft";
import { cn } from "@/lib/utils";

import { BuilderStepLink } from "./builder-step-link";

const PRESET_LABELS = { standard: "Standard", libs: "Libs" } as const;

function folderLabel(dir: string) {
  return dir === "." ? "./ (raiz)" : `${dir}/`;
}

/** Sidebar entry point for the layout step: current folder structure plus a link to edit it. */
export function ProjectStructureCard({ layout }: { layout: LayoutConfig | undefined }) {
  const summary = useMemo(() => summarizeLayout(layout), [layout]);

  return (
    <div className="space-y-3 rounded-xl border border-rule bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
          Estrutura do projeto
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase",
            summary.isCustom ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground",
          )}
        >
          {summary.isCustom ? "Personalizado" : PRESET_LABELS[summary.preset]}
        </span>
      </div>

      <ul className="space-y-1 font-mono text-xs">
        {(
          [
            ["apps", summary.dirs.apps],
            ["pacotes", summary.dirs.packages],
          ] as const
        ).map(([label, dir]) => (
          <li key={label} className="flex items-center gap-2">
            <Folder className="size-3.5 shrink-0 text-primary" />
            <span className="min-w-0 truncate text-foreground">{folderLabel(dir)}</span>
            <span className="ml-auto text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
      {summary.overrides > 0 ? (
        <p className="text-muted-foreground text-xs">
          {summary.overrides === 1
            ? "1 caminho personalizado"
            : `${summary.overrides} caminhos personalizados`}
        </p>
      ) : null}

      <BuilderStepLink
        step="layout"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Personalizar layout
        <ArrowRight data-icon="inline-end" />
      </BuilderStepLink>
    </div>
  );
}
