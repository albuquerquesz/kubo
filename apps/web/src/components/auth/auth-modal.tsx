"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import { useReducer, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { z } from "zod";

import { AuthModalShowcase } from "@/components/auth/auth-modal-showcase";
import { KuboMark } from "@/components/brand/kubo-mark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import {
  emailSignInReducer,
  initialEmailSignInState,
  resolveCallbackURL,
} from "@/lib/auth-modal-state";

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
  callbackURL?: string;
};

const emailSchema = z.email();

export function AuthModal({ open, onOpenChange, reason, callbackURL }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden rounded-[0.75rem] bg-background p-0 ring-0 sm:max-w-[min(62rem,calc(100%-2rem))] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AuthModalForm reason={reason} callbackURL={callbackURL} />
        <AuthModalShowcase className="hidden md:block" />
      </DialogContent>
    </Dialog>
  );
}

function AuthModalForm({ reason, callbackURL }: Pick<AuthModalProps, "reason" | "callbackURL">) {
  const [state, dispatch] = useReducer(emailSignInReducer, initialEmailSignInState);
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const getCallbackURL = () => callbackURL ?? resolveCallbackURL(window.location.href);

  const sendMagicLink = async (address: string) => {
    dispatch({ type: "submit", email: address });
    const { error } = await authClient.signIn.magicLink({
      email: address,
      callbackURL: getCallbackURL(),
    });
    if (error) {
      dispatch({ type: "failed" });
      toast.error(error.message ?? "Não foi possível enviar o link. Tente novamente.");
      return;
    }
    dispatch({ type: "sent" });
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      toast.error("Digite um email válido.");
      return;
    }
    void sendMagicLink(parsed.data);
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: getCallbackURL(),
    });
    if (error) {
      setIsGoogleLoading(false);
      toast.error(error.message ?? "Não foi possível entrar com Google.");
    }
  };

  const isSending = state.status === "sending";

  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center px-6 py-12 sm:px-12 md:min-h-[36rem]">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <KuboMark className="h-10 w-auto" title="Kubo" />

        {state.status === "sent" ? (
          <>
            <DialogTitle className="mt-8 font-semibold text-2xl text-foreground tracking-[-0.03em]">
              Verifique seu email
            </DialogTitle>
            <DialogDescription className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Enviamos um link de acesso para <span className="text-foreground">{state.email}</span>
              . Ele expira em 5 minutos.
            </DialogDescription>
            <div className="mt-8 flex size-12 items-center justify-center border border-rule bg-muted text-primary">
              <MailCheck className="size-5" />
            </div>
            <div className="mt-8 flex w-full flex-col gap-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => void sendMagicLink(state.email)}
              >
                Reenviar link
              </Button>
              <Button variant="ghost" size="lg" onClick={() => dispatch({ type: "reset" })}>
                Usar outro email
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="mt-8 font-semibold text-2xl text-foreground tracking-[-0.03em] sm:text-[1.75rem]">
              Crie sua conta grátis
            </DialogTitle>
            <DialogDescription className="mt-3 text-muted-foreground text-sm leading-relaxed">
              {reason ?? "Salve seus stacks, acompanhe projetos e volte de onde parou."}
            </DialogDescription>

            <form
              className="mt-8 flex w-full flex-col gap-2"
              onSubmit={handleEmailSubmit}
              noValidate
            >
              <label htmlFor="auth-modal-email" className="sr-only">
                Email
              </label>
              <Input
                id="auth-modal-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={state.status === "error" || undefined}
                disabled={isSending}
                className="h-11 rounded-[0.375rem] px-3.5 text-sm md:text-sm"
              />
              <Button type="submit" size="lg" className="h-11 w-full" disabled={isSending}>
                {isSending ? <Spinner /> : null}
                Continuar com email
                {isSending ? null : <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="my-6 flex w-full items-center gap-3 font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-[0.12em]">
              <span className="h-px flex-1 bg-rule" />
              ou
              <span className="h-px flex-1 bg-rule" />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full text-sm"
              onClick={() => void handleGoogle()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? <Spinner /> : <FcGoogle className="size-4.5" />}
              Continuar com Google
            </Button>

            <p className="mt-8 max-w-xs text-muted-foreground text-xs leading-relaxed">
              Navegar no Kubo continua livre. A conta só é usada para salvar o que é seu.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
