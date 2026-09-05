import {
  defaultLocale,
  isLocale,
  type Locale,
  untranslatedContentLocale,
  usesBrowserLocale,
} from "./config";

/**
 * Prefer the locale resolved by the request proxy, then an explicit cookie.
 * Otherwise map Accept-Language:
 * any tag whose primary subtag is `pt` → pt-BR; everything else → en-US.
 */
export function resolveLocale(options: {
  requestLocale?: string | null;
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(options.requestLocale)) {
    return options.requestLocale;
  }

  if (isLocale(options.cookie)) {
    return options.cookie;
  }

  return localeFromAcceptLanguage(options.acceptLanguage);
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;

  for (const part of header.split(",")) {
    const tag = part.trim().split(";")[0]?.trim();
    if (!tag) continue;

    const primary = tag.split("-")[0]?.toLowerCase();
    if (primary === "pt") return "pt-BR";
  }

  return defaultLocale;
}

export function localeForPathname(
  pathname: string,
  acceptLanguage: string | null | undefined,
): Locale {
  return usesBrowserLocale(pathname)
    ? localeFromAcceptLanguage(acceptLanguage)
    : untranslatedContentLocale;
}
