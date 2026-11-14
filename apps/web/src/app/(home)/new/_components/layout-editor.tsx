"use client";

import type { LayoutConfig, LayoutPreset } from "@kubojs/types";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getConventionPath,
  LAYOUT_APP_IDS,
  LAYOUT_PACKAGE_IDS,
  layoutToDraft,
  validateLayoutDraft,
  type LayoutDraft,
  type LayoutDraftField,
} from "@/lib/layout-draft";
import { parseStackLayout } from "@/lib/stack-layout";
import { cn } from "@/lib/utils";

import { LayoutProfiles } from "./layout-profiles";

const PRESETS: { id: LayoutPreset; title: string; description: string }[] = [
  { id: "standard", title: "Standard", description: "apps/ e packages/" },
  { id: "libs", title: "Libs", description: "apps/ e libs/" },
];

type LayoutEditorProps = {
  /** Layout currently applied to the stack (undefined = standard). */
  layout: LayoutConfig | undefined;
  /** Called with a valid layout, or undefined for the standard one. */
  onChange: (layout: LayoutConfig | undefined) => void;
  /** Builds the create command that applies a saved profile through a single-use code. */
  buildCodeCommand: (code: string) => string;
};

export function LayoutEditor({ layout, onChange, buildCodeCommand }: LayoutEditorProps) {
  const [draft, setDraft] = useState<LayoutDraft>(() => layoutToDraft(layout));
  const appliedKey = JSON.stringify(layout ?? null);
  /**
   * Layouts this editor sent to the URL that have not landed yet. URL updates are queued and
   * resolve one by one while the user keeps typing; an older one landing must not overwrite
   * the form. Only layouts we did not emit (URL edits, saved profile, reset) resync the draft.
   */
  const pendingEmits = useRef<string[]>([]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  // Keyed on the layout's content (not object identity, which changes every render).
  useEffect(() => {
    const pendingIndex = pendingEmits.current.indexOf(appliedKey);
    if (pendingIndex !== -1) {
      pendingEmits.current = pendingEmits.current.slice(pendingIndex + 1);
      return;
    }
    pendingEmits.current = [];
    setDraft(layoutToDraft(layoutRef.current));
  }, [appliedKey]);

  function emit(next: LayoutConfig | undefined) {
    pendingEmits.current.push(JSON.stringify(next ?? null));
    onChange(next);
  }

  const validation = useMemo(() => validateLayoutDraft(draft), [draft]);

  function updateDraft(next: LayoutDraft) {
    setDraft(next);
    const result = validateLayoutDraft(next);
    if (!result.layout) return; // keep the last valid layout applied until errors are fixed
    emit(parseStackLayout(result.layout) ?? undefined);
  }

  function applyProfile(saved: LayoutConfig | undefined) {
    setDraft(layoutToDraft(saved));
    emit(saved);
  }

  function reset() {
    updateDraft(layoutToDraft(undefined));
  }

  const fieldError = (field: LayoutDraftField) => validation.fieldErrors[field];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-5">
      <header className="space-y-1">
        <h2 className="font-semibold text-base">Estrutura de pastas</h2>
        <p className="text-muted-foreground text-sm">
          Escolha onde ficam os apps e os pacotes do projeto. O comando e a prévia usam este layout.
        </p>
      </header>

      <section className="space-y-2" aria-labelledby="layout-preset-heading">
        <h3
          id="layout-preset-heading"
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide"
        >
          Preset
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={draft.preset === preset.id}
              onClick={() => updateDraft({ ...draft, preset: preset.id })}
              className={cn(
                "builder-focus-ring rounded-md border p-3 text-left transition-colors",
                draft.preset === preset.id
                  ? "border-primary bg-primary/8"
                  : "border-border hover:bg-muted/30",
              )}
            >
              <span className="block font-medium text-sm">{preset.title}</span>
              <span className="block font-mono text-muted-foreground text-xs">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="layout-dirs-heading">
        <h3
          id="layout-dirs-heading"
          className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide"
        >
          Pastas de convenção
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["apps", "packages"] as const).map((kind) => (
            <PathField
              key={kind}
              id={`layout-dir-${kind}`}
              label={kind === "apps" ? "Apps" : "Pacotes"}
              value={draft.dirs[kind]}
              placeholder={kind === "apps" ? "apps" : draft.preset === "libs" ? "libs" : "packages"}
              error={fieldError(`dirs.${kind}`)}
              onChange={(value) =>
                updateDraft({ ...draft, dirs: { ...draft.dirs, [kind]: value } })
              }
            />
          ))}
        </div>
      </section>

      <details className="group rounded-md border border-border">
        <summary className="builder-focus-ring cursor-pointer select-none px-3 py-2 font-medium text-sm">
          Caminhos por app e pacote
          <span className="ml-2 font-normal text-muted-foreground text-xs">opcional</span>
        </summary>
        <div className="space-y-4 border-border border-t p-3">
          {(["apps", "packages"] as const).map((kind) => (
            <div key={kind} className="space-y-2">
              <h4 className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                {kind === "apps" ? "Apps" : "Pacotes"}
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {(kind === "apps" ? LAYOUT_APP_IDS : LAYOUT_PACKAGE_IDS).map((id) => (
                  <PathField
                    key={id}
                    id={`layout-${kind}-${id}`}
                    label={id}
                    mono
                    value={draft[kind][id] ?? ""}
                    placeholder={getConventionPath(draft, kind, id)}
                    error={fieldError(`${kind}.${id}`)}
                    onChange={(value) =>
                      updateDraft({ ...draft, [kind]: { ...draft[kind], [id]: value } })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {validation.conflicts.length > 0 ? (
        <div
          role="alert"
          className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" /> Conflito de pastas
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-xs">
            {validation.conflicts.map((conflict) => (
              <li key={`${conflict.owners.join("|")}`}>{conflict.message}</li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            Enquanto houver conflitos, o comando continua com o último layout válido.
          </p>
        </div>
      ) : null}

      {validation.expanded ? (
        <section className="space-y-2" aria-labelledby="layout-summary-heading">
          <h3
            id="layout-summary-heading"
            className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide"
          >
            Resultado
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-muted/20 p-3 font-mono text-xs">
            {Object.entries(validation.expanded.apps).map(([id, value]) => (
              <SummaryRow key={`app-${id}`} label={`app:${id}`} value={value} />
            ))}
            {LAYOUT_PACKAGE_IDS.map((id) => (
              <SummaryRow
                key={`package-${id}`}
                label={`package:${id}`}
                value={validation.expanded?.packages[id] ?? ""}
              />
            ))}
          </dl>
          <p className="text-muted-foreground text-xs">
            Só as pastas que a sua stack usa são geradas. Veja a árvore completa logo abaixo.
          </p>
        </section>
      ) : null}

      <LayoutProfiles
        layout={validation.layout}
        onApply={applyProfile}
        buildCodeCommand={buildCodeCommand}
      />

      <div>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw data-icon="inline-start" />
          Restaurar padrão
        </Button>
      </div>
    </div>
  );
}

function PathField({
  id,
  label,
  value,
  placeholder,
  error,
  mono = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  mono?: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={cn("text-xs", mono && "font-mono")}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="font-mono text-xs"
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate">{value}</dd>
    </>
  );
}
