import type { Band, Troop } from "./entities";
import type { Simulation } from "./simulation";
import { cloneOf } from "./troops";

// A faixa fecha o corredor de muro a muro: todo boneco do corredor passa por ela. Igual às
// placas, o gigante aliado não multiplica.
const multipliesAt = (troop: Troop) => !troop.champion && troop.lane === "main";

// Posições do leque, simétricas em volta do boneco: 2 → [-0.5, 0.5], 3 → [-1, 0, 1].
const fanSlots = (size: number) => Array.from({ length: size }, (_, slot) => slot - (size - 1) / 2);

// Original e clones se abrem em leque e ganham o destaque, para a multiplicação ficar visível.
const spreadFan = (simulation: Simulation, troop: Troop, clones: number) => {
	const { balance, state } = simulation;
	if (clones === 0) return;
	const slots = fanSlots(clones + 1);
	const middle = Math.floor(clones / 2);
	const baseVelocity = troop.velocityX;
	troop.boost = balance.multiplyBoost;
	troop.velocityX = baseVelocity + (slots[middle] ?? 0) * balance.cloneSpread;
	for (const [slot, offset] of slots.entries()) {
		if (slot === middle) continue;
		const clone = cloneOf(simulation, troop);
		clone.velocityX = baseVelocity + offset * balance.cloneSpread;
		state.troops.push(clone);
	}
};

const multiply = (simulation: Simulation, troop: Troop, index: number, band: Band) => {
	const { balance, state } = simulation;
	const room = Math.max(0, balance.troopCap - state.troops.length);
	const clones = Math.min(band.multiplier - 1, room);
	spreadFan(simulation, troop, clones);
	simulation.events.push({
		type: "bandCrossed",
		band: index,
		multiplier: band.multiplier,
		clones,
		x: troop.x,
		z: band.z,
	});
};

const crossNextBand = (simulation: Simulation, troop: Troop, band: Band) => {
	const index = troop.nextBand;
	// Avança antes de clonar: os clones herdam o índice e não disparam a mesma faixa.
	troop.nextBand += 1;
	if (!multipliesAt(troop)) return;
	multiply(simulation, troop, index, band);
};

const crossReachedBands = (simulation: Simulation, troop: Troop | undefined) => {
	if (!troop || troop.dead) return;
	const { bands } = simulation.state;
	for (let band = bands[troop.nextBand]; band && troop.z >= band.z; band = bands[troop.nextBand]) {
		crossNextBand(simulation, troop, band);
	}
};

export const crossBands = (simulation: Simulation) => {
	const { troops } = simulation.state;
	// Clones entram no fim da lista e já estão além da faixa: só os originais do tick são checados.
	const total = troops.length;
	for (let index = 0; index < total; index++) crossReachedBands(simulation, troops[index]);
};
