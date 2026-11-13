import type { MatchOptions, MatchPhase, MatchState, MatchStats } from "@breakbot/game-core";

// Fonte única dos eventos de produto: nome e propriedades de tudo que vai para o PostHog.
// Propriedades em snake_case, convenção do PostHog.

export type InputKind = "touch" | "mouse" | "keyboard";
export type MatchEntry = "menu" | "replay" | "direct" | "reload";
export type WaveOutcome = "cleared" | "timed_out" | "lost";
export type AbandonReason = "left_to_menu" | "page_closed" | "restarted";
export type ResultAction = "replay" | "menu";

type Wave = MatchStats["wave"];
type Coins = MatchStats["coins"];
type Seconds = MatchStats["elapsed"];

// Todo evento de partida leva o id e a seed: com o core determinístico, dá para recriar a partida.
export type MatchReference = {
	match_id: string;
	seed: MatchOptions["seed"];
};

type WaveReference = MatchReference & {
	wave: Wave;
};

type PreviousBest = {
	best_wave_before: Wave | null;
	best_score_before: MatchStats["score"] | null;
};

export type PerformanceSummary = {
	fps_median: number;
	fps_low: number;
	dropped_ratio: number;
	bot_peak: number;
	troop_peak: number;
};

export type MatchStarted = MatchReference &
	PreviousBest & {
		entry: MatchEntry;
		match_number: number;
		first_match_ever: boolean;
		wallet_before: Coins;
	};

export type IntroSkipped = MatchReference & {
	intro_seconds: Seconds;
};

export type MatchFirstInput = MatchReference & {
	input_kind: InputKind;
	seconds_after_intro: Seconds;
};

export type WaveCompleted = WaveReference & {
	outcome: WaveOutcome;
	duration_seconds: Seconds;
	shots: MatchState["shots"];
	kills: MatchStats["kills"];
	coins: Coins;
	lives_lost: number;
	lives_after: number;
	lives_restored: number;
	walls_broken: number;
	troop_peak: number;
};

export type MatchEnded = MatchReference &
	MatchStats &
	PerformanceSummary &
	PreviousBest & {
		shots: MatchState["shots"];
		new_record: boolean;
		first_record: boolean;
		wallet_after: Coins;
	};

export type MatchAbandoned = WaveReference &
	PerformanceSummary & {
		reason: AbandonReason;
		phase: MatchPhase;
		elapsed: Seconds;
	};

export type ResultsActionClicked = WaveReference & {
	action: ResultAction;
};

export type Pageview = {
	path: string;
};

export type ProductEvents = {
	$pageview: Pageview;
	match_started: MatchStarted;
	intro_skipped: IntroSkipped;
	match_first_input: MatchFirstInput;
	wave_completed: WaveCompleted;
	match_ended: MatchEnded;
	match_abandoned: MatchAbandoned;
	results_action_clicked: ResultsActionClicked;
};

export type ProductEventName = keyof ProductEvents;

export type TelemetryValue = string | number | boolean | null;
export type TelemetryProperties = Record<string, TelemetryValue>;

export type SuperProperties = Partial<{
	build: string;
	app_version: string;
	environment: string;
	device_pixel_ratio: number;
	input_kind: InputKind;
}>;
