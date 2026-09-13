import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_STACK, PRESET_TEMPLATES, type StackState, TECH_OPTIONS } from "@/lib/constant";
import { useKuboHimetrica } from "@/lib/himetrica-events";
import { sanitizeStackState, TASK_RUNNER_ADDONS } from "@/lib/sanitize-stack-addons";
import { getFrontendSelection, replaceFrontendSelection } from "@/lib/stack-state";
import { useStackState } from "@/lib/stack-url-state.client";
import {
  CATEGORY_ORDER,
  formatProjectName,
  generateStackCommand,
  generateStackSharingUrl,
  getStackCategoryValue,
} from "@/lib/stack-utils";
import type { TechCategory } from "@/lib/types";

import { analyzeStackCompatibility, isOptionCompatible, validateProjectName } from "../utils";

export type MobileTab = "build" | "preview";

export type CategoryProgressItem = {
  category: TechCategory;
  selected: number;
  total: number;
  done: boolean;
};

const CATEGORY_LIST: TechCategory[] = CATEGORY_ORDER;

function withFormattedProjectName(stack: StackState) {
  return {
    ...stack,
    projectName: formatProjectName(stack.projectName),
  };
}

export function getCompatibilityAdjustmentKey(stack: StackState, adjustedStack: StackState) {
  return `${JSON.stringify(stack)}=>${JSON.stringify(adjustedStack)}`;
}

export function getCompatibilityAdjustmentState(
  lastAppliedAdjustmentKey: string,
  stack: StackState,
  adjustedStack: StackState | null,
) {
  if (!adjustedStack) {
    return { adjustmentKey: "", shouldApply: false };
  }

  const adjustmentKey = getCompatibilityAdjustmentKey(stack, adjustedStack);
  return {
    adjustmentKey,
    shouldApply: lastAppliedAdjustmentKey !== adjustmentKey,
  };
}

function isFrontendCategory(category: TechCategory): category is "webFrontend" | "nativeFrontend" {
  return category === "webFrontend" || category === "nativeFrontend";
}

function isMultiValueCategory(category: TechCategory): boolean {
  return (
    isFrontendCategory(category) ||
    category === "addons" ||
    category === "testing" ||
    category === "examples" ||
    category === "payments" ||
    category === "observability"
  );
}

function isTaskRunnerAddon(value: string): boolean {
  return TASK_RUNNER_ADDONS.some((addon) => addon === value);
}

