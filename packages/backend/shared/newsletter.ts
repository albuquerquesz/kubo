const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterStatus = "subscribed" | "unsubscribed";

export type SubscriptionPlan = "insert" | "resubscribe" | "noop";

/** Canonical form used as the subscriber key; `null` when the input is not an email. */
export function normalizeNewsletterEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

export type UnsubscribePageState = "confirm" | "done" | "invalid";

const UNSUBSCRIBE_COPY: Record<UnsubscribePageState, { title: string; body: string }> = {
  confirm: {
    title: "Cancelar inscrição",
    body: "Você vai deixar de receber a newsletter do Kubo.",
  },
  done: {
    title: "Inscrição cancelada",
    body: "Pronto. Você não vai mais receber a newsletter do Kubo.",
  },
  invalid: {
    title: "Link inválido",
    body: "Esse link de cancelamento não é válido ou expirou.",
  },
};

/**
 * Minimal HTML for the unsubscribe endpoint. `confirm` posts back to the same URL so link
 * scanners that follow GET requests cannot unsubscribe people by accident.
 */
export function renderUnsubscribePage(state: UnsubscribePageState): string {
  const { title, body } = UNSUBSCRIBE_COPY[state];
  const form =
    state === "confirm"
      ? '<form method="post"><button type="submit">Confirmar cancelamento</button></form>'
      : "";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Kubo</title><style>body{font-family:Arial,Helvetica,sans-serif;background:#111;color:#f7f2e8;display:grid;place-items:center;min-height:100vh;margin:0}main{max-width:28rem;padding:2rem;text-align:center}button{background:#f9ad00;color:#111;border:0;border-radius:999px;padding:.75rem 1.5rem;font-weight:700;cursor:pointer}</style></head><body><main><h1>${title}</h1><p>${body}</p>${form}</main></body></html>`;
}

export function planSubscription(existing: { status: NewsletterStatus } | null): SubscriptionPlan {
  if (!existing) return "insert";
  return existing.status === "unsubscribed" ? "resubscribe" : "noop";
}
