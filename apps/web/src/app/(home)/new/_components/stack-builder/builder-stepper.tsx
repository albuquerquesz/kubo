"use client";

import type { BuilderStep } from "@/lib/builder-steps";
import { cn } from "@/lib/utils";

import { BuilderStepLink } from "./builder-step-link";

const STEPS: { id: BuilderStep; label: string; hint: string }[] = [
  { id: "stack", label: "Stack", hint: "Tecnologias" },
  { id: "layout", label: "Layout", hint: "Estrutura de pastas" },
];

export function BuilderStepper({ current }: { current: BuilderStep }) {
  return (
    <nav aria-label="Etapas do builder" className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isCurrent = step.id === current;
        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden className="h-px w-6 bg-rule sm:w-10" /> : null}
            <BuilderStepLink
              step={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "builder-focus-ring group flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors",
                isCurrent ? "bg-primary/12" : "hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full font-mono text-xs",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "border border-rule text-muted-foreground group-hover:text-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="flex flex-col leading-tight">
                <span
                  className={cn(
                    "font-semibold text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden text-[11px] text-muted-foreground md:block">
                  {step.hint}
                </span>
              </span>
            </BuilderStepLink>
          </div>
        );
      })}
    </nav>
  );
}
