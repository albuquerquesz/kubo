"use client";

import { parseAsBoolean, useQueryState } from "nuqs";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { AuthModal } from "@/components/auth/auth-modal";
import { authClient } from "@/lib/auth-client";
import { AUTH_MODAL_QUERY_KEY } from "@/lib/auth-modal-state";

export type AuthModalOptions = {
  /** Short line explaining why the user needs an account, shown under the title. */
  reason?: string;
  /** Same-origin path to return to after sign-in. Defaults to the current page. */
  callbackURL?: string;
};

type AuthModalContextValue = {
  open: (options?: AuthModalOptions) => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useQueryState(
    AUTH_MODAL_QUERY_KEY,
    parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
  );
  const [options, setOptions] = useState<AuthModalOptions>({});

  const open = useCallback(
    (nextOptions: AuthModalOptions = {}) => {
      setOptions(nextOptions);
      void setIsOpen(true);
    },
    [setIsOpen],
  );

  const close = useCallback(() => {
    void setIsOpen(null);
  }, [setIsOpen]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={isOpen}
        onOpenChange={(next) => (next ? open(options) : close())}
        reason={options.reason}
        callbackURL={options.callbackURL}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}

/**
 * Soft auth gate: runs `action` when the visitor is signed in, otherwise opens
 * the auth modal so they can sign in without leaving the page.
 */
export function useRequireAuth() {
  const { open } = useAuthModal();
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  return useCallback(
    (action: () => void, options?: AuthModalOptions) => {
      if (isSignedIn) {
        action();
        return;
      }
      open(options);
    },
    [isSignedIn, open],
  );
}
