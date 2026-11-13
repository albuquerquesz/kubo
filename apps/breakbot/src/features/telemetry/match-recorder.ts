import type { MatchEvent, MatchStats } from "@breakbot/game-core";
import type { FrameSample } from "#/features/game-session";
import { optional } from "#/shared/optional";
import {
	type AbandonReason,
	type AppSignal,
	type InputKind,
	reportSilentError,
	trackEvent,
} from "#/shared/telemetry";
import { endedPayload, startedPayload } from "./match-payloads";
import { type MatchBeginning, type RecordedMatch, recordMatch } from "./recorded-match";
import { roundTo } from "./rounding";

export type { MatchBeginning };

type RecorderDependencies = {
	readWallet: () => number;
};

export const createMatchRecorder = ({ readWallet }: RecorderDependencies) => {
	let current = optional<RecordedMatch>(null);
	let matchNumber = 0;

	const abandon = (reason: AbandonReason) => {
		if (!current || current.ended) return;
		const { reference, snapshot, frames } = current;
		current = null;
		trackEvent("match_abandoned", {
			...reference,
			...frames.summary(),
			wave: snapshot.wave,
			reason,
			phase: snapshot.phase,
			elapsed: roundTo(snapshot.elapsed, 1),
		});
	};

	const begin = (beginning: MatchBeginning) => {
		if (current?.reference.match_id === beginning.matchId) return;
		abandon(beginning.mode === "attract" ? "left_to_menu" : "restarted");
		if (beginning.mode === "attract") return;
		current = recordMatch(beginning);
		matchNumber += 1;
		trackEvent("match_started", startedPayload(current, matchNumber));
	};

	const checkWallet = (match: RecordedMatch, stats: MatchStats) => {
		const credited = readWallet() - match.walletBefore;
		if (credited === stats.coins) return;
		reportSilentError("wallet_mismatch", "carteira não bate com as moedas da partida", {
			...match.reference,
			credited,
			coins: stats.coins,
		});
	};

	const finish = (match: RecordedMatch, stats: MatchStats) => {
		match.ended = true;
		const lastWave = match.tally.closeLost();
		if (lastWave) trackEvent("wave_completed", lastWave);
		checkWallet(match, stats);
		trackEvent("match_ended", endedPayload(match, stats, match.frames.summary(), readWallet()));
	};

	const observe = (event: MatchEvent) => {
		if (!current || current.ended) return;
		const closedWave = current.tally.observe(event);
		if (closedWave) trackEvent("wave_completed", closedWave);
		if (event.type === "introSkipped") {
			trackEvent("intro_skipped", {
				...current.reference,
				intro_seconds: roundTo(event.introElapsed, 2),
			});
		}
		if (event.type === "gameOver") finish(current, event.stats);
	};

	const reportLag = (match: RecordedMatch) => {
		if (match.lagReported) return;
		match.lagReported = true;
		reportSilentError("simulation_lagging", "simulação descartando tempo", {
			...match.reference,
			...match.frames.summary(),
		});
	};

	const sample = (frame: FrameSample) => {
		if (!current) return;
		current.tally.sampleTroops(frame.snapshot.troops.length);
		current.watch.sample(frame);
		if (current.frames.sample(frame)) reportLag(current);
	};

	const firstInput = (kind: InputKind) => {
		if (!current || current.inputSeen) return;
		current.inputSeen = true;
		const { snapshot } = current;
		trackEvent("match_first_input", {
			...current.reference,
			input_kind: kind,
			seconds_after_intro: roundTo(snapshot.elapsed - snapshot.introElapsed, 2),
		});
	};

	const signal = (appSignal: AppSignal) => {
		if (!current) return;
		if (appSignal.type === "resultsShown") return current.watch.markResultsShown();
		trackEvent("results_action_clicked", {
			...current.reference,
			wave: current.snapshot.wave,
			action: appSignal.action,
		});
	};

	return { begin, observe, sample, firstInput, signal, abandon };
};

export type MatchRecorder = ReturnType<typeof createMatchRecorder>;
