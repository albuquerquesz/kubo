import type { MatchSnapshot } from "@breakbot/game-core";
import type { FrameSample } from "#/features/game-session";
import { type MatchReference, reportSilentError } from "#/shared/telemetry";
import { roundTo } from "./rounding";
import { findStateProblems } from "./snapshot-health";

const HEALTH_INTERVAL_SECONDS = 0.25;
// A tela de fim aparece 1,1 s depois do game over; passado isto sem ela, o jogador está preso.
const RESULTS_GRACE_SECONDS = 4;

const summarizeSnapshot = (snapshot: MatchSnapshot) => ({
	phase: snapshot.phase,
	wave: snapshot.wave,
	lives: snapshot.lives,
	elapsed: snapshot.elapsed,
	cannon_x: String(snapshot.cannon.x),
	bots: snapshot.bots.length,
	troops: snapshot.troops.length,
});

// Observa a partida frame a frame: saúde do estado e tela de fim ausente.
export const createMatchWatch = (reference: MatchReference) => {
	let sinceHealthCheck = 0;
	let overSeconds = 0;
	let resultsShown = false;

	const watchHealth = (snapshot: MatchSnapshot, deltaSeconds: number) => {
		sinceHealthCheck += deltaSeconds;
		if (sinceHealthCheck < HEALTH_INTERVAL_SECONDS) return;
		sinceHealthCheck = 0;
		const problems = findStateProblems(snapshot);
		if (problems.length === 0) return;
		reportSilentError("match_state_invalid", `estado inválido: ${problems.join(", ")}`, {
			...reference,
			...summarizeSnapshot(snapshot),
		});
	};

	const watchResults = (snapshot: MatchSnapshot, deltaSeconds: number) => {
		if (snapshot.phase !== "over" || resultsShown) return;
		overSeconds += deltaSeconds;
		if (overSeconds < RESULTS_GRACE_SECONDS) return;
		reportSilentError("results_missing", "fim de jogo sem tela de fim", {
			...reference,
			seconds_over: roundTo(overSeconds, 1),
		});
	};

	const sample = ({ deltaSeconds, snapshot }: FrameSample) => {
		watchHealth(snapshot, deltaSeconds);
		watchResults(snapshot, deltaSeconds);
	};

	const markResultsShown = () => {
		resultsShown = true;
	};

	return { sample, markResultsShown };
};
