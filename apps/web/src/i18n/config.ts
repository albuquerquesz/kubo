export const locales = ["pt-BR", "en-US"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-US";

export const untranslatedContentLocale: Locale = "pt-BR";

export const localeCookieName = "kubo-locale";

export const localeCookieMaxAge = 60 * 60 * 24;

export const localeRequestHeaderName = "x-kubo-locale";

export function usesBrowserLocale(pathname: string): boolean {
  return pathname === "/";
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "pt-BR" || value === "en-US";
}
