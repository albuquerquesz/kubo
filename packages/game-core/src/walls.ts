import type { Troop, Wall } from "./entities";
import { grantSidekick } from "./sidekicks";
import type { MatchState, Simulation } from "./simulation";

export const WALL_DEPTH = 1.6;

// As paredes ficam paradas atrás da estátua da fileira; só levam dano depois que ela cai.
export const isSideLaneOpen = (state: MatchState) => state.sideStatue?.dead === true;

// Fila nova a cada onda: as paredes ficam paradas no deck da rampa esquerda,
// da estátua até a face da barricada, com a vida da onda.
export const layWallRow = (simulation: Simulation) => {
	const { balance, state } = simulation;
	const health = balance.wallHealth(state.wave);
	state.walls = balance.wallRowZ.map(
		(z) => ({ z, health, maxHealth: health, dead: false }) satisfies Wall,
	);
};

const breakWall = (simulation: Simulation, wall: Wall) => {
	wall.dead = true;
	simulation.events.push({ type: "wallBroken", wave: simulation.state.wave });
	grantSidekick(simulation);
};

const strike = (simulation: Simulation, troop: Troop, wall: Wall) => {
	troop.dead = true;
	wall.health -= troop.health;
	simulation.events.push({ type: "wallHit", z: wall.z, health: Math.max(0, wall.health) });
	if (wall.health > 0) return;
	breakWall(simulation, wall);
};

// Só a tropa na profundidade da parede bate nela; a da frente é sempre a primeira alcançada.
const wallReachedBy = (walls: Wall[], troop: Troop) =>
	walls.find((wall) => !wall.dead && Math.abs(troop.z - wall.z) <= WALL_DEPTH / 2);

const strikeIfReached = (simulation: Simulation, troop: Troop | undefined) => {
	if (!troop || troop.dead || troop.lane !== "side") return;
	const wall = wallReachedBy(simulation.state.walls, troop);
	if (wall) strike(simulation, troop, wall);
};

export const strikeWalls = (simulation: Simulation) => {
	const { state } = simulation;
	if (!isSideLaneOpen(state)) return;
	const { troops } = state;
	// Quebrar uma parede clona tropas no fim da lista; os clones só entram no próximo tick.
	const total = troops.length;
	for (let index = 0; index < total; index++) strikeIfReached(simulation, troops[index]);
};

export const removeFallenWalls = (simulation: Simulation) => {
	simulation.state.walls = simulation.state.walls.filter((wall) => !wall.dead);
};
