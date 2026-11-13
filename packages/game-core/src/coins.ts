import { isScoring, type Simulation } from "./simulation";

// Fecha a conta da onda: converte os robôs derrubados nela em moedas e zera o contador.
// Vale tanto para onda limpa quanto para onda encerrada por tempo ou por game over.
export const settleWaveCoins = (simulation: Simulation) => {
	const { balance, state } = simulation;
	const kills = state.waveKills;
	state.waveKills = 0;
	if (!isScoring(state)) return;
	const coins = Math.floor(kills / balance.killsPerCoin);
	if (coins === 0) return;
	state.coins += coins;
	simulation.events.push({ type: "coinsEarned", wave: state.wave, kills, coins });
};
