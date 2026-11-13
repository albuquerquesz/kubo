import type { MatchStats } from "@breakbot/game-core";

export type BestRecord = Pick<MatchStats, "wave" | "score">;

// Schema v1 do progresso salvo. O v0 (só `best` e `wallet`) migra preenchendo o resto com o padrão.
export type SavedProgress = {
	best: BestRecord | null;
	wallet: number;
	// Ids dos segredos achados; o catálogo chega no ticket #12, a lista já é guardada (e migrada de push_v2).
	secrets: string[];
	lifetimeShots: number;
	// Só persistida aqui; quem toca som é a feature de áudio (ticket #10).
	muted: boolean;
};

export const PROGRESS_KEY = "breakbot_progress";
export const PROGRESS_VERSION = 1;

export const defaultProgress = () =>
	({ best: null, wallet: 0, secrets: [], lifetimeShots: 0, muted: false }) satisfies SavedProgress;
