import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en-US";
import { enUS } from "./dictionaries/en-US";
import { ptBR } from "./dictionaries/pt-BR";

const dictionaries: Record<Locale, Dictionary> = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
