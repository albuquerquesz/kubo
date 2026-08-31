"use client";

import { ArrowUpRight, ChevronDown, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PRESET_TEMPLATES } from "@/lib/constant";
import { getSelectedTechs } from "@/lib/stack-utils";

import { TechIcon } from "./tech-icon";

type PresetDialogProps = {
  onApplyPreset: (presetId: string) => void;
};

export function PresetDialog({ onApplyPreset }: PresetDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="builder-focus-ring inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-muted/20 px-3 font-mono font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/35 hover:text-foreground"
          />
        }
      >
        <Zap className="h-3 w-3" />
        Modelos
        <ChevronDown className="ml-auto h-3 w-3" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-3xl"
      >
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <DialogTitle className="font-mono font-semibold text-foreground text-sm">
              Modelos de stack
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <div className="divide-y divide-border">
            {PRESET_TEMPLATES.map((preset) => {
              const selectedTechs = getSelectedTechs(preset.stack);

              return (
                <div key={preset.id} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground text-sm">{preset.name}</h3>
                      <p className="mt-1 max-w-2xl text-muted-foreground text-xs leading-5">
                        {preset.description}
                      </p>
                    </div>
                    <DialogClose
                      onClick={() => onApplyPreset(preset.id)}
                      render={
                        <Button type="button" variant="cta" size="default" className="shrink-0" />
                      }
                    >
                      Usar este modelo
                      <ArrowUpRight data-icon="inline-end" />
                    </DialogClose>
                  </div>

                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-label={`Tecnologias de ${preset.name}`}
                  >
                    {selectedTechs.map((tech) => (
                      <li
                        key={`${preset.id}-${tech.category}-${tech.id}`}
                        className="inline-flex items-center gap-1.5 border border-border bg-muted/10 px-2 py-1 font-mono text-[10px] text-muted-foreground"
                      >
                        {tech.icon && (
                          <TechIcon icon={tech.icon} name={tech.name} className="h-3 w-3" />
                        )}
                        <span>{tech.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
