"use client";

import { ArrowUpRight, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
          <Button type="button" variant="secondary" size="default" className="w-full font-mono" />
        }
      >
        <Zap data-icon="inline-start" className="h-3 w-3" />
        Modelos
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-3xl"
      >
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <DialogTitle className="font-mono font-semibold text-foreground text-base">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground text-base">{preset.name}</h3>
                    </div>
                    <DialogClose
                      onClick={() => onApplyPreset(preset.id)}
                      render={<Button type="button" variant="cta" size="lg" className="shrink-0" />}
                    >
                      Usar modelo
                      <ArrowUpRight
                        aria-hidden
                        data-icon="inline-end"
                        className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
                      />
                    </DialogClose>
                  </div>

                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-label={`Tecnologias de ${preset.name}`}
                  >
                    {selectedTechs.map((tech) => (
                      <li
                        key={`${preset.id}-${tech.category}-${tech.id}`}
                        className="inline-flex items-center gap-1.5 bg-muted/10 px-2 py-1 font-mono text-[10px] text-muted-foreground"
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
