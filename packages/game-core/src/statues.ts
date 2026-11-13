import type { Statue, Troop } from "./entities";
import type { Simulation } from "./simulation";
import { laneBounds } from "./track";

export const STATUE_DEPTH = 1.4;
// Sempre no mesmo lugar: no meio da rampa direita, fora do caminho da horda.
const RAMP_CENTER = (laneBounds.rightSide.left + laneBounds.rightSide.right) / 2;

const isStanding = (statue: Statue | null) => statue !== null && !statue.dead;

// A estátua fica de pé entre as ondas, guardando o dano; só depois de quebrada uma nova,
// com a vida da onda em que surge, aparece no início da onda seguinte.
export const raiseStatue = (simulation: Simulation) => {
	const { balance, state } = simulation;
	if (isStanding(state.statue)) return;
	const health = balance.statueHealth(state.wave);
	state.statue = {
		x: RAMP_CENTER,
		z: balance.statueZ,
		health,
		maxHealth: health,
		dead: false,
	};
};

// Só acerta quem está na profundidade da estátua: bonecos que já passaram não são pegos
// quando uma estátua nova surge no caminho deles.
const reaches = (simulation: Simulation, statue: Statue, troop: Troop) =>
	troop.lane === "rightSide" &&
	Math.abs(troop.z - statue.z) <= STATUE_DEPTH / 2 &&
	Math.abs(troop.x - statue.x) <= simulation.balance.statueWidth / 2;

const strike = (simulation: Simulation, statue: Statue, troop: Troop) => {
	troop.dead = true;
	statue.health -= troop.health;
	simulation.events.push({ type: "statueHit", health: Math.max(0, statue.health) });
	if (statue.health > 0) return;
	statue.dead = true;
	simulation.state.cannonUpgrades += 1;
	simulation.events.push({ type: "statueBroken", wave: simulation.state.wave });
};

export const strikeStatue = (simulation: Simulation) => {
	const { statue, troops } = simulation.state;
	for (const troop of troops) {
		if (!statue || statue.dead) return;
		if (troop.dead || !reaches(simulation, statue, troop)) continue;
		strike(simulation, statue, troop);
	}
};