export function useStackBuilder() {
  const analytics = useKuboHimetrica();
  const [stack, setStack, viewMode, setViewMode, selectedFile, setSelectedFile] = useStackState();

  const [copied, setCopied] = useState(false);
  const [lastSavedStack, setLastSavedStack] = useState<StackState | null>(null);
  const [, setLastChanges] = useState<Array<{ category: string; message: string }>>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("build");

  const contentRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const lastAppliedAdjustmentKey = useRef<string>("");

  useEffect(() => {
    analytics.track("builder_started", {});
  }, [analytics]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) contentRef.current = viewport;
    }
  }, [viewMode]);

  const compatibilityAnalysis = analyzeStackCompatibility(stack);
  const projectNameError = validateProjectName(stack.projectName);
  const stackToUse = compatibilityAnalysis.adjustedStack || stack;
  const command = useMemo(
    () => generateStackCommand(withFormattedProjectName(stackToUse)),
    [stackToUse],
  );

  useEffect(() => {
    const savedStack = localStorage.getItem("kubojsStackPreference");
    if (!savedStack) return;

    try {
      const parsedStack = sanitizeStackState(JSON.parse(savedStack));
      setLastSavedStack(parsedStack);
    } catch (error) {
      console.error("Failed to parse saved stack", error);
      localStorage.removeItem("kubojsStackPreference");
    }
  }, []);

  useEffect(() => {
    const adjustedStack = compatibilityAnalysis.adjustedStack;
    const { adjustmentKey, shouldApply } = getCompatibilityAdjustmentState(
      lastAppliedAdjustmentKey.current,
      stack,
      adjustedStack,
    );

    if (!adjustedStack || !shouldApply) {
      lastAppliedAdjustmentKey.current = adjustmentKey;
      return;
    }

    startTransition(() => {
      if (compatibilityAnalysis.changes.length === 1) {
        toast.info(compatibilityAnalysis.changes[0].message, { duration: 4000 });
      }

      if (compatibilityAnalysis.changes.length > 1) {
        const message = `${compatibilityAnalysis.changes.length} ajustes de compatibilidade feitos:\n${compatibilityAnalysis.changes
          .map((change) => `• ${change.message}`)
          .join("\n")}`;
        toast.info(message, { duration: 5000 });
      }

      setLastChanges(compatibilityAnalysis.changes);
      setStack(adjustedStack);
      lastAppliedAdjustmentKey.current = adjustmentKey;
    });
  }, [stack, compatibilityAnalysis.adjustedStack, compatibilityAnalysis.changes, setStack]);

  const categoryProgress = useMemo<Array<CategoryProgressItem>>(() => {
    return CATEGORY_LIST.map((category) => {
      const options = TECH_OPTIONS[category];
      const selectedValue = getStackCategoryValue(stack, category);
      const realOptionCount = options.filter((option) => option.id !== "none").length;

      if (Array.isArray(selectedValue)) {
        const selectedReal = selectedValue.filter(
          (id) => id !== "none" && options.some((option) => option.id === id),
        );
        return {
          category,
          selected: selectedReal.length,
          total: Math.max(realOptionCount, 1),
          done: selectedReal.length > 0,
        };
      }

      const isSelectedReal =
        typeof selectedValue === "string" &&
        selectedValue !== "none" &&
        options.some((option) => option.id === selectedValue);

      return {
        category,
        selected: isSelectedReal ? 1 : 0,
        total: 1,
        done: isSelectedReal,
      };
    });
  }, [stack]);

  const selectedCount = useMemo(
    () => categoryProgress.reduce((total, entry) => total + entry.selected, 0),
    [categoryProgress],
  );

  function getStackUrl() {
    return generateStackSharingUrl(withFormattedProjectName(stackToUse));
  }

  function handleTechSelect(category: TechCategory, techId: string) {
    if (!isOptionCompatible(stack, category, techId)) return;

    analytics.track("stack_option_selected", { category, value: techId });

    startTransition(() => {
      setStack((currentStack: StackState) => {
        let nextStack: StackState | null = null;

        if (isMultiValueCategory(category)) {
          const categoryValue = getStackCategoryValue(currentStack, category);
          const currentArray: string[] = isFrontendCategory(category)
            ? getFrontendSelection(currentStack.frontend, category)
            : Array.isArray(categoryValue)
              ? [...categoryValue]
              : [];
          let nextArray = [...currentArray];
          const isSelected = currentArray.includes(techId);

          if (isFrontendCategory(category)) {
            if (techId === "none") {
              nextArray = ["none"];
            } else if (isSelected) {
              nextArray =
                currentArray.length > 1 ? nextArray.filter((id) => id !== techId) : ["none"];
            } else {
              nextArray = [techId];
            }
          } else if (category === "observability" || category === "payments") {
            nextArray = isSelected
              ? nextArray.filter((id) => id !== techId)
              : [...nextArray, techId];
          } else {
            nextArray = isSelected
              ? nextArray.filter((id) => id !== techId)
              : [...nextArray, techId];

            if (category === "addons" && !isSelected && isTaskRunnerAddon(techId)) {
              nextArray = nextArray.filter((id) => id === techId || !isTaskRunnerAddon(id));
            }

            if (nextArray.length > 1) nextArray = nextArray.filter((id) => id !== "none");
          }

          const uniqueNext = [...new Set(nextArray)].sort();
          const uniqueCurrent = [...new Set(currentArray)].sort();
          if (JSON.stringify(uniqueNext) !== JSON.stringify(uniqueCurrent)) {
            if (isFrontendCategory(category)) {
              nextStack = {
                ...currentStack,
                frontend: replaceFrontendSelection(currentStack.frontend, category, uniqueNext),
              };
            } else {
              nextStack = sanitizeStackState({ ...currentStack, [category]: uniqueNext });
            }
          }
        } else if (category === "git") {
          if (currentStack.git === (techId === "true")) {
            nextStack = { ...currentStack, git: !currentStack.git };
          }
        } else if (category === "install") {
          if (currentStack.install === (techId === "true")) {
            nextStack = { ...currentStack, install: !currentStack.install };
          }
        } else {
          const currentValue = getStackCategoryValue(currentStack, category);
          if (typeof currentValue === "string" && currentValue !== techId) {
            nextStack = sanitizeStackState({ ...currentStack, [category]: techId });
          }
        }

        return nextStack ?? {};
      });
    });
  }

  function removeSelectedTech(category: TechCategory, techId: string) {
    const isFrontend = isFrontendCategory(category);
    const value = getStackCategoryValue(stack, category);
    const options = TECH_OPTIONS[category];
    const hasNoneOption = options.some((option) => option.id === "none");
    const forceNoneFallback = category === "addons" || category === "examples";

    if (isFrontend || Array.isArray(value)) {
      const current = isFrontend
        ? getFrontendSelection(stack.frontend, category)
        : Array.isArray(value)
          ? value
          : [];
      const next = current.filter((id) => id !== techId);
      const fallback = next.length === 0 && (hasNoneOption || forceNoneFallback) ? ["none"] : next;
      startTransition(() => {
        if (isFrontend) {
          setStack({ frontend: replaceFrontendSelection(stack.frontend, category, fallback) });
        } else {
          setStack(sanitizeStackState({ ...stack, [category]: fallback }));
        }
      });
      return;
    }

    if (value === techId && hasNoneOption) {
      startTransition(() => setStack(sanitizeStackState({ ...stack, [category]: "none" })));
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(command);
      analytics.track("command_copied", { source: "builder" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o comando. Copie manualmente.");
    }
  }

  function resetStack() {
    startTransition(() => setStack({ ...DEFAULT_STACK }));
    analytics.track("stack_reset", {});
    contentRef.current?.scrollTo(0, 0);
  }

  function saveCurrentStack() {
    const stackToSave = withFormattedProjectName(stackToUse);
    localStorage.setItem("kubojsStackPreference", JSON.stringify(stackToSave));
    setLastSavedStack(stackToSave);
    analytics.track("stack_saved", {});
    toast.success("A configuração da sua stack foi salva");
  }

  function loadSavedStack() {
    if (!lastSavedStack) return;
    startTransition(() => setStack({ ...lastSavedStack }));
    contentRef.current?.scrollTo(0, 0);
    toast.success("Configuração salva carregada");
  }

  function applyPreset(presetId: string) {
    const preset = PRESET_TEMPLATES.find((template) => template.id === presetId);
    if (!preset) return;

    startTransition(() => setStack({ ...preset.stack, yolo: false }));
    analytics.track("preset_applied", { preset: preset.id });
    contentRef.current?.scrollTo(0, 0);
    toast.success(`Modelo aplicado: ${preset.name}`);
  }

  return {
    applyPreset,
    categoryProgress,
    command,
    compatibilityAnalysis,
    copied,
    copyToClipboard,
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
  };
}
