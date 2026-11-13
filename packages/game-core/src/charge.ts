import type { Simulation } from "./simulation";

// Carga do gigante aliado. Só o tiro do canhão principal conta: o mini-canhão não enche a barra.
export const chargeUp = (simulation: Simulation) => {
	const { balance, state } = simulation;
	state.charge = Math.min(balance.chargeCapacity, state.charge + 1);
};

export const isCharged = (simulation: Simulation) =>
	simulation.state.charge >= simulation.balance.chargeCapacity;

export const spendCharge = (simulation: Simulation) => {
	simulation.state.charge = 0;
};
