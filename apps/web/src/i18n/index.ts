export {
  defaultLocale,
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
  type Locale,
} from "./config";
export type { Dictionary } from "./dictionaries/en-US";
export { formatMessage } from "./format-message";
export { getDictionary } from "./get-dictionary";
export { LocaleProvider, useDictionary, useLocale } from "./locale-provider";
export { localeFromAcceptLanguage, resolveLocale } from "./resolve-locale";
