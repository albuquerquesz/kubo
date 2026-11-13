import type { Troop } from "./entities";
import type { Simulation } from "./simulation";
import { createTroop } from "./troops";

// Solta um gigante aliado na posição x: tropa grande que ignora o teto de tropa.
// Não mexe na carga, para o Konami (#12) reutilizar a mesma criação.
export const releaseChampion = (simulation: Simulation, x: number) => {
	const { balance, state } = simulation;
	const champion = {
		...createTroop(simulation, x),
		champion: true,
		health: balance.championHealth,
		radius: balance.championRadius,
		velocityZ: balance.championSpeed,
	} satisfies Troop;
	state.troops.push(champion);
	simulation.events.push({ type: "championReleased", x: champion.x, z: champion.z });
};
