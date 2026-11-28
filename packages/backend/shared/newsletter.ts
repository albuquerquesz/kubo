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

const RELEASE_VERSION = /^\d+\.\d+\.\d+$/;
const MAX_RELEASE_NOTES = 4000;

export type ReleaseNotice = {
  version: string;
  notes: string;
};

/** Body of the CI call that announces a published npm version. */
export function parseReleaseNotice(raw: unknown): ReleaseNotice | null {
  if (typeof raw !== "object" || raw === null) return null;
  const version = "version" in raw && typeof raw.version === "string" ? raw.version.trim() : "";
  const notes = "notes" in raw && typeof raw.notes === "string" ? raw.notes.trim() : "";
  if (!RELEASE_VERSION.test(version)) return null;
  return { version, notes: notes.slice(0, MAX_RELEASE_NOTES) };
}

/** Constant-time check for `Authorization: Bearer <secret>`. */
export function bearerMatches(header: string, secret: string): boolean {
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const length = Math.max(token.length, secret.length);
  let diff = token.length === secret.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    const left = token.charCodeAt(index);
    const right = secret.charCodeAt(index);
    diff |= (Number.isNaN(left) ? 0 : left) ^ (Number.isNaN(right) ? 0 : right);
  }
  return diff === 0;
}

export type ReleaseNoticeEmail = {
  version: string;
  releaseDate: string;
  intro: string;
  changes: { category: string; title: string; description: string }[];
  releaseUrl: string;
  docsUrl: string;
  npmUrl: string;
};

export function releaseNoticeToEmail(input: {
  version: string;
  notes: string;
  releasedOn: string;
}): ReleaseNoticeEmail {
  return {
    version: input.version,
    releaseDate: input.releasedOn,
    intro: `O create-kubojs ${input.version} está no npm.`,
    changes: [
      {
        category: "CLI",
        title: `create-kubojs ${input.version}`,
        description: input.notes.length > 0 ? input.notes : "Publicado no npm.",
      },
    ],
    releaseUrl: `https://github.com/albuquerquesz/kubo/releases/tag/v${input.version}`,
    docsUrl: "https://kubojs.dev/docs",
    npmUrl: `https://www.npmjs.com/package/create-kubojs/v/${input.version}`,
  };
}
