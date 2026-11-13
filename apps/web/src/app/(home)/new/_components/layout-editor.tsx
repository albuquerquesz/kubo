"use client";

import { api } from "@kubojs/backend/convex/_generated/api";
import type { LayoutConfig, LayoutPreset } from "@kubojs/types";
import { useAction, useMutation, useQuery } from "convex/react";
import { AlertTriangle, CloudDownload, KeyRound, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import CopyInstallCommandButton from "@/app/(home)/_components/copy-install-command-button";
import { useRequireAuth } from "@/components/auth/auth-modal-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
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

/** Set before a sign-in redirect so the layout is saved when the user comes back. */
const PENDING_SAVE_KEY = "kubo:pending-layout-save";

const PRESETS: { id: LayoutPreset; title: string; description: string }[] = [
  { id: "standard", title: "Standard", description: "apps/ e packages/" },
  { id: "libs", title: "Libs", description: "apps/ e libs/" },
];

type LayoutEditorProps = {
  /** Layout currently applied to the stack (undefined = standard). */
  layout: LayoutConfig | undefined;
  /** Called with a valid layout, or undefined for the standard one. */
  onChange: (layout: LayoutConfig | undefined) => void;
  /** Builds the create command that applies the saved layout through a single-use code. */
  buildCodeCommand: (code: string) => string;
};

function readPendingSave(): boolean {
  try {
    return window.sessionStorage.getItem(PENDING_SAVE_KEY) === "1";
  } catch {
    return false;
  }
}

function writePendingSave(pending: boolean): void {
  try {
    if (pending) window.sessionStorage.setItem(PENDING_SAVE_KEY, "1");
    else window.sessionStorage.removeItem(PENDING_SAVE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the user can click save again.
  }
}

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

  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const savedProfile = useQuery(api.layoutProfiles.getMine, isSignedIn ? {} : "skip");
  const saveMine = useMutation(api.layoutProfiles.saveMine);
  const requireAuth = useRequireAuth();
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!validation.layout) return;
    setSaving(true);
    try {
      await saveMine({ layout: validation.layout });
      writePendingSave(false);
      toast.success("Layout salvo na sua conta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o layout");
    } finally {
      setSaving(false);
    }
  }

  function handleSave() {
    requireAuth(() => void save(), {
      reason: "Entre para salvar seu layout e reutilizá-lo nos próximos projetos.",
    });
    if (!isSignedIn) writePendingSave(true);
  }

  // Finish a save that was interrupted by the sign-in redirect.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!isSignedIn || resumedRef.current || !validation.layout) return;
    if (!readPendingSave()) return;
    resumedRef.current = true;
    void save();
    // save() reads the current validation; running once after sign-in is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, validation.layout]);

  function applySaved() {
    const saved = parseStackLayout(savedProfile?.layout) ?? undefined;
    setDraft(layoutToDraft(saved));
    emit(saved);
    toast.success("Layout salvo aplicado");
  }

  const createCode = useAction(api.layoutCodes.create);
  const [redeemCode, setRedeemCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [creatingCode, setCreatingCode] = useState(false);

  async function handleCreateCode() {
    setCreatingCode(true);
    try {
      setRedeemCode(await createCode({}));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o código");
    } finally {
      setCreatingCode(false);
    }
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
          Escolha onde ficam os apps e os pacotes do projeto. O comando e a prévia usam este layout;
          os imports entre pacotes (<code>@seu-app/ui</code>) não mudam.
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
        <p className="text-muted-foreground text-xs">
          Use <code>.</code> para colocar direto na raiz do projeto.
        </p>
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
            Só as pastas que a sua stack usa são geradas. Veja a árvore completa na aba Prévia.
          </p>
        </section>
      ) : null}

      {savedProfile ? (
        <section className="space-y-2 rounded-md border border-border p-3" aria-labelledby="layout-code-heading">
          <h3 id="layout-code-heading" className="font-medium text-sm">
            Comando com o layout salvo
          </h3>
          <p className="text-muted-foreground text-xs">
            Gera um comando de uso único, válido por 10 minutos, que aplica o layout salvo na sua
            conta. O CLI troca o código pelo layout antes de criar qualquer arquivo.
          </p>
          {redeemCode ? (
            <div className="space-y-1">
              <CopyInstallCommandButton
                command={buildCodeCommand(redeemCode.code)}
                compact
                className="w-full max-w-full px-4"
              />
              <p className="text-muted-foreground text-xs">
                Expira às{" "}
                {new Date(redeemCode.expiresAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                e funciona uma vez. Gerar outro invalida este.
              </p>
            </div>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => void handleCreateCode()} disabled={creatingCode}>
            <KeyRound data-icon="inline-start" />
            {creatingCode ? "Gerando…" : redeemCode ? "Gerar outro código" : "Gerar comando"}
          </Button>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSave} disabled={!validation.layout || saving}>
          <Save data-icon="inline-start" />
          {saving ? "Salvando…" : "Salvar na conta"}
        </Button>
        {savedProfile ? (
          <Button variant="outline" onClick={applySaved}>
            <CloudDownload data-icon="inline-start" />
            Usar layout salvo
          </Button>
        ) : null}
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
