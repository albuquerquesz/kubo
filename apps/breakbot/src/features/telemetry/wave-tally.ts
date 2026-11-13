import type { MatchEvent, MatchSnapshot } from "@breakbot/game-core";
import { optional } from "#/shared/optional";
import type { MatchReference, WaveCompleted, WaveOutcome } from "#/shared/telemetry";
import { roundTo } from "./rounding";

type WaveCounters = Pick<
	WaveCompleted,
	| "wave"
	| "shots"
	| "kills"
	| "coins"
	| "lives_lost"
	| "lives_restored"
	| "walls_broken"
	| "troop_peak"
> & {
	cleared: boolean;
	startedAt: number;
};

const freshWave = (wave: number, startedAt: number, livesRestored: number) =>
	({
		wave,
		shots: 0,
		kills: 0,
		coins: 0,
		lives_lost: 0,
		lives_restored: livesRestored,
		walls_broken: 0,
		troop_peak: 0,
		cleared: false,
		startedAt,
	}) satisfies WaveCounters;

const count = (counters: WaveCounters, event: MatchEvent) => {
	if (event.type === "shot") counters.shots += 1;
	if (event.type === "botKilled") counters.kills += 1;
	if (event.type === "coinsEarned") counters.coins += event.coins;
	if (event.type === "botBreached") counters.lives_lost += event.livesLost;
	if (event.type === "wallBroken") counters.walls_broken += 1;
	if (event.type === "waveCleared") counters.cleared = true;
};

// Só conta eventos que o core já emite; nenhuma regra de jogo mora aqui.
export const createWaveTally = (reference: MatchReference, snapshot: MatchSnapshot) => {
	let current = optional<WaveCounters>(null);
	// O core cura as vidas antes de anunciar a onda nova: a cura pertence à onda seguinte.
	let restoring = 0;

	const summarize = (counters: WaveCounters, outcome: WaveOutcome) => {
		const { cleared, startedAt, ...totals } = counters;
		return {
			...totals,
			...reference,
			outcome,
			duration_seconds: roundTo(snapshot.elapsed - startedAt, 1),
			lives_after: Math.max(0, snapshot.lives - restoring),
		} satisfies WaveCompleted;
	};

	const startWave = (wave: number) => {
		const closed = current && summarize(current, current.cleared ? "cleared" : "timed_out");
		current = freshWave(wave, snapshot.elapsed, restoring);
		restoring = 0;
		return closed;
	};

	const observe = (event: MatchEvent) => {
		if (event.type === "waveStarted") return startWave(event.wave);
		if (event.type === "livesRestored") restoring += event.amount;
		if (current) count(current, event);
		return null;
	};

	const closeLost = () => current && summarize(current, "lost");

	const sampleTroops = (troops: number) => {
		if (current) current.troop_peak = Math.max(current.troop_peak, troops);
	};

	return { observe, closeLost, sampleTroops };
};
