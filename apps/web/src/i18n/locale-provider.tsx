"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  isLocale,
  type Locale,
  localeCookieName,
  untranslatedContentLocale,
  usesBrowserLocale,
} from "./config";
import { enUS, type Dictionary } from "./dictionaries/en-US";
import { ptBR } from "./dictionaries/pt-BR";
import { localeFromAcceptLanguage } from "./resolve-locale";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const dictionaries: Record<Locale, Dictionary> = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

function localeFromDocumentCookie(): Locale | null {
  const prefix = `${localeCookieName}=`;
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  const value = cookie?.slice(prefix.length);
  return isLocale(value) ? value : null;
}

function localeFromNavigator(): Locale {
  return localeFromAcceptLanguage(navigator.languages.join(","));
}

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: LocaleContextValue & { children: ReactNode }) {
  const pathname = usePathname();
  const browserLocaleEnabled = usesBrowserLocale(pathname);
  const previousBrowserLocaleEnabled = useRef(browserLocaleEnabled);
  const [browserLocale, setBrowserLocale] = useState(locale);

  useEffect(() => {
    setBrowserLocale(locale);
  }, [locale]);

  useEffect(() => {
    const enteredBrowserLocalizedRoute =
      browserLocaleEnabled && !previousBrowserLocaleEnabled.current;
    previousBrowserLocaleEnabled.current = browserLocaleEnabled;

    if (!browserLocaleEnabled) return;

    if (enteredBrowserLocalizedRoute) {
      setBrowserLocale(localeFromDocumentCookie() ?? localeFromNavigator());
    }

    const handleLanguageChange = () => {
      setBrowserLocale(localeFromNavigator());
    };

    window.addEventListener("languagechange", handleLanguageChange);
    return () => window.removeEventListener("languagechange", handleLanguageChange);
  }, [browserLocaleEnabled]);

  const activeLocale = browserLocaleEnabled ? browserLocale : untranslatedContentLocale;
  const activeDictionary = activeLocale === locale ? dictionary : dictionaries[activeLocale];

  useLayoutEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  return (
    <RootProvider
      search={{
        options: {
          type: "static",
        },
      }}
      i18n={{
        locale: activeLocale,
        translations: { ...activeDictionary.fumadocs },
      }}
      theme={{
        enabled: false,
      }}
    >
      <LocaleContext.Provider value={{ locale: activeLocale, dictionary: activeDictionary }}>
        {children}
      </LocaleContext.Provider>
    </RootProvider>
  );
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useDictionary(): Dictionary {
  return useLocaleContext().dictionary;
}

function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale/useDictionary must be used within LocaleProvider");
  }
  return value;
}
