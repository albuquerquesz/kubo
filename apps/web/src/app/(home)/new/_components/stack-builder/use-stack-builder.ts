import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_STACK, PRESET_TEMPLATES, type StackState, TECH_OPTIONS } from "@/lib/constant";
import { useKuboHimetrica } from "@/lib/himetrica-events";
import { sanitizeStackState, TASK_RUNNER_ADDONS } from "@/lib/sanitize-stack-addons";
import { useStackState } from "@/lib/stack-url-state.client";
import {
  CATEGORY_ORDER,
  formatProjectName,
  generateStackCommand,
  generateStackSharingUrl,
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

const CATEGORY_LIST = CATEGORY_ORDER as TechCategory[];

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
    return {
      adjustmentKey: "",
      shouldApply: false,
    };
  }

  const adjustmentKey = getCompatibilityAdjustmentKey(stack, adjustedStack);
  return {
    adjustmentKey,
    shouldApply: lastAppliedAdjustmentKey !== adjustmentKey,
  };
}

export function useStackBuilder() {
  const analytics = useKuboHimetrica();
  const [stack, setStack, viewMode, setViewMode, selectedFile, setSelectedFile] = useStackState();

  const [command, setCommand] = useState("");
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
      if (viewport) {
        contentRef.current = viewport;
      }
    }
  }, [viewMode]);

  const compatibilityAnalysis = analyzeStackCompatibility(stack);
  const projectNameError = validateProjectName(stack.projectName || "");

  useEffect(() => {
    const savedStack = localStorage.getItem("kubojsStackPreference");
    if (!savedStack) {
      return;
    }

    try {
      const parsedStack = sanitizeStackState(JSON.parse(savedStack) as StackState);
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

    if (!shouldApply) {
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
      setStack(adjustedStack!);
      lastAppliedAdjustmentKey.current = adjustmentKey;
    });
  }, [stack, compatibilityAnalysis.adjustedStack, compatibilityAnalysis.changes, setStack]);

  useEffect(() => {
    const stackToUse = compatibilityAnalysis.adjustedStack || stack;
    setCommand(generateStackCommand(withFormattedProjectName(stackToUse)));
  }, [stack, compatibilityAnalysis.adjustedStack]);

  const categoryProgress = useMemo<Array<CategoryProgressItem>>(() => {
    return CATEGORY_LIST.map((category) => {
      const options = TECH_OPTIONS[category] || [];
      const selectedValue = stack[category as keyof StackState];
      const realOptionCount = options.filter((option) => option.id !== "none").length;

      if (Array.isArray(selectedValue)) {
        const selectedReal = selectedValue.filter(
          (id) => id !== "none" && options.some((option) => option.id === id),
        );
        const selectedCount = selectedReal.length;
        return {
          category,
          selected: selectedCount,
          total: Math.max(realOptionCount, 1),
          done: selectedCount > 0,
        };
      }

      const isSelectedReal =
        selectedValue !== "none" &&
        selectedValue !== "false" &&
        options.some((option) => option.id === selectedValue);

      return {
        category,
        selected: isSelectedReal ? 1 : 0,
        total: 1,
        done: isSelectedReal,
      };
    });
  }, [stack]);

  const selectedCount = useMemo(() => {
    return categoryProgress.reduce((total, entry) => total + entry.selected, 0);
  }, [categoryProgress]);

  function getStackUrl() {
    const stackToUse = compatibilityAnalysis.adjustedStack || stack;
    return generateStackSharingUrl(withFormattedProjectName(stackToUse));
  }

  function handleTechSelect(category: keyof typeof TECH_OPTIONS, techId: string) {
    if (!isOptionCompatible(stack, category, techId)) {
      return;
    }

    analytics.track("stack_option_selected", { category: String(category), value: techId });

    startTransition(() => {
      setStack((currentStack: StackState) => {
        const catKey = category as keyof StackState;
        const update: Partial<StackState> = {};
        const currentValue = currentStack[catKey];

        if (
          catKey === "webFrontend" ||
          catKey === "nativeFrontend" ||
          catKey === "addons" ||
          catKey === "testing" ||
          catKey === "examples" ||
          catKey === "payments" ||
          catKey === "observability"
        ) {
          const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
          let nextArray = [...currentArray];
          const isSelected = currentArray.includes(techId);

          if (catKey === "webFrontend") {
            if (techId === "none") {
              nextArray = ["none"];
            } else if (isSelected) {
              nextArray =
                currentArray.length > 1 ? nextArray.filter((id) => id !== techId) : ["none"];
            } else {
              nextArray = [techId];
            }
          } else if (catKey === "nativeFrontend") {
            if (techId === "none" || isSelected) {
              nextArray = ["none"];
            } else {
              nextArray = [techId];
            }
          } else if (catKey === "observability" || catKey === "payments") {
            nextArray = isSelected
              ? nextArray.filter((id) => id !== techId)
              : [...nextArray, techId];
          } else {
            nextArray = isSelected
              ? nextArray.filter((id) => id !== techId)
              : [...nextArray, techId];

            if (
              catKey === "addons" &&
              !isSelected &&
              (TASK_RUNNER_ADDONS as readonly string[]).includes(techId)
            ) {
              nextArray = nextArray.filter(
                (id) => id === techId || !(TASK_RUNNER_ADDONS as readonly string[]).includes(id),
              );
            }

            if (nextArray.length > 1) {
              nextArray = nextArray.filter((id) => id !== "none");
            }

            if (
              nextArray.length === 0 &&
              catKey !== "addons" &&
              catKey !== "testing" &&
              catKey !== "examples" &&
              catKey !== "payments" &&
              catKey !== "observability"
            ) {
              nextArray = ["none"];
            }
          }

          const uniqueNext = [...new Set(nextArray)].sort();
          const uniqueCurrent = [...new Set(currentArray)].sort();

          if (JSON.stringify(uniqueNext) !== JSON.stringify(uniqueCurrent)) {
            update[catKey] = uniqueNext as never;
          }
        } else if (currentValue !== techId) {
          update[catKey] = techId as never;
        } else if ((category === "git" || category === "install") && techId === "false") {
          update[catKey] = "true" as never;
        } else if ((category === "git" || category === "install") && techId === "true") {
          update[catKey] = "false" as never;
        }

        return Object.keys(update).length > 0 ? update : {};
      });
    });
  }

  function removeSelectedTech(category: TechCategory, techId: string) {
    const categoryKey = category as keyof StackState;
    const value = stack[categoryKey];
    const options = TECH_OPTIONS[category] || [];
    const hasNoneOption = options.some((option) => option.id === "none");
    const forceNoneFallback = category === "addons" || category === "examples";

    if (Array.isArray(value)) {
      const next = value.filter((id) => id !== techId);
      const fallback = next.length === 0 && (hasNoneOption || forceNoneFallback) ? ["none"] : next;
      startTransition(() => {
        setStack({ [categoryKey]: fallback } as Partial<StackState>);
      });
      return;
    }

    if (value === techId && hasNoneOption) {
      startTransition(() => {
        setStack({ [categoryKey]: "none" } as Partial<StackState>);
      });
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
    startTransition(() => {
      setStack(DEFAULT_STACK);
    });
    analytics.track("stack_reset", {});
    contentRef.current?.scrollTo(0, 0);
  }

  function saveCurrentStack() {
    const stackToSave = withFormattedProjectName(compatibilityAnalysis.adjustedStack || stack);
    localStorage.setItem("kubojsStackPreference", JSON.stringify(stackToSave));
    setLastSavedStack(stackToSave);
    analytics.track("stack_saved", {});
    toast.success("A configuração da sua stack foi salva");
  }

  function loadSavedStack() {
    if (!lastSavedStack) {
      return;
    }

    startTransition(() => {
      setStack(lastSavedStack);
    });

    contentRef.current?.scrollTo(0, 0);
    toast.success("Configuração salva carregada");
  }

  function applyPreset(presetId: string) {
    const preset = PRESET_TEMPLATES.find((template) => template.id === presetId);
    if (!preset) {
      return;
    }

    startTransition(() => {
      setStack(preset.stack);
    });

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
