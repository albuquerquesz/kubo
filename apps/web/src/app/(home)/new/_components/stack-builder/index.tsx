"use client";

import { AlertTriangle, ArrowRight, FolderTree } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import CopyInstallCommandButton from "@/app/(home)/_components/copy-install-command-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareDialog } from "@/components/ui/share-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { builderStepHref, type BuilderStep } from "@/lib/builder-steps";
import { getDesktopBuildNote, withLayoutCode } from "@/lib/stack-utils";
import type { Sponsor } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ActionButtons } from "../action-buttons";
import { LayoutEditor } from "../layout-editor";
import { PresetDialog } from "../preset-dialog";
import { PreviewPanel } from "../preview-panel";
import { SpecialSponsorsPanel } from "../special-sponsors-panel";
import { BuilderStepLink } from "./builder-step-link";
import { BuilderStepper } from "./builder-stepper";
import { CategoryNav, scrollToCategorySection } from "./category-nav";
import { ProjectNameField } from "./project-name-field";
import { ProjectStructureCard } from "./project-structure-card";
import { SelectedStackBadges } from "./selected-stack-badges";
import { TechCategories } from "./tech-categories";
import { useStackBuilder } from "./use-stack-builder";

type StackBuilderProps = {
  /** `stack` is `/new` (technologies), `layout` is `/new/layout` (folder structure + preview). */
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveStack = compatibilityAnalysis.adjustedStack || stack;
  const desktopBuildNote = getDesktopBuildNote(effectiveStack);
  const [shareOpen, setShareOpen] = useState(false);
  const hasPromptedShareAfterCopyRef = useRef(false);
  const isLayoutStep = step === "layout";

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

  const structureCard = <ProjectStructureCard layout={stack.layout} step={step} />;

  const layoutEditor = (
    <LayoutEditor
      layout={stack.layout}
      onChange={(layout) => setStack({ layout })}
      buildCodeCommand={(code) => withLayoutCode(command, code)}
    />
  );

  const previewPanel = (
    <PreviewPanel
      stack={effectiveStack}
      selectedFilePath={selectedFile}
      onSelectFile={setSelectedFile}
    />
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

  const jumpToCategory = (category: string) => {
    if (isLayoutStep) router.push(builderStepHref("stack", searchParams.toString()));
    scrollToCategorySection("section", category);
  };

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
          <BuilderStepper current={step} />
          {!isLayoutStep && (
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
                  <section className="border-b border-border/20 px-3 py-3">
                    {renderProjectName("project-name")}
                  </section>

                  <section className="border-border/20 border-b px-3 py-3">{commandButton}</section>

                  <section className="border-border/20 border-b px-3 py-3">{structureCard}</section>

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
                      onJump={jumpToCategory}
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
              "grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden",
              !isLayoutStep && "lg:grid-cols-[minmax(0,1fr)_15rem]",
            )}
          >
            <div className="sticky top-0 z-10 flex flex-col gap-2 border-border border-b bg-fd-background px-3 py-2 lg:col-span-2">
              <BuilderStepper current={step} />
              {!isLayoutStep && (
                <div className="lg:hidden">
                  <CategoryNav progress={categoryProgress} idPrefix="section" />
                </div>
              )}
            </div>

            {isLayoutStep ? (
              <section className="flex min-h-0 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
                <div className="shrink-0 xl:min-h-0 xl:w-[min(34rem,45%)] xl:overflow-y-auto xl:border-rule xl:border-r">
                  {layoutEditor}
                </div>
                <div className="mx-3 mb-5 h-[36rem] shrink-0 overflow-hidden rounded-md border border-border sm:mx-5 xl:m-0 xl:h-auto xl:min-h-0 xl:flex-1 xl:rounded-none xl:border-0">
                  {previewPanel}
                </div>
              </section>
            ) : (
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
                    trailing={
                      <BuilderStepLink
                        step="layout"
                        className="builder-focus-ring mt-2 flex w-full shrink-0 items-center justify-between rounded-[0.5rem] border border-primary/40 px-3 py-2 font-mono text-primary text-xs uppercase tracking-wide transition-colors hover:bg-primary/10"
                      >
                        Layout
                        <ArrowRight className="size-3.5" />
                      </BuilderStepLink>
                    }
                  />
                </aside>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden sm:hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="h-full overflow-hidden scroll-smooth">
              <main className="p-2 pb-6">
                <div className="mb-4 space-y-2 rounded-xl bg-muted/10 p-2">
                  {renderProjectName("project-name-mobile")}
                  {commandButton}
                  {structureCard}
                  {!isLayoutStep && (
                    <>
                      <PresetDialog onApplyPreset={applyPreset} />
                      {actionButtons}
                      {desktopBuildNoteBox}
                    </>
                  )}
                </div>

                {isLayoutStep ? (
                  <>
                    <div className="rounded-xl border border-border">{layoutEditor}</div>
                    <div className="mt-4 h-[32rem] overflow-hidden rounded-xl border border-border">
                      {previewPanel}
                    </div>
                  </>
                ) : (
                  <>
                    <TechCategories
                      mode="mobile"
                      stack={stack}
                      compatibilityNotes={compatibilityAnalysis.notes}
                      onSelect={handleTechSelect}
                      showAllCategories
                    />
                    <NextStepCta className="mt-6" />
                  </>
                )}
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

/** End of the technology list: points to the layout step. */
function NextStepCta({ className }: { className?: string }) {
  return (
    <BuilderStepLink
      step="layout"
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
        <span className="block font-semibold text-base">Monte a estrutura de pastas</span>
        <span className="block text-muted-foreground text-sm">
          Escolha onde ficam os apps e os pacotes e veja a árvore do projeto.
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-primary motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
    </BuilderStepLink>
  );
}
