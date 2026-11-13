import type { MatchStats } from "@breakbot/game-core";
import { type BestRecord, settleMatch } from "#/features/progress";
import type { MatchEnded, MatchStarted, PerformanceSummary } from "#/shared/telemetry";
import type { RecordedMatch } from "./recorded-match";
import { roundTo } from "./rounding";

const previousBestOf = (previousBest: BestRecord | null) => ({
	best_wave_before: previousBest?.wave ?? null,
	best_score_before: previousBest?.score ?? null,
});

export const startedPayload = (match: RecordedMatch, matchNumber: number) =>
	({
		...match.reference,
		...previousBestOf(match.previousBest),
		entry: match.entry,
		match_number: matchNumber,
		first_match_ever: match.previousBest === null,
		wallet_before: match.walletBefore,
	}) satisfies MatchStarted;

export const endedPayload = (
	match: RecordedMatch,
	stats: MatchStats,
	performance: PerformanceSummary,
	walletAfter: number,
) =>
	({
		...stats,
		...performance,
		...match.reference,
		...previousBestOf(match.previousBest),
		elapsed: roundTo(stats.elapsed, 1),
		shots: match.snapshot.shots,
		new_record: settleMatch(stats, match.previousBest).newRecord,
		first_record: match.previousBest === null,
		wallet_after: walletAfter,
	}) satisfies MatchEnded;
