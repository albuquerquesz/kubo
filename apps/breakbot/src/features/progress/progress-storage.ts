import type { StateStorage } from "zustand/middleware";
import { reportSilentError } from "#/shared/telemetry";
import { LEGACY_KEY, wrapLegacySave } from "./progress-migration";

// Sem localStorage (SSR, testes) ou com ele bloqueado, o progresso vive só em memória.
const memory = new Map<string, string>();

const hasLocalStorage = () => typeof localStorage !== "undefined";

const withFallback = <Result>(operation: () => Result, fallback: () => Result) => {
	if (!hasLocalStorage()) return fallback();
	try {
		return operation();
	} catch (error) {
		reportSilentError("progress_storage_unavailable", error);
		return fallback();
	}
};

// Sem save do jogo, cai no save do protótipo (`push_v2`), que o `migrate` do persist converte.
const readSave = (name: string) =>
	localStorage.getItem(name) ?? wrapLegacySave(localStorage.getItem(LEGACY_KEY));

// O store só conhece a interface `StateStorage`; quem decide onde e como guardar é este módulo.
export const progressStorage = {
	getItem: (name) =>
		withFallback(
			() => readSave(name),
			() => memory.get(name) ?? null,
		),
	setItem: (name, value) =>
		withFallback(
			() => localStorage.setItem(name, value),
			() => {
				memory.set(name, value);
			},
		),
	removeItem: (name) =>
		withFallback(
			() => localStorage.removeItem(name),
			() => {
				memory.delete(name);
			},
		),
} satisfies StateStorage;
