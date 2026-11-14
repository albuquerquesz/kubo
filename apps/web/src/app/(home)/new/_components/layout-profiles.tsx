"use client";

import { api } from "@kubojs/backend/convex/_generated/api";
import type { Id } from "@kubojs/backend/convex/_generated/dataModel";
import type { LayoutConfig } from "@kubojs/types";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CopyPlus, KeyRound, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import CopyInstallCommandButton from "@/app/(home)/_components/copy-install-command-button";
import { useRequireAuth } from "@/components/auth/auth-modal-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { parseStackLayout } from "@/lib/stack-layout";
import { cn } from "@/lib/utils";

/** Holds the profile name to save after a sign-in redirect. */
const PENDING_SAVE_KEY = "kubo:pending-layout-save";
const DEFAULT_PROFILE_NAME = "Meu layout";

type ProfileId = Id<"layoutProfiles">;

type LayoutProfilesProps = {
  /** Current valid layout from the editor, or undefined while the draft has errors. */
  layout: LayoutConfig | undefined;
  /** Applies a saved profile to the editor (undefined = standard). */
  onApply: (layout: LayoutConfig | undefined) => void;
  /** Builds the create command that applies a saved profile through a single-use code. */
  buildCodeCommand: (code: string) => string;
};

function readPendingSave(): string | null {
  try {
    return window.sessionStorage.getItem(PENDING_SAVE_KEY);
  } catch {
    return null;
  }
}

function writePendingSave(name: string | null): void {
  try {
    if (name === null) window.sessionStorage.removeItem(PENDING_SAVE_KEY);
    else window.sessionStorage.setItem(PENDING_SAVE_KEY, name);
  } catch {
    // Storage can be unavailable (private mode); the user can click save again.
  }
}

/** Prefers the message a Convex function threw (`ConvexError({ message })`). */
function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    const data: unknown = error.data;
    if (typeof data === "object" && data !== null && "message" in data) {
      if (typeof data.message === "string") return data.message;
    }
  }
  return error instanceof Error ? error.message : fallback;
}

