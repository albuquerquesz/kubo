"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, FolderTree } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import CopyInstallCommandButton from "@/app/(home)/_components/copy-install-command-button";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareDialog } from "@/components/ui/share-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { BuilderStep } from "@/lib/builder-steps";
import { getDesktopBuildNote } from "@/lib/stack-utils";
import type { Sponsor } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ActionButtons } from "../action-buttons";
import { ArchitectureDialog } from "../architecture-dialog";
import { PresetDialog } from "../preset-dialog";
import { PreviewPanel } from "../preview-panel";
import { SpecialSponsorsPanel } from "../special-sponsors-panel";
import { useBuilderSessionReplay } from "../use-builder-session-replay";
import { BuilderStepLink } from "./builder-step-link";
import { CategoryNav, scrollToCategorySection } from "./category-nav";
import { ProjectNameField } from "./project-name-field";
import { SelectedStackBadges } from "./selected-stack-badges";
import { TechCategories } from "./tech-categories";
import { useStackBuilder } from "./use-stack-builder";

type StackBuilderProps = {
  /** `stack` is `/new` (technologies), `preview` is `/new/preview` (generated file tree). */
  step?: BuilderStep;
  specialSponsors?: Sponsor[];
};

export function StackBuilder({ step = "stack", specialSponsors = [] }: StackBuilderProps) {
  const {
    applyPreset,
    categoryProgress,
    command,
    compatibilityAnalysis,
    getStackUrl,
    handleTechSelect,
    lastSavedStack,
    loadSavedStack,
    projectNameError,
    removeSelectedTech,
    resetStack,
    saveCurrentStack,
    scrollAreaRef,
    selectedCount,
    selectedFile,
    setSelectedFile,
    setStack,
    stack,
  } = useStackBuilder();
  useBuilderSessionReplay();
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
      yolo={stack.yolo}
      onYoloToggle={(yolo) => setStack({ yolo })}
    />
  );

  const renderProjectName = (id: string) => (
    <ProjectNameField
      id={id}
      value={stack.projectName || ""}
      error={projectNameError}
      onChange={(projectName) => setStack({ projectName })}
    />
  );

  const commandButton = (
    <CopyInstallCommandButton
      command={command}
      compact
      confetti
      className="w-full max-w-full px-4"
      onCopied={handleCommandCopied}
    />
  );

  // Arquitetura sits right below Templates in the sidebar (desktop) and the top card (mobile).
  const presetButtons = (
    <div className="flex flex-col gap-2">
      <PresetDialog onApplyPreset={applyPreset} />
      <ArchitectureDialog
        architecture={stack.architecture}
        onApplyArchitecture={(architecture) => setStack({ architecture })}
      />
    </div>
  );

  const desktopBuildNoteBox = desktopBuildNote ? (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2">
      <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-amber-600 uppercase tracking-wide dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Nota de build desktop
      </div>
      <p className="text-muted-foreground text-xs">{desktopBuildNote}</p>
    </div>
  ) : null;

  /* Single controlled share dialog for first-copy prompt (desktop+mobile ActionButtons stay uncontrolled). */
  const shareDialog = (
    <ShareDialog
      stackUrl={stackUrl}
      stackState={effectiveStack}
      open={shareOpen}
      onOpenChange={setShareOpen}
      trigger={<button type="button" tabIndex={-1} className="sr-only" aria-hidden />}
    >
      Compartilhar stack
    </ShareDialog>
  );

  // The preview step is a focused page: no stack sidebar, just a way back, the command and the file tree.
  if (step === "preview") {
    return (
      <TooltipProvider>
        <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
          {shareDialog}

          <div className="flex shrink-0 flex-wrap items-center gap-2 border-border border-b bg-fd-background px-3 py-2 sm:flex-nowrap sm:px-5">
            <BuilderStepLink
              step="stack"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2.5 shrink-0")}
            >
              <ArrowLeft data-icon="inline-start" />
              Voltar para a stack
            </BuilderStepLink>
            <div className="w-full min-w-0 sm:ml-auto sm:w-[min(36rem,60%)]">{commandButton}</div>
          </div>

          <section className="min-h-0 flex-1 overflow-hidden">
            <PreviewPanel
              stack={effectiveStack}
              selectedFilePath={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </section>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
        {shareDialog}

        <div className="sticky top-0 z-20 border-border border-b bg-fd-background/95 px-3 py-2 backdrop-blur-sm sm:hidden">
          <CategoryNav progress={categoryProgress} idPrefix="section-mobile" />
        </div>

        <div className="hidden h-full flex-1 grid-cols-[19rem_minmax(0,1fr)] overflow-hidden border-border sm:grid lg:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-rule border-r bg-fd-background">
            <ScrollArea className="min-h-0 flex-1">
              <div className="p-2">
                <div className="overflow-hidden rounded-2xl bg-fd-background/80">
                  <section className="border-b border-border/20 px-3 py-3">
                    {renderProjectName("project-name")}
                  </section>

                  <section className="border-border/20 border-b px-3 py-3">{commandButton}</section>

                  <section className="border-border/20 border-b px-3 py-3">{presetButtons}</section>

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
                      onJump={(category) => scrollToCategorySection("section", category)}
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

                  {desktopBuildNoteBox && (
                    <section className="border-border/20 border-t px-3 py-3">
                      {desktopBuildNoteBox}
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

          <div
            className={cn(
              "grid min-h-0 min-w-0 overflow-hidden",
              "grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_15rem] lg:grid-rows-[minmax(0,1fr)]",
            )}
          >
            {/* Below lg the category nav sits on top; from lg it moves to the right rail. */}
            <div className="sticky top-0 z-10 border-border border-b bg-fd-background px-3 py-2 lg:hidden">
              <CategoryNav progress={categoryProgress} idPrefix="section" />
            </div>

            <>
              <section className="flex min-h-0 flex-col overflow-hidden">
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
                      <NextStepCta className="mt-6" />
                    </main>
                  </ScrollArea>
                </div>
              </section>

              <aside className="hidden min-h-0 flex-col overflow-hidden border-rule border-l bg-background lg:flex">
                <CategoryNav
                  progress={categoryProgress}
                  idPrefix="section"
                  orientation="vertical"
                />
              </aside>
            </>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden sm:hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="h-full overflow-hidden scroll-smooth">
              <main className="p-2 pb-6">
                <div className="mb-4 space-y-2 rounded-xl bg-muted/10 p-2">
                  {renderProjectName("project-name-mobile")}
                  {commandButton}
                  {presetButtons}
                  {actionButtons}
                  {desktopBuildNoteBox}
                </div>

                <TechCategories
                  mode="mobile"
                  stack={stack}
                  compatibilityNotes={compatibilityAnalysis.notes}
                  onSelect={handleTechSelect}
                  showAllCategories
                />
                <NextStepCta className="mt-6" />
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
        </div>
      </div>
    </TooltipProvider>
  );
}

/** End of the technology list: points to the preview step. */
function NextStepCta({ className }: { className?: string }) {
  return (
    <BuilderStepLink
      step="preview"
      className={cn(
        "builder-focus-ring group flex items-center gap-4 rounded-xl border border-primary/40 bg-primary/6 p-4 transition-colors hover:bg-primary/10",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <FolderTree className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
          Próxima etapa
        </span>
        <span className="block font-semibold text-base">Veja a prévia do projeto</span>
        <span className="block text-muted-foreground text-sm">
          Confira a árvore de arquivos e o conteúdo gerado antes de copiar o comando.
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-primary motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
    </BuilderStepLink>
  );
}
