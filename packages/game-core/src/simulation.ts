import type { Balance, WaveSettings } from "./balance";
import type { Band, Bot, Cannon, Sidekick, Statue, Troop, Wall } from "./entities";
import type { MatchEvent } from "./events";
import type { Random } from "./random";
import { CORRIDOR_CENTER } from "./track";

export type MatchMode = "play" | "attract";
export type MatchPhase = "intro" | "playing" | "over";

export type MatchState = {
	mode: MatchMode;
	phase: MatchPhase;
	elapsed: number;
	introElapsed: number;
	wave: number;
	waveElapsed: number;
	waveDuration: number;
	waveSettings: WaveSettings;
	lives: number;
	score: number;
	kills: number;
	waveKills: number;
	coins: number;
	shots: number;
	charge: number;
	fireCooldown: number;
	// Profundidade da última fileira do fluxo contínuo da horda; ela avança com a marcha.
	streamTailZ: number;
	cannon: Cannon;
	troops: Troop[];
	bots: Bot[];
	walls: Wall[];
	bands: Band[];
	statue: Statue | null;
	sideStatue: Statue | null;
	cannonUpgrades: number;
	sidekicks: Sidekick[];
};

export type Simulation = {
	state: MatchState;
	balance: Balance;
	random: Random;
	events: MatchEvent[];
	botGrid: Bot[][];
};

const layBands = (balance: Balance) =>
	balance.bandLayout.map((placement) => ({ ...placement })) satisfies Band[];

export const createState = (mode: MatchMode, balance: Balance) =>
	({
		mode,
		phase: mode === "attract" ? "playing" : "intro",
		elapsed: 0,
		introElapsed: 0,
		wave: 0,
		waveElapsed: 0,
		waveDuration: 1,
		waveSettings: balance.waveSettings(1),
		lives: balance.startingLives,
		score: 0,
		kills: 0,
		waveKills: 0,
		coins: 0,
		shots: 0,
		charge: 0,
		fireCooldown: 0,
		streamTailZ: 0,
		cannon: { x: mode === "attract" ? 0 : CORRIDOR_CENTER, recoil: 0 },
		troops: [],
		bots: [],
		walls: [],
		bands: layBands(balance),
		statue: null,
		sideStatue: null,
		cannonUpgrades: 0,
		sidekicks: [],
	}) satisfies MatchState;

export const isScoring = (state: MatchState) => state.mode === "play";

export const isAttract = (state: MatchState) => state.mode === "attract";

export const awardPoints = (simulation: Simulation, points: number) => {
	if (!isScoring(simulation.state)) return;
	simulation.state.score += points;
};
