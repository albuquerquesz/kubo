"use client";

import type { LayoutConfig } from "@kubojs/types";
import { ArrowUpRight, Folder, FolderTree, XIcon } from "lucide-react";
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
import { findLayoutOption, LAYOUT_OPTIONS } from "@/lib/layout-options";
import { cn } from "@/lib/utils";

type LayoutDialogProps = {
  /** Layout currently applied to the stack (undefined = default). */
  layout: LayoutConfig | undefined;
  onApplyLayout: (layout: LayoutConfig | undefined) => void;
};

/** Picks one of the curated project layouts; same shape as the Templates dialog. */
export function LayoutDialog({ layout, onApplyLayout }: LayoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentId = findLayoutOption(layout)?.id ?? null;
  const selected = LAYOUT_OPTIONS.find((option) => option.id === selectedId);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setSelectedId(nextOpen ? currentId : null);
  };

  const handleApply = () => {
    if (!selected) return;
    onApplyLayout(selected.layout);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="default"
            className="w-full bg-muted font-mono hover:bg-input hover:ring-muted/40"
          />
        }
      >
        <FolderTree data-icon="inline-start" className="h-3 w-3" />
        Layout
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 sm:max-w-2xl"
      >
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <FolderTree className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <DialogTitle className="font-mono font-semibold text-foreground text-sm">
                Layout do projeto
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
          aria-label="Layout do projeto"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="divide-y divide-border">
            {LAYOUT_OPTIONS.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <div
                  key={option.id}
                  role="radio"
                  tabIndex={0}
                  aria-checked={isSelected}
                  aria-label={option.name}
                  onClick={() => setSelectedId(option.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(option.id);
                    }
                  }}
                  className={cn(
                    "flex w-full cursor-pointer flex-col gap-3 px-5 py-5 text-left transition-colors sm:px-6",
                    "hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
                    isSelected && "bg-primary/10 ring-1 ring-primary/30 ring-inset",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-base">{option.name}</h3>
                    {option.id === currentId ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary uppercase">
                        Atual
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm">{option.description}</p>
                  <ul
                    className="flex flex-col gap-1 font-mono text-xs"
                    aria-label={`Pastas de ${option.name}`}
                  >
                    {option.folders.map((folder) => (
                      <li key={folder.path} className="flex items-center gap-2">
                        <Folder className="size-3.5 shrink-0 text-primary" aria-hidden />
                        <span className="text-foreground">{folder.path}</span>
                        <span className="truncate text-muted-foreground">{folder.items}</span>
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
            disabled={!selected || selected.id === currentId}
            onClick={handleApply}
          >
            Usar layout
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
