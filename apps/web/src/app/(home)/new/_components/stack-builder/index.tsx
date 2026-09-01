"use client";

import { AlertTriangle, FolderTree, Terminal } from "lucide-react";
import { startTransition, useCallback, useRef, useState } from "react";

import CopyInstallCommandButton from "@/app/(home)/_components/copy-install-command-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareDialog } from "@/components/ui/share-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getDesktopBuildNote } from "@/lib/stack-utils";
import type { Sponsor } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ActionButtons } from "../action-buttons";
import { PresetDialog } from "../preset-dialog";
import { PreviewPanel } from "../preview-panel";
import { SpecialSponsorsPanel } from "../special-sponsors-panel";
import { CategoryNav, scrollToCategorySection } from "./category-nav";
import { SelectedStackBadges } from "./selected-stack-badges";
import { TechCategories } from "./tech-categories";
import { useStackBuilder } from "./use-stack-builder";

type StackBuilderProps = {
  specialSponsors?: Sponsor[];
};

export function StackBuilder({ specialSponsors = [] }: StackBuilderProps) {
  const {
    applyPreset,
    categoryProgress,
    command,
    compatibilityAnalysis,
    getStackUrl,
    handleTechSelect,
    lastSavedStack,
    loadSavedStack,
    mobileTab,
    projectNameError,
    removeSelectedTech,
    resetStack,
    saveCurrentStack,
    scrollAreaRef,
    selectedCount,
    selectedFile,
    setMobileTab,
    setSelectedFile,
    setStack,
    setViewMode,
    stack,
    viewMode,
  } = useStackBuilder();
  const effectiveStack = compatibilityAnalysis.adjustedStack || stack;
  const desktopBuildNote = getDesktopBuildNote(effectiveStack);
  const [shareOpen, setShareOpen] = useState(false);
  const hasPromptedShareAfterCopyRef = useRef(false);

  const handleCommandCopied = useCallback(() => {
    if (hasPromptedShareAfterCopyRef.current) return;
    hasPromptedShareAfterCopyRef.current = true;
    setShareOpen(true);
  }, []);

  const stackUrl = getStackUrl();

  const actionButtons = (
    <ActionButtons
      onReset={resetStack}
      onSave={saveCurrentStack}
      onLoad={loadSavedStack}
      hasSavedStack={!!lastSavedStack}
      stackUrl={stackUrl}
      stackState={effectiveStack}
      yolo={stack.yolo === "true"}
      onYoloToggle={(yolo) => setStack({ yolo })}
    />
  );

  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
        {/* Single controlled share dialog for first-copy prompt (desktop+mobile ActionButtons stay uncontrolled). */}
        <ShareDialog
          stackUrl={stackUrl}
          stackState={effectiveStack}
          open={shareOpen}
          onOpenChange={setShareOpen}
          trigger={<button type="button" tabIndex={-1} className="sr-only" aria-hidden />}
        >
          Compartilhar stack
        </ShareDialog>
        <div className="sticky top-0 z-20 border-border border-b bg-fd-background/95 px-3 py-2 backdrop-blur-sm sm:hidden">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md bg-muted/20 p-1">
              <button
                type="button"
                onClick={() => setMobileTab("build")}
                className={cn(
                  "builder-focus-ring rounded px-2 py-1 font-mono text-[11px] uppercase",
                  mobileTab === "build"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/30",
                )}
              >
                Montar
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={cn(
                  "builder-focus-ring rounded px-2 py-1 font-mono text-[11px] uppercase",
                  mobileTab === "preview"
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/30",
                )}
              >
                Prévia
              </button>
            </div>
          </div>
          {mobileTab === "build" && (
            <div className="mt-2">
              <CategoryNav progress={categoryProgress} idPrefix="section-mobile" />
            </div>
          )}
        </div>

        <div className="hidden h-full flex-1 grid-cols-[19rem_minmax(0,1fr)] overflow-hidden border-border sm:grid lg:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-rule border-r bg-fd-background">
            <ScrollArea className="min-h-0 flex-1">
              <div className="p-2">
                <div className="overflow-hidden rounded-2xl bg-fd-background/80">
                  <section className="space-y-2 border-b border-border/20 px-3 py-3">
                    <label className="flex flex-col">
                      <span className="mb-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                        Nome do projeto
                      </span>
                      <Input
                        type="text"
                        value={stack.projectName || ""}
                        onChange={(event) => {
                          setStack({ projectName: event.target.value });
                        }}
                        aria-invalid={!!projectNameError}
                        aria-describedby={projectNameError ? "project-name-error" : undefined}
                        className={cn(
                          "builder-focus-ring min-h-12 min-w-0 w-full rounded-full border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-background md:text-sm",
                          projectNameError
                            ? "border-destructive bg-destructive/10 text-destructive-foreground dark:bg-destructive/10"
                            : undefined,
                        )}
                        placeholder="my-kubo-app"
                      />
                      {projectNameError && (
                        <p id="project-name-error" className="mt-1 text-destructive text-xs">
                          {projectNameError}
                        </p>
                      )}
                    </label>
                  </section>

                  <section className="border-border/20 border-b px-3 py-3">
                    <CopyInstallCommandButton
                      command={command}
                      compact
                      confetti
                      className="w-full max-w-full px-4"
                      onCopied={handleCommandCopied}
                    />
                  </section>

                  <section className="border-border/20 border-b px-3 py-3">
                    <PresetDialog onApplyPreset={applyPreset} />
                  </section>

                  <section className="border-border/20 border-b px-3 py-3">{actionButtons}</section>

                  <section className="space-y-2 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                        Stack selecionada
                      </p>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase">
                        {selectedCount} escolhas
                      </span>
                    </div>
                    <SelectedStackBadges
                      stack={stack}
                      onRemove={removeSelectedTech}
                      onJump={(category) => {
                        if (viewMode !== "command") {
                          startTransition(() => {
                            setViewMode("command");
                          });
                        }
                        scrollToCategorySection("section", category);
                      }}
                    />
                  </section>

                  {compatibilityAnalysis.changes.length > 0 && (
                    <section className="space-y-2 border-border/20 border-t px-3 py-3">
                      <p className="font-mono text-[11px] text-primary uppercase tracking-wide">
                        Log de compatibilidade
                      </p>
                      <ul className="space-y-1 rounded-lg bg-primary/7 px-2.5 py-2">
                        {compatibilityAnalysis.changes.slice(0, 4).map((change, index) => (
                          <li
                            key={`${change.category}-${change.message}-${index}`}
                            className="text-muted-foreground text-xs"
                          >
                            • {change.message}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {desktopBuildNote && (
                    <section className="space-y-2 border-border/20 border-t px-3 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-600 uppercase tracking-wide dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Nota de build desktop
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-muted-foreground text-xs">
                        {desktopBuildNote}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </ScrollArea>

            {specialSponsors.length > 0 ? (
              <div className="border-border/35 border-t bg-fd-background/95 p-2">
                <div className="rounded-2xl bg-fd-background/80 p-2">
                  <SpecialSponsorsPanel sponsors={specialSponsors} />
                </div>
              </div>
            ) : null}
          </aside>

          <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="sticky top-0 z-10 flex flex-col gap-2 border-border border-b bg-fd-background px-3 py-2 lg:col-span-2">
              <div className="flex w-fit items-center gap-1 rounded-md bg-muted/20 p-1">
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setViewMode("command");
                    });
                  }}
                  className={cn(
                    "builder-focus-ring flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] uppercase tracking-wide",
                    viewMode === "command"
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  <Terminal className="h-3 w-3" />
                  Configurar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setViewMode("preview");
                    });
                  }}
                  className={cn(
                    "builder-focus-ring flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] uppercase tracking-wide",
                    viewMode === "preview"
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  <FolderTree className="h-3 w-3" />
                  Prévia
                </button>
              </div>
              {viewMode === "command" && (
                <div className="lg:hidden">
                  <CategoryNav progress={categoryProgress} idPrefix="section" />
                </div>
              )}
            </div>

            <section className="flex min-h-0 flex-col overflow-hidden">
              {viewMode === "command" ? (
                <div ref={scrollAreaRef} className="min-h-0 flex-1">
                  <ScrollArea className="h-full overflow-hidden scroll-smooth">
                    <main className="p-2 sm:p-4">
                      <TechCategories
                        mode="desktop"
                        stack={stack}
                        compatibilityNotes={compatibilityAnalysis.notes}
                        onSelect={handleTechSelect}
                        showAllCategories
                      />
                    </main>
                  </ScrollArea>
                </div>
              ) : (
                <PreviewPanel
                  stack={effectiveStack}
                  selectedFilePath={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              )}
            </section>

            <aside className="hidden min-h-0 flex-col overflow-hidden border-rule border-l bg-background lg:flex">
              {viewMode === "command" && (
                <CategoryNav
                  progress={categoryProgress}
                  idPrefix="section"
                  orientation="vertical"
                />
              )}
            </aside>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden sm:hidden">
          {mobileTab === "build" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <ScrollArea className="h-full overflow-hidden scroll-smooth">
                <main className="p-2 pb-6">
                  <div className="mb-4 space-y-2 rounded-xl bg-muted/10 p-2">
                    <label className="flex flex-col">
                      <span className="mb-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                        Nome do projeto
                      </span>
                      <Input
                        type="text"
                        value={stack.projectName || ""}
                        onChange={(event) => {
                          setStack({ projectName: event.target.value });
                        }}
                        aria-invalid={!!projectNameError}
                        aria-describedby={
                          projectNameError ? "project-name-error-mobile" : undefined
                        }
                        className={cn(
                          "builder-focus-ring min-h-12 min-w-0 w-full rounded-full border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-background md:text-sm",
                          projectNameError
                            ? "border-destructive bg-destructive/10 text-destructive-foreground dark:bg-destructive/10"
                            : undefined,
                        )}
                        placeholder="my-kubo-app"
                      />
                      {projectNameError && (
                        <p id="project-name-error-mobile" className="mt-1 text-destructive text-xs">
                          {projectNameError}
                        </p>
                      )}
                    </label>

                    <div className="space-y-1">
                      <CopyInstallCommandButton
                        command={command}
                        compact
                        confetti
                        className="w-full max-w-full px-4"
                        onCopied={handleCommandCopied}
                      />
                    </div>

                    <PresetDialog onApplyPreset={applyPreset} />

                    {actionButtons}

                    {desktopBuildNote && (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2">
                        <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] text-amber-600 uppercase tracking-wide dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          Nota de build desktop
                        </div>
                        <p className="text-muted-foreground text-xs">{desktopBuildNote}</p>
                      </div>
                    )}
                  </div>

                  <TechCategories
                    mode="mobile"
                    stack={stack}
                    compatibilityNotes={compatibilityAnalysis.notes}
                    onSelect={handleTechSelect}
                    showAllCategories
                  />
                </main>
              </ScrollArea>

              {specialSponsors.length > 0 ? (
                <div className="border-border/35 border-t bg-fd-background/95 p-2 backdrop-blur-sm">
                  <div className="rounded-xl bg-fd-background/80 p-2">
                    <SpecialSponsorsPanel sponsors={specialSponsors} compact />
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {mobileTab === "preview" && (
            <PreviewPanel
              stack={effectiveStack}
              selectedFilePath={selectedFile}
              onSelectFile={setSelectedFile}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
