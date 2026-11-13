import { type Balance, defaultBalance } from "./balance";
import { crossBands } from "./bands";
import { growBots, moveBots, removeFallenBots } from "./bots";
import { type InputFrame, nudgeCannon, operateCannon } from "./cannon";
import { releaseChampion } from "./champions";
import { isCharged, spendCharge } from "./charge";
import { settleWaveCoins } from "./coins";
import { createBotGrid, resolveCollisions } from "./collision";
import { advanceHordeStream } from "./horde-formation";
import { createRandom } from "./random";
import { strikeSideStatue } from "./side-statue";
import {
	createState,
	isAttract,
	type MatchMode,
	type MatchState,
	type Simulation,
} from "./simulation";
import { strikeStatue } from "./statues";
import { moveTroops, removeFallenTroops } from "./troops";
import { removeFallenWalls, strikeWalls } from "./walls";
import { closeWave, isWaveOver, startWave } from "./waves";

export type MatchOptions = {
	seed: number;
	mode: MatchMode;
	balance?: Balance;
};

export type SkipIntro = { type: "skipIntro" };
export type FireChampion = { type: "fireChampion" };
export type MatchCommand = SkipIntro | FireChampion;

export type CommandRefusal = "notInIntro" | "notPlaying" | "notCharged";
export type CommandAccepted = { accepted: true };
export type CommandRefused = { accepted: false; reason: CommandRefusal };
export type CommandOutcome = CommandAccepted | CommandRefused;

// O render só lê: o snapshot é o estado vivo (sem cópia), mas readonly em todos os níveis.
type Frozen<Value> = {
	readonly [Key in keyof Value]: Value[Key] extends (infer Item)[]
		? readonly Frozen<Item>[]
		: Frozen<Value[Key]>;
};

export type MatchSnapshot = Frozen<MatchState>;

export const FIXED_STEP = 1 / 60;
// Teto de passos por chamada: evita a espiral da morte quando a aba volta ou o frame trava.
const MAX_STEPS_PER_CALL = 4;

const toSnapshot = (state: MatchSnapshot) => state;

const reset = (simulation: Simulation) => {
	simulation.state = createState(simulation.state.mode, simulation.balance);
	startWave(simulation);
};

const advanceIntro = (simulation: Simulation, seconds: number) => {
	const { balance, state } = simulation;
	state.introElapsed += seconds;
	if (state.introElapsed < balance.introDuration) return;
	state.phase = "playing";
};

const advanceWaves = (simulation: Simulation, seconds: number) => {
	const { balance, state } = simulation;
	state.waveElapsed += seconds;
	if (!isWaveOver(simulation)) return;
	closeWave(simulation);
	settleWaveCoins(simulation);
	if (isAttract(state) && state.wave >= balance.attractWaves) return reset(simulation);
	startWave(simulation);
};

const endIfDefeated = (simulation: Simulation) => {
	const { state } = simulation;
	if (isAttract(state) || state.lives > 0) return;
	state.lives = 0;
	state.phase = "over";
	settleWaveCoins(simulation);
	const { wave, score, kills, coins, elapsed } = state;
	simulation.events.push({
		type: "gameOver",
		stats: { wave, score, kills, coins, elapsed },
	});
};

const advanceUnits = (simulation: Simulation) => {
	moveTroops(simulation, FIXED_STEP);
	crossBands(simulation);
	moveBots(simulation, FIXED_STEP);
	strikeSideStatue(simulation);
	strikeWalls(simulation);
	strikeStatue(simulation);
	resolveCollisions(simulation);
};

const removeFallen = (simulation: Simulation) => {
	removeFallenTroops(simulation);
	removeFallenBots(simulation);
	removeFallenWalls(simulation);
};

const tick = (simulation: Simulation, input: InputFrame) => {
	const { state } = simulation;
	// Fim de jogo congela a partida: o tempo de sobrevivência para no instante da derrota.
	if (state.phase === "over") return;
	state.elapsed += FIXED_STEP;
	growBots(state.bots, FIXED_STEP);
	if (state.phase === "intro") return advanceIntro(simulation, FIXED_STEP);
	operateCannon(simulation, input, FIXED_STEP);
	advanceWaves(simulation, FIXED_STEP);
	advanceHordeStream(simulation, FIXED_STEP);
	advanceUnits(simulation);
	removeFallen(simulation);
	endIfDefeated(simulation);
};

const accepted = { accepted: true } satisfies CommandAccepted;

const refuse = (reason: CommandRefusal) => ({ accepted: false, reason }) satisfies CommandRefused;

const skipIntro = (simulation: Simulation) => {
	const { state } = simulation;
	if (state.phase !== "intro") return refuse("notInIntro");
	state.phase = "playing";
	simulation.events.push({ type: "introSkipped", introElapsed: state.introElapsed });
	return accepted;
};

// Carga cheia solta o gigante aliado na mira atual e zera a barra.
const fireChampion = (simulation: Simulation) => {
	const { state } = simulation;
	if (state.phase !== "playing") return refuse("notPlaying");
	if (!isCharged(simulation)) return refuse("notCharged");
	spendCharge(simulation);
	releaseChampion(simulation, state.cannon.x);
	return accepted;
};

const exposeMatch = (simulation: Simulation) => {
	let pendingSeconds = 0;

	// Devolve o tempo descartado pelo teto de passos: é a "câmera lenta" de um aparelho lento.
	const step = (elapsedSeconds: number, input: InputFrame) => {
		if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return 0;
		if (simulation.state.phase !== "over") nudgeCannon(simulation, input.aimDelta);
		const wanted = pendingSeconds + elapsedSeconds;
		pendingSeconds = Math.min(wanted, FIXED_STEP * MAX_STEPS_PER_CALL);
		const droppedSeconds = wanted - pendingSeconds;
		while (pendingSeconds >= FIXED_STEP) {
			tick(simulation, input);
			pendingSeconds -= FIXED_STEP;
		}
		return droppedSeconds;
	};

	const dispatch = (command: MatchCommand) => {
		const handlers = { skipIntro, fireChampion };
		return handlers[command.type](simulation);
	};

	return {
		step,
		dispatch,
		snapshot: () => toSnapshot(simulation.state),
		drainEvents: () => simulation.events.splice(0),
	};
};

export const createMatch = (options: MatchOptions) => {
	const balance = options.balance ?? defaultBalance;
	const simulation = {
		state: createState(options.mode, balance),
		balance,
		random: createRandom(options.seed),
		events: [],
		botGrid: createBotGrid(),
	} satisfies Simulation;
	startWave(simulation);
	return exposeMatch(simulation);
};

export type Match = ReturnType<typeof createMatch>;
