import { fillHordeStream, spawnHorde } from "./horde-formation";
import { raiseSideStatue } from "./side-statue";
import { isScoring, type MatchState, type Simulation } from "./simulation";
import { raiseStatue } from "./statues";
import { layWallRow } from "./walls";

// A onda é considerada limpa quando sobra menos que isto da horda.
const CLEAR_RATIO = 0.08;
const CLEAR_MINIMUM = 8;

const restoreLives = (simulation: Simulation) => {
	const { balance, state } = simulation;
	const isRestoreWave = state.wave > 1 && state.wave % balance.restoreLivesEveryWaves === 1;
	if (!isScoring(state) || !isRestoreWave || state.lives >= balance.maxLives) return;
	const amount = Math.min(balance.livesRestored, balance.maxLives - state.lives);
	state.lives += amount;
	simulation.events.push({ type: "livesRestored", amount });
};

export const startWave = (simulation: Simulation) => {
	const { balance, state } = simulation;
	state.wave += 1;
	state.waveSettings = balance.waveSettings(state.wave);
	state.waveDuration = balance.waveDuration(state.wave);
	state.waveElapsed = 0;
	// A massa inteira acompanha o ritmo da onda nova, sem abrir buraco no fluxo.
	for (const bot of state.bots) bot.speed = state.waveSettings.speed;
	if (state.wave === 1) fillHordeStream(simulation);
	raiseStatue(simulation);
	raiseSideStatue(simulation);
	layWallRow(simulation);
	spawnHorde(simulation, state.waveSettings.horde);
	restoreLives(simulation);
	simulation.events.push({
		type: "waveStarted",
		wave: state.wave,
		horde: state.waveSettings.horde,
	});
};

const isHordeCleared = (state: MatchState) =>
	state.bots.length < Math.max(CLEAR_MINIMUM, state.waveSettings.horde * CLEAR_RATIO);

export const isWaveOver = (simulation: Simulation) => {
	const { balance, state } = simulation;
	const expired = state.waveElapsed >= state.waveDuration;
	const cleared = state.waveElapsed > balance.minimumWaveSeconds && isHordeCleared(state);
	return expired || cleared;
};

export const closeWave = (simulation: Simulation) => {
	const { balance, state } = simulation;
	if (!isScoring(state) || !isHordeCleared(state)) return;
	const bonus = state.wave * balance.clearBonusPerWave;
	state.score += bonus;
	simulation.events.push({ type: "waveCleared", wave: state.wave, bonus });
};
