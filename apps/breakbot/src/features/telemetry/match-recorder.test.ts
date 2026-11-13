import {
	createMatch,
	defaultBalance,
	FIXED_STEP,
	type InputFrame,
	idleInput,
	laneBounds,
	type Match,
	type MatchMode,
	type WaveSettings,
} from "@breakbot/game-core";
import { beforeEach, describe, expect, it } from "vitest";
import { createRecordingSink, installSink, resetTelemetry } from "#/shared/telemetry";
import { createMatchRecorder, type MatchRecorder } from "./match-recorder";

const holdFire = { ...idleInput, firing: true } satisfies InputFrame;

// Tropa rápida e cadência alta nos cenários: os testes cobrem a telemetria, não o ritmo do balance.
const withWaves = (settings: WaveSettings, waveDuration: number) => ({
	...defaultBalance,
	troopSpeed: 30,
	fireInterval: 0.1,
	sidekickFireInterval: 0.2,
	waveSettings: () => settings,
	waveDuration: () => waveDuration,
	// Sem o fluxo contínuo: os cenários controlam quantos robôs nascem em cada onda.
	hordeStream: false,
});

const quietWaves = { horde: 48, speed: 1 } satisfies WaveSettings;
const rushingWaves = { horde: 20, speed: 200 } satisfies WaveSettings;

// Poucas vidas: a horda curta e rápida garante o fim de jogo em segundos.
const losingMatch = () => ({ ...withWaves(rushingWaves, 100), startingLives: 5 });

type Played = {
	match: Match;
	recorder: MatchRecorder;
};

type Wallet = {
	coins: number;
};

let recording = createRecordingSink();

beforeEach(() => {
	resetTelemetry();
	recording = createRecordingSink();
	installSink(recording.sink);
});

const begin = (
	balance = defaultBalance,
	mode: MatchMode = "play",
	wallet: Wallet = { coins: 0 },
) => {
	const match = createMatch({ seed: 7, mode, balance });
	const recorder = createMatchRecorder({ readWallet: () => wallet.coins });
	recorder.begin({
		matchId: "partida-1",
		seed: 7,
		mode,
		entry: "menu",
		previousBest: null,
		wallet: wallet.coins,
		snapshot: match.snapshot(),
	});
	return { match, recorder } satisfies Played;
};

// Faz o papel do driver: passo, drena eventos para o gravador, amostra o frame.
const play = (
	{ match, recorder }: Played,
	seconds: number,
	input: InputFrame = idleInput,
	droppedSeconds = 0,
) => {
	for (let elapsed = 0; elapsed < seconds; elapsed += FIXED_STEP) {
		match.step(FIXED_STEP, input);
		for (const event of match.drainEvents()) recorder.observe(event);
		recorder.sample({ deltaSeconds: FIXED_STEP, droppedSeconds, snapshot: match.snapshot() });
	}
};

const skipIntro = (played: Played) => {
	played.match.dispatch({ type: "skipIntro" });
	play(played, FIXED_STEP);
};

// Varre o corredor da horda coluna a coluna, como um jogador faria.
const SWEEP_LEFT = laneBounds.main.left + 0.04;
const SWEEP_STEP = (laneBounds.main.right - 0.04 - SWEEP_LEFT) / 20;

const sweepFiring = (played: Played, seconds: number) => {
	for (let elapsed = 0; elapsed < seconds; elapsed += 0.5) {
		const column = SWEEP_LEFT + (Math.round(elapsed * 2) % 21) * SWEEP_STEP;
		const aimDelta = column - played.match.snapshot().cannon.x;
		play(played, FIXED_STEP, { ...holdFire, aimDelta });
		play(played, 0.5, holdFire);
	}
};

const silentKinds = () => recording.exceptions.map((report) => report.kind);

