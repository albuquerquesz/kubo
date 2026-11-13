import type { MatchDescription } from "#/features/game-session";
import type { BestRecord } from "#/features/progress";
import { createFrameStats } from "./frame-stats";
import { createMatchWatch } from "./match-watch";
import { createWaveTally } from "./wave-tally";

export type MatchBeginning = MatchDescription & {
	previousBest: BestRecord | null;
	wallet: number;
};

// Tudo que o gravador acumula de uma partida em modo jogo.
export const recordMatch = (beginning: MatchBeginning) => {
	const reference = { match_id: beginning.matchId, seed: beginning.seed };
	return {
		reference,
		entry: beginning.entry,
		previousBest: beginning.previousBest,
		walletBefore: beginning.wallet,
		// Estado vivo da partida (o snapshot do core não é cópia).
		snapshot: beginning.snapshot,
		tally: createWaveTally(reference, beginning.snapshot),
		frames: createFrameStats(),
		watch: createMatchWatch(reference),
		ended: false,
		inputSeen: false,
		lagReported: false,
	};
};

export type RecordedMatch = ReturnType<typeof recordMatch>;
