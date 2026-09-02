import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Prefer an explicit cookie. Otherwise map Accept-Language:
 * any tag whose primary subtag is `pt` → pt-BR; everything else → en-US.
 */
export function resolveLocale(options: {
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
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
