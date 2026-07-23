"use client";

import { AlertTriangle, RefreshCw, Settings, Shuffle, Star } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StackState } from "@/lib/constant";
import { cn } from "@/lib/utils";

import { PresetDropdown } from "./preset-dropdown";
import { ShareButton } from "./share-button";

type ActionButtonsProps = {
  onReset: () => void;
  onRandom: () => void;
  onSave: () => void;
  onLoad: () => void;
  hasSavedStack: boolean;
  onApplyPreset: (presetId: string) => void;
  stackUrl: string;
  stackState: StackState;
  yolo: boolean;
  onYoloToggle: (yolo: string) => void;
};

const mutedActionClasses =
  "builder-focus-ring flex items-center justify-center gap-1.5 rounded-md bg-muted/20 px-2 py-1.5 font-mono font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/35 hover:text-foreground";

export function ActionButtons({
  onReset,
  onRandom,
  onSave,
  onLoad,
  hasSavedStack,
  onApplyPreset,
  stackUrl,
  stackState,
  yolo,
  onYoloToggle,
}: ActionButtonsProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">Ações</p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onRandom}
          className="builder-focus-ring flex items-center justify-center gap-1.5 rounded-md bg-primary/15 px-2 py-1.5 font-mono font-medium text-primary text-xs transition-colors hover:bg-primary/22"
          title="Gerar uma stack aleatória"
        >
          <Shuffle className="h-3 w-3" />
          Aleatorizar
        </button>
        <button
          type="button"
          onClick={onSave}
          className={mutedActionClasses}
          title="Salvar preferências atuais"
        >
          <Star className="h-3 w-3" />
          Salvar
        </button>
        <button
          type="button"
          onClick={onReset}
          className={cn(mutedActionClasses, !hasSavedStack && "col-span-2")}
          title="Restaurar padrões"
        >
          <RefreshCw className="h-3 w-3" />
          Redefinir
        </button>
        {hasSavedStack && (
          <button
            type="button"
            onClick={onLoad}
            className={mutedActionClasses}
            title="Carregar preferências salvas"
          >
            <Settings className="h-3 w-3" />
            Carregar
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <ShareButton stackUrl={stackUrl} stackState={stackState} />
        <PresetDropdown onApplyPreset={onApplyPreset} />
        <Tooltip delay={100}>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onYoloToggle(yolo ? "false" : "true")}
                aria-pressed={yolo}
                className={cn(
                  "builder-focus-ring flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-mono font-medium text-xs transition-colors",
                  yolo
                    ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                    : "bg-muted/20 text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                )}
              />
            }
          >
            <AlertTriangle className="h-3 w-3" />
            YOLO
          </TooltipTrigger>
          <TooltipContent side="top" align="end" className="max-w-xs">
            <p className="text-xs">
              {yolo ? "Modo YOLO ativo — " : ""}Desativa toda a validação e adiciona --yolo ao
              comando. Use por sua conta e risco!
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
