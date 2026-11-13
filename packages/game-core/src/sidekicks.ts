import type { Sidekick } from "./entities";
import { sidekickX } from "./sidekick-formation";
import type { Simulation } from "./simulation";
import { spawnTroop } from "./troops";

const RECOIL_RECOVERY = 10;

// Cada slot atira numa fase própria da cadência: com muitos mini-canhões sai uma rajada
// contínua em vez de todos dispararem no mesmo frame.
const phaseOf = (simulation: Simulation, slot: number) => {
	const { balance } = simulation;
	return (slot / balance.maxSidekicks) * balance.sidekickFireInterval;
};

const freeSlot = (simulation: Simulation) => {
	const { balance, state } = simulation;
	const taken = new Set(state.sidekicks.map((sidekick) => sidekick.slot));
	return Array.from({ length: balance.maxSidekicks }, (_, slot) => slot).find(
		(slot) => !taken.has(slot),
	);
};

export const grantSidekick = (simulation: Simulation) => {
	const { state } = simulation;
	const slot = freeSlot(simulation);
	if (slot === undefined) return;
	state.sidekicks.push({ slot, recoil: 0, cooldown: phaseOf(simulation, slot) });
	simulation.events.push({ type: "sidekickJoined", slot, total: state.sidekicks.length + 1 });
};

// Sem gatilho, o cooldown desce só até a fase do slot, para a rajada continuar escalonada.
const operate = (simulation: Simulation, sidekick: Sidekick, firing: boolean, seconds: number) => {
	const { balance, state } = simulation;
	sidekick.recoil = Math.max(0, sidekick.recoil - seconds * RECOIL_RECOVERY);
	sidekick.cooldown -= seconds;
	if (!firing) {
		sidekick.cooldown = Math.max(phaseOf(simulation, sidekick.slot), sidekick.cooldown);
		return;
	}
	if (sidekick.cooldown > 0) return;
	sidekick.cooldown += balance.sidekickFireInterval;
	sidekick.recoil = 1;
	spawnTroop(simulation, sidekickX(state.cannon.x, sidekick.slot));
};

export const operateSidekicks = (simulation: Simulation, firing: boolean, seconds: number) => {
	for (const sidekick of simulation.state.sidekicks) operate(simulation, sidekick, firing, seconds);
};
