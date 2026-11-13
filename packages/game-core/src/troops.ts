import type { Troop } from "./entities";
import { funnelBoundsAt } from "./funnel";
import { awardPoints, type Simulation } from "./simulation";
import { type Lane, laneBounds, laneFor, MUZZLE_Z, TOWER_Z } from "./track";

const TROOP_RADIUS = 0.03;
const LATERAL_DRAG = 3;

const marchSpeed = (simulation: Simulation) => {
	const speed = simulation.balance.troopSpeed;
	return simulation.random.between(speed * 0.93, speed * 1.07);
};

export const createTroop = (simulation: Simulation, x: number) => {
	const { random } = simulation;
	return {
		x: x + random.between(-0.02, 0.02),
		z: MUZZLE_Z,
		lane: laneFor(x),
		radius: TROOP_RADIUS,
		health: 1,
		animationOffset: random.between(0, Math.PI * 2),
		dead: false,
		velocityX: random.between(-0.15, 0.15),
		velocityZ: marchSpeed(simulation),
		nextBand: 0,
		champion: false,
		boost: 0,
	} satisfies Troop;
};

export const spawnTroop = (simulation: Simulation, x: number) => {
	const { balance, state } = simulation;
	if (state.troops.length >= balance.troopCap) return;
	state.troops.push(createTroop(simulation, x));
};

// No corredor a tropa ocupa o mesmo espaço livre da horda; nas rampas, a rampa inteira.
const freeBoundsFor = (simulation: Simulation, troop: Troop) =>
	troop.lane === "main"
		? funnelBoundsAt(simulation.balance.funnel, troop.z)
		: laneBounds[troop.lane];

const bounceInsideLane = (simulation: Simulation, troop: Troop) => {
	const bounds = freeBoundsFor(simulation, troop);
	if (troop.x < bounds.left + troop.radius) {
		troop.x = bounds.left + troop.radius;
		troop.velocityX = Math.abs(troop.velocityX);
		return;
	}
	if (troop.x > bounds.right - troop.radius) {
		troop.x = bounds.right - troop.radius;
		troop.velocityX = -Math.abs(troop.velocityX);
	}
};

const hitTower = (simulation: Simulation, troop: Troop) => {
	troop.dead = true;
	awardPoints(simulation, troop.champion ? simulation.balance.championTowerPoints : 1);
	simulation.events.push({ type: "towerHit", x: troop.x });
};

// Quem sobe uma rampa some no fim dela, na face da barricada: a rampa só serve aos recursos.
const reachEnd = (simulation: Simulation, troop: Troop) => {
	if (troop.lane !== "main") {
		troop.dead = true;
		return;
	}
	hitTower(simulation, troop);
};

const endOf = (simulation: Simulation, lane: Lane) =>
	lane === "main" ? TOWER_Z : simulation.balance.funnel.mouthZ;

const moveTroop = (simulation: Simulation, troop: Troop, seconds: number) => {
	troop.z += troop.velocityZ * seconds;
	troop.x += troop.velocityX * seconds;
	troop.velocityX *= 1 - Math.min(1, LATERAL_DRAG * seconds);
	troop.boost = Math.max(0, troop.boost - seconds);
	bounceInsideLane(simulation, troop);
	if (troop.z < endOf(simulation, troop.lane)) return;
	reachEnd(simulation, troop);
};

export const moveTroops = (simulation: Simulation, seconds: number) => {
	for (const troop of simulation.state.troops) {
		if (troop.dead) continue;
		moveTroop(simulation, troop, seconds);
	}
};

export const removeFallenTroops = (simulation: Simulation) => {
	simulation.state.troops = simulation.state.troops.filter((troop) => !troop.dead);
};

export const cloneOf = (simulation: Simulation, troop: Troop) => {
	const { random } = simulation;
	return {
		...troop,
		x: troop.x + random.between(-0.03, 0.03),
		velocityX: troop.velocityX + random.between(-0.15, 0.15),
		velocityZ: troop.velocityZ * random.between(0.95, 1.05),
		animationOffset: random.between(0, Math.PI * 2),
	};
};