/** Saved layout profiles of the account: pick, save, save as new, delete and redeem codes. */
export function LayoutProfiles({ layout, onApply, buildCodeCommand }: LayoutProfilesProps) {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const profiles = useQuery(api.layoutProfiles.list, isSignedIn ? {} : "skip");
  const saveProfile = useMutation(api.layoutProfiles.save);
  const removeProfile = useMutation(api.layoutProfiles.remove);
  const createCode = useAction(api.layoutCodes.create);
  const requireAuth = useRequireAuth();

  const [selectedId, setSelectedId] = useState<ProfileId | null>(null);
  const [name, setName] = useState(DEFAULT_PROFILE_NAME);
  const [busy, setBusy] = useState<"save" | "save-new" | "delete" | "code" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [redeemCode, setRedeemCode] = useState<{ code: string; expiresAt: number } | null>(null);

  const selected = profiles?.find((profile) => profile.id === selectedId) ?? null;

  // Forget a selection whose profile is gone (deleted here or in another tab).
  useEffect(() => {
    if (selectedId && profiles && !selected) setSelectedId(null);
  }, [profiles, selected, selectedId]);

  function select(profileId: ProfileId) {
    const profile = profiles?.find((entry) => entry.id === profileId);
    if (!profile) return;
    setSelectedId(profile.id);
    setName(profile.name);
    setConfirmDelete(false);
    setRedeemCode(null);
    onApply(parseStackLayout(profile.layout) ?? undefined);
  }

  async function save(asNew: boolean, profileName = name) {
    if (!layout) return;
    setBusy(asNew ? "save-new" : "save");
    try {
      const id = asNew ? undefined : (selectedId ?? undefined);
      const result = await saveProfile({ id, name: profileName, layout });
      writePendingSave(null);
      setSelectedId(result.id);
      setRedeemCode(null);
      toast.success(id ? "Perfil atualizado" : "Perfil salvo na sua conta");
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar o perfil"));
    } finally {
      setBusy(null);
    }
  }

  function handleSave(asNew: boolean) {
    requireAuth(() => void save(asNew), {
      reason: "Entre para salvar seu layout e reutilizá-lo nos próximos projetos.",
    });
    if (!isSignedIn) writePendingSave(name);
  }

  // Finish a save that was interrupted by the sign-in redirect.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!isSignedIn || resumedRef.current || !layout || profiles === undefined) return;
    const pendingName = readPendingSave();
    if (pendingName === null) return;
    resumedRef.current = true;
    setName(pendingName);
    void save(true, pendingName);
    // save() reads the current layout; running once after sign-in is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, layout, profiles]);

  async function handleDelete() {
    if (!selected) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy("delete");
    try {
      await removeProfile({ id: selected.id });
      setSelectedId(null);
      setName(DEFAULT_PROFILE_NAME);
      setRedeemCode(null);
      toast.success(`Perfil "${selected.name}" excluído`);
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível excluir o perfil"));
    } finally {
      setBusy(null);
      setConfirmDelete(false);
    }
  }

  async function handleCreateCode() {
    if (!selected) return;
    setBusy("code");
    try {
      setRedeemCode(await createCode({ profileId: selected.id }));
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível gerar o código"));
    } finally {
      setBusy(null);
    }
  }

  const trimmedName = name.trim();

  return (
    <section
      className="space-y-3 rounded-md border border-border p-3"
      aria-labelledby="layout-profiles-heading"
    >
      <header className="space-y-1">
        <h3 id="layout-profiles-heading" className="font-medium text-sm">
          Perfis salvos
        </h3>
        <p className="text-muted-foreground text-xs">
          Salve layouts com nome na sua conta e escolha qual aplicar. Clicar em um perfil carrega o
          layout dele no editor.
        </p>
      </header>

      {profiles && profiles.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Perfis salvos">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              aria-pressed={profile.id === selectedId}
              onClick={() => select(profile.id)}
              className={cn(
                "builder-focus-ring max-w-full truncate rounded-md border px-3 py-1.5 text-left text-sm transition-colors",
                profile.id === selectedId
                  ? "border-primary bg-primary/8"
                  : "border-border hover:bg-muted/30",
              )}
            >
              {profile.name}
            </button>
          ))}
        </div>
      ) : isSignedIn && profiles ? (
        <p className="text-muted-foreground text-xs">Nenhum perfil salvo ainda.</p>
      ) : null}

      <div className="flex flex-col gap-1 sm:max-w-sm">
        <label htmlFor="layout-profile-name" className="text-xs">
          Nome do perfil
        </label>
        <Input
          id="layout-profile-name"
          value={name}
          maxLength={48}
          autoComplete="off"
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => handleSave(false)}
          disabled={!layout || !trimmedName || busy !== null}
        >
          <Save data-icon="inline-start" />
          {busy === "save" ? "Salvando…" : selected ? "Atualizar perfil" : "Salvar na conta"}
        </Button>
        {selected ? (
          <>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={!layout || !trimmedName || busy !== null}
            >
              <CopyPlus data-icon="inline-start" />
              {busy === "save-new" ? "Salvando…" : "Salvar como novo"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleDelete()}
              onBlur={() => setConfirmDelete(false)}
              disabled={busy !== null}
              className={cn(confirmDelete && "text-destructive")}
            >
              <Trash2 data-icon="inline-start" />
              {busy === "delete" ? "Excluindo…" : confirmDelete ? "Confirmar exclusão" : "Excluir"}
            </Button>
          </>
        ) : null}
      </div>

      {selected ? (
        <div className="space-y-2 border-border border-t pt-3">
          <h4 className="font-medium text-sm">Comando com o perfil “{selected.name}”</h4>
          <p className="text-muted-foreground text-xs">
            Gera um comando de uso único, válido por 10 minutos, que aplica a versão salva deste
            perfil. O CLI troca o código pelo layout antes de criar qualquer arquivo.
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleCreateCode()}
            disabled={busy !== null}
          >
            <KeyRound data-icon="inline-start" />
            {busy === "code" ? "Gerando…" : redeemCode ? "Gerar outro código" : "Gerar comando"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
