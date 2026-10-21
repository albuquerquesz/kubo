export const AUTH_MODAL_QUERY_KEY = "auth";

export type EmailSignInStatus = "idle" | "sending" | "sent" | "error";

export type EmailSignInState = {
  status: EmailSignInStatus;
  email: string;
};

export type EmailSignInEvent =
  | { type: "submit"; email: string }
  | { type: "sent" }
  | { type: "failed" }
  | { type: "reset" };

export const initialEmailSignInState: EmailSignInState = { status: "idle", email: "" };

export function emailSignInReducer(
  state: EmailSignInState,
  event: EmailSignInEvent,
): EmailSignInState {
  switch (event.type) {
    case "submit":
      return { status: "sending", email: event.email };
    case "sent":
      return { ...state, status: "sent" };
    case "failed":
      return { ...state, status: "error" };
    case "reset":
      return initialEmailSignInState;
  }
}

/**
 * Returns a same-origin path (pathname + search + hash) to land on after sign-in,
 * without the query flag that opens the auth modal.
 */
export function resolveCallbackURL(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(AUTH_MODAL_QUERY_KEY);
  return `${url.pathname}${url.search}${url.hash}`;
}