describe("eventos de produto da partida", () => {
	it("anuncia a partida com id, seed e entrada", () => {
		begin();
		expect(recording.named("match_started")).toEqual([
			expect.objectContaining({ match_id: "partida-1", seed: 7, entry: "menu", match_number: 1 }),
		]);
	});

	it("onda limpa vira wave_completed com os contadores dos eventos do core", () => {
		const played = begin(withWaves(quietWaves, 100));
		skipIntro(played);
		sweepFiring(played, 30);
		const [first] = recording.named("wave_completed");
		expect(first).toMatchObject({ match_id: "partida-1", wave: 1, outcome: "cleared" });
		expect(first?.kills).toBeGreaterThan(40);
		expect(first?.shots).toBeGreaterThanOrEqual(first?.kills ?? 0);
	});

	it("onda que acaba por tempo sai como timed_out", () => {
		const played = begin(withWaves({ ...quietWaves, horde: 200, speed: 0 }, 1));
		skipIntro(played);
		play(played, 1.5);
		expect(recording.named("wave_completed")).toEqual([
			expect.objectContaining({ wave: 1, outcome: "timed_out", kills: 0 }),
		]);
	});

	it("game over fecha a onda como derrota e emite match_ended com as estatísticas do core", () => {
		const played = begin(losingMatch());
		skipIntro(played);
		play(played, 2);
		const stats = played.match.snapshot();
		expect(recording.named("wave_completed")).toEqual([
			expect.objectContaining({ wave: 1, outcome: "lost", lives_after: 0 }),
		]);
		expect(recording.named("match_ended")).toEqual([
			expect.objectContaining({
				match_id: "partida-1",
				wave: 1,
				score: stats.score,
				kills: stats.kills,
				first_record: true,
			}),
		]);
	});

	it("todo evento de partida leva o id e a seed", () => {
		const played = begin(losingMatch());
		skipIntro(played);
		play(played, 2);
		const matchEvents = [
			...recording.named("match_started"),
			...recording.named("intro_skipped"),
			...recording.named("wave_completed"),
			...recording.named("match_ended"),
		];
		expect(matchEvents).toHaveLength(4);
		for (const event of matchEvents)
			expect(event).toMatchObject({ match_id: "partida-1", seed: 7 });
	});

	it("modo demo não gera evento nenhum", () => {
		const played = begin(withWaves(rushingWaves, 1), "attract");
		play(played, 5, holdFire);
		expect(recording.names).toEqual([]);
	});

	it("sair no meio gera match_abandoned e nunca match_ended", () => {
		const played = begin(withWaves(quietWaves, 100));
		skipIntro(played);
		play(played, 2, holdFire);
		played.recorder.abandon("left_to_menu");
		play(played, 1);
		expect(recording.named("match_abandoned")).toEqual([
			expect.objectContaining({ reason: "left_to_menu", phase: "playing", wave: 1 }),
		]);
		expect(recording.named("match_ended")).toEqual([]);
	});

	it("anunciar de novo a mesma partida não duplica match_started", () => {
		const played = begin();
		played.recorder.begin({
			matchId: "partida-1",
			seed: 7,
			mode: "play",
			entry: "menu",
			previousBest: null,
			wallet: 0,
			snapshot: played.match.snapshot(),
		});
		expect(recording.named("match_started")).toHaveLength(1);
		expect(recording.named("match_abandoned")).toEqual([]);
	});

	it("registra intro pulada e o primeiro input da partida uma vez", () => {
		const played = begin();
		play(played, 0.5);
		played.recorder.firstInput("touch");
		skipIntro(played);
		played.recorder.firstInput("keyboard");
		expect(recording.named("intro_skipped")).toHaveLength(1);
		expect(recording.named("match_first_input")).toEqual([
			expect.objectContaining({ input_kind: "touch" }),
		]);
	});

	it("botão da tela de fim vira results_action_clicked", () => {
		const played = begin(losingMatch());
		skipIntro(played);
		play(played, 2);
		played.recorder.signal({ type: "resultAction", action: "replay" });
		expect(recording.named("results_action_clicked")).toEqual([
			expect.objectContaining({ action: "replay", wave: 1 }),
		]);
	});
});

describe("erros silenciosos da partida", () => {
	it("o mesmo problema volta a ser reportado na partida seguinte", () => {
		for (const matchId of ["partida-a", "partida-b"]) {
			const match = createMatch({ seed: 7, mode: "play", balance: withWaves(quietWaves, 100) });
			const recorder = createMatchRecorder({ readWallet: () => 0 });
			recorder.begin({
				matchId,
				seed: 7,
				mode: "play",
				entry: "replay",
				previousBest: null,
				wallet: 0,
				snapshot: match.snapshot(),
			});
			match.dispatch({ type: "skipIntro" });
			play({ match, recorder }, 10, idleInput, FIXED_STEP);
		}
		expect(recording.exceptions.map((report) => report.context.match_id)).toEqual([
			"partida-a",
			"partida-b",
		]);
	});

	it("estado com valor não finito é reportado uma vez", () => {
		const played = begin(withWaves(quietWaves, 100));
		skipIntro(played);
		const snapshot = { ...played.match.snapshot(), cannon: { x: Number.NaN, recoil: 0 } };
		for (let frame = 0; frame < 60; frame++) {
			played.recorder.sample({ deltaSeconds: FIXED_STEP, droppedSeconds: 0, snapshot });
		}
		expect(silentKinds()).toEqual(["match_state_invalid"]);
		expect(recording.exceptions[0]?.error.message).toContain("cannon");
	});

	it("mira não finita vinda do input não chega a corromper o estado", () => {
		const played = begin(withWaves(quietWaves, 100));
		skipIntro(played);
		play(played, 1, { ...idleInput, aimDelta: Number.NaN });
		expect(silentKinds()).toEqual([]);
	});

	it("carteira que não recebeu as moedas da partida gera wallet_mismatch", () => {
		const played = begin(withWaves({ ...quietWaves, horde: 600 }, 200));
		skipIntro(played);
		sweepFiring(played, 20);
		play(played, 120);
		expect(recording.named("match_ended")).toHaveLength(1);
		expect(silentKinds()).toContain("wallet_mismatch");
	});

	it("carteira creditada corretamente não gera alerta", () => {
		const wallet = { coins: 5 };
		const played = begin(losingMatch(), "play", wallet);
		skipIntro(played);
		play(played, 2);
		expect(recording.named("match_ended")).toHaveLength(1);
		expect(silentKinds()).not.toContain("wallet_mismatch");
	});

	it("fim de jogo sem tela de fim depois da folga gera results_missing", () => {
		const played = begin(losingMatch());
		skipIntro(played);
		play(played, 6);
		expect(silentKinds()).toEqual(["results_missing"]);
	});

	it("tela de fim exibida a tempo não gera alerta", () => {
		const played = begin(losingMatch());
		skipIntro(played);
		play(played, 2);
		played.recorder.signal({ type: "resultsShown" });
		play(played, 6);
		expect(silentKinds()).toEqual([]);
	});

	it("simulação descartando tempo por segundos gera um simulation_lagging", () => {
		const played = begin(withWaves(quietWaves, 100));
		skipIntro(played);
		play(played, 10, idleInput, FIXED_STEP);
		expect(silentKinds()).toEqual(["simulation_lagging"]);
		expect(recording.exceptions[0]?.context.dropped_ratio).toBeGreaterThan(0.25);
	});
});
