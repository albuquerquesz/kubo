import type { MatchStats } from "@breakbot/game-core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { reportSilentError } from "#/shared/telemetry";
import { migrateProgress } from "./progress-migration";
import {
	type BestRecord,
	defaultProgress,
	PROGRESS_KEY,
	PROGRESS_VERSION,
	type SavedProgress,
} from "./progress-schema";
import { progressStorage } from "./progress-storage";
import { mergeProgress } from "./progress-validation";

export type { BestRecord };

export type MatchResult = {
	stats: MatchStats;
	previous: BestRecord | null;
	best: BestRecord;
	newRecord: boolean;
};

type ProgressStore = SavedProgress;

// Recorde vale por onda; empate decide por pontos.
const beats = (stats: BestRecord, best: BestRecord) =>
	stats.wave > best.wave || (stats.wave === best.wave && stats.score > best.score);

const toBest = (stats: MatchStats) =>
	({ wave: stats.wave, score: stats.score }) satisfies BestRecord;

// A primeira partida registra o recorde mas não é comemorada: não havia marca para bater.
export const settleMatch = (stats: MatchStats, previous: BestRecord | null) => {
	if (previous === null) {
		return { stats, previous, best: toBest(stats), newRecord: false } satisfies MatchResult;
	}
	if (!beats(stats, previous)) {
		return { stats, previous, best: previous, newRecord: false } satisfies MatchResult;
	}
	return { stats, previous, best: toBest(stats), newRecord: true } satisfies MatchResult;
};

export const useProgressStore = create<ProgressStore>()(
	persist<ProgressStore>(defaultProgress, {
		name: PROGRESS_KEY,
		version: PROGRESS_VERSION,
		storage: createJSONStorage(() => progressStorage),
		migrate: migrateProgress,
		merge: mergeProgress,
		// O middleware engole o erro de leitura (JSON inválido) e volta ao padrão em silêncio.
		onRehydrateStorage: () => (_state, error) => {
			if (error) reportSilentError("progress_load_failed", error, { reason: "parse" });
		},
	}),
);

export const creditCoins = (amount: number) =>
	useProgressStore.setState((store) => ({ wallet: store.wallet + amount }));

export const addLifetimeShots = (shots: number) =>
	useProgressStore.setState((store) => ({ lifetimeShots: store.lifetimeShots + shots }));

export const setMuted = (muted: boolean) => useProgressStore.setState({ muted });

export const recordResult = (stats: MatchStats) => {
	const result = settleMatch(stats, useProgressStore.getState().best);
	useProgressStore.setState({ best: result.best });
	return result;
};
