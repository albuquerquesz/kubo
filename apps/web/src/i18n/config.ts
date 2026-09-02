export const locales = ["pt-BR", "en-US"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-US";

export const localeCookieName = "kubo-locale";

export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "pt-BR" || value === "en-US";
}
