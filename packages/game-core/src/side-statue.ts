import type { Statue, Troop } from "./entities";
import type { Simulation } from "./simulation";
import { laneBounds } from "./track";

export const SIDE_STATUE_DEPTH = 1.2;
const LANE_CENTER = (laneBounds.side.left + laneBounds.side.right) / 2;

// Uma estátua por partida trancando a rampa esquerda: derrubada, não volta mais.
export const raiseSideStatue = (simulation: Simulation) => {
	const { balance, state } = simulation;
	if (state.sideStatue) return;
	const health = balance.sideStatueHealth(state.wave);
	state.sideStatue = {
		x: LANE_CENTER,
		z: balance.sideStatueZ,
		health,
		maxHealth: health,
		dead: false,
	};
};

// Ocupa a fileira inteira: basta estar nela e na profundidade da estátua.
const reaches = (statue: Statue, troop: Troop) =>
	troop.lane === "side" && Math.abs(troop.z - statue.z) <= SIDE_STATUE_DEPTH / 2;

// A única função dela é liberar as paredes: quem dá o upgrade do canhão é a estátua da direita.
const breakSideStatue = (simulation: Simulation, statue: Statue) => {
	statue.dead = true;
	simulation.events.push({ type: "sideStatueBroken", wave: simulation.state.wave });
};

const strike = (simulation: Simulation, statue: Statue, troop: Troop) => {
	troop.dead = true;
	statue.health -= troop.health;
	simulation.events.push({ type: "sideStatueHit", health: Math.max(0, statue.health) });
	if (statue.health > 0) return;
	breakSideStatue(simulation, statue);
};

export const strikeSideStatue = (simulation: Simulation) => {
	const { sideStatue, troops } = simulation.state;
	for (const troop of troops) {
		if (!sideStatue || sideStatue.dead) return;
		if (troop.dead || !reaches(sideStatue, troop)) continue;
		strike(simulation, sideStatue, troop);
	}
};
