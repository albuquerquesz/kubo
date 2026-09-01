"use client";

import { AlertTriangle, RefreshCw, Settings, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StackState } from "@/lib/constant";
import { cn } from "@/lib/utils";

import { ShareButton } from "./share-button";

/** Temporarily hidden from the stack builder actions row. */
const SHOW_YOLO_BUTTON = false;

type ActionButtonsProps = {
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  hasSavedStack: boolean;
  stackUrl: string;
  stackState: StackState;
  yolo: boolean;
  onYoloToggle: (yolo: string) => void;
};

export function ActionButtons({
  onReset,
  onSave,
  onLoad,
  hasSavedStack,
  stackUrl,
  stackState,
  yolo,
  onYoloToggle,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        type="button"
        onClick={onSave}
        variant="secondary"
        size="default"
        className="w-full font-mono"
        title="Salvar preferências atuais"
      >
        <Star className="h-3 w-3" />
        Salvar
      </Button>
      <Button
        type="button"
        onClick={onReset}
        variant="secondary"
        size="default"
        className="w-full font-mono"
        title="Restaurar padrões"
      >
        <RefreshCw className="h-3 w-3" />
        Redefinir
      </Button>
      {hasSavedStack && (
        <Button
          type="button"
          onClick={onLoad}
          variant="secondary"
          size="default"
          className="w-full font-mono"
          title="Carregar preferências salvas"
        >
          <Settings className="h-3 w-3" />
          Carregar
        </Button>
      )}
      <ShareButton stackUrl={stackUrl} stackState={stackState} />
      {SHOW_YOLO_BUTTON ? (
        <Tooltip delay={100}>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => onYoloToggle(yolo ? "false" : "true")}
                aria-pressed={yolo}
                className={cn(
                  "w-full font-mono",
                  yolo &&
                    "bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive",
                )}
              />
            }
          >
            <AlertTriangle data-icon="inline-start" className="h-3 w-3" />
            YOLO
          </TooltipTrigger>
          <TooltipContent side="top" align="end" className="max-w-xs">
            <p className="text-xs">
              {yolo ? "Modo YOLO ativo — " : ""}Desativa toda a validação e adiciona --yolo ao
              comando. Use por sua conta e risco!
            </p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
