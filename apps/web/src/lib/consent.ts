/** Visitor's answer to the cookie / analytics card. `null` means not answered yet. */
export type AnalyticsConsent = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "kubo:analytics-consent";
const CONSENT_EVENT = "kubo:analytics-consent-change";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // blocked storage (private mode, policies)
  }
}

export function readConsent(): AnalyticsConsent | null {
  const value = storage()?.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

/** Saves the answer (or clears it with `null`, which shows the card again). */
export function writeConsent(consent: AnalyticsConsent | null): void {
  const store = storage();
  if (!store) return;
  try {
    if (consent) store.setItem(CONSENT_STORAGE_KEY, consent);
    else store.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}

/** Notifies on changes from this tab and from other tabs. */
export function subscribeConsent(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) listener();
  };
  window.addEventListener(CONSENT_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
