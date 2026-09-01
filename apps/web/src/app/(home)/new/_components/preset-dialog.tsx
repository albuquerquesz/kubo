"use client";

import { ArrowUpRight, XIcon, Zap } from "lucide-react";
import { useState } from "react";

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
import { cn } from "@/lib/utils";

import { TechIcon } from "./tech-icon";

type PresetDialogProps = {
  onApplyPreset: (presetId: string) => void;
};

export function PresetDialog({ onApplyPreset }: PresetDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedPresetId(null);
    }
  };

  const handleApply = () => {
    if (!selectedPresetId) return;
    onApplyPreset(selectedPresetId);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="secondary" size="default" className="w-full font-mono" />
        }
      >
        <Zap data-icon="inline-start" className="h-3 w-3" />
        Templates
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-2xl"
      >
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Zap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <DialogTitle className="font-mono font-semibold text-foreground text-sm">
                Templates de stack
              </DialogTitle>
            </div>
            <DialogClose
              render={<Button type="button" variant="ghost" size="icon-sm" className="shrink-0" />}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label="Templates de stack"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="divide-y divide-border">
            {PRESET_TEMPLATES.map((preset) => {
              const selectedTechs = getSelectedTechs(preset.stack);
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  role="radio"
                  tabIndex={0}
                  aria-checked={isSelected}
                  aria-label={preset.name}
                  onClick={() => setSelectedPresetId(preset.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPresetId(preset.id);
                    }
                  }}
                  className={cn(
                    "flex w-full cursor-pointer flex-col gap-4 px-5 py-5 text-left transition-colors sm:px-6",
                    "hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
                    isSelected && "bg-primary/10 ring-1 ring-primary/30 ring-inset",
                  )}
                >
                  <h3 className="font-medium text-foreground text-base">{preset.name}</h3>
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

        <div className="flex items-center justify-end gap-4 border-border border-t px-5 py-4 sm:px-6">
          <DialogClose
            render={
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="px-6 font-mono has-data-[icon=inline-end]:px-6 has-data-[icon=inline-start]:px-6"
              />
            }
          >
            Voltar
          </DialogClose>
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="shrink-0 px-6 font-mono has-data-[icon=inline-end]:px-6 has-data-[icon=inline-start]:px-6"
            disabled={!selectedPresetId}
            onClick={handleApply}
          >
            Usar template
            <ArrowUpRight
              aria-hidden
              data-icon="inline-end"
              className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
