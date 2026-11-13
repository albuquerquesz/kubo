import {
	createMatch,
	defaultBalance,
	FIXED_STEP,
	type InputFrame,
	idleInput,
	laneBounds,
	type Match,
	type MatchEvent,
	type MatchMode,
	type WaveSettings,
} from "./index";

// Apoio compartilhado pelos testes do core: rodar partidas, atirar varrendo a pista
// e montar ondas controladas. Não é exportado pelo pacote.

export const holdFire = { ...idleInput, firing: true } satisfies InputFrame;

export const run = (match: Match, seconds: number, input: InputFrame = idleInput) => {
	const events = new Array<MatchEvent>();
	for (let elapsed = 0; elapsed < seconds; elapsed += FIXED_STEP) {
		match.step(FIXED_STEP, input);
		events.push(...match.drainEvents());
	}
	return events;
};

// Varre o corredor da horda atirando coluna a coluna, como um jogador faria.
const SWEEP_COLUMNS = 21;
const SWEEP_MARGIN = 0.04;
const SWEEP_LEFT = laneBounds.main.left + SWEEP_MARGIN;
const SWEEP_STEP = (laneBounds.main.right - SWEEP_MARGIN - SWEEP_LEFT) / (SWEEP_COLUMNS - 1);
const SWEEP_HOLD_SECONDS = 0.5;
const sweepColumn = (index: number) => SWEEP_LEFT + (index % SWEEP_COLUMNS) * SWEEP_STEP;

export const sweepFiring = (match: Match, seconds: number) => {
	const events = new Array<MatchEvent>();
	const columns = Math.ceil(seconds / SWEEP_HOLD_SECONDS);
	for (let index = 0; index < columns; index++) {
		const aimDelta = sweepColumn(index) - match.snapshot().cannon.x;
		events.push(...run(match, FIXED_STEP, { ...holdFire, aimDelta }));
		events.push(...run(match, SWEEP_HOLD_SECONDS, holdFire));
	}
	return events;
};

export const startPlaying = (balance = defaultBalance, mode: MatchMode = "play") => {
	const match = createMatch({ seed: 7, mode, balance });
	match.dispatch({ type: "skipIntro" });
	match.drainEvents();
	return match;
};

// Tropa rápida nos cenários: os testes cobrem regras, não o ritmo de jogo do balance.
// Tropa rápida e cadência alta nos cenários: os testes cobrem regras, não o ritmo do balance.
export const withWaves = (settings: WaveSettings, waveDuration: number) => ({
	...defaultBalance,
	troopSpeed: 30,
	fireInterval: 0.1,
	sidekickFireInterval: 0.2,
	waveSettings: () => settings,
	waveDuration: () => waveDuration,
	// Sem o fluxo contínuo: os cenários controlam quantos robôs nascem em cada onda.
	hordeStream: false,
});

// Funil fora da pista: para cenários que atiram nas bordas e não tratam das barricadas.

export const quietWaves = {
	horde: 0,
	speed: 1,
} satisfies WaveSettings;
export const parkedWaves = { horde: 200, speed: 0 } satisfies WaveSettings;
export const rushingWaves = {
	horde: 2,
	speed: 200,
} satisfies WaveSettings;

export const countOf = (events: MatchEvent[], type: MatchEvent["type"]) =>
	events.filter((event) => event.type === type).length;
