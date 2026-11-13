import { chargeUp } from "./charge";
import { operateSidekicks } from "./sidekicks";
import { isAttract, type Simulation } from "./simulation";
import { cannonBounds, clamp } from "./track";
import { spawnTroop } from "./troops";

export type AimAxis = -1 | 0 | 1;

export type InputFrame = {
	firing: boolean;
	aimDelta: number;
	aimAxis: AimAxis;
};

const RECOIL_RECOVERY = 10;
const ATTRACT_SWEEP_SPEED = 0.7;
const ATTRACT_SWEEP_WIDTH = 0.75;

export const idleInput = {
	firing: false,
	aimDelta: 0,
	aimAxis: 0,
} satisfies InputFrame;

// Mira não finita (ex.: arraste numa superfície de largura zero) nunca corrompe o canhão.
export const nudgeCannon = (simulation: Simulation, delta: number) => {
	if (!Number.isFinite(delta)) return;
	const { cannon } = simulation.state;
	cannon.x = clamp(cannon.x + delta, cannonBounds);
};

const aim = (simulation: Simulation, input: InputFrame, seconds: number) => {
	const { balance, state } = simulation;
	if (isAttract(state)) {
		state.cannon.x = Math.sin(state.elapsed * ATTRACT_SWEEP_SPEED) * ATTRACT_SWEEP_WIDTH;
		return;
	}
	nudgeCannon(simulation, input.aimAxis * balance.cannonSpeed * seconds);
};

const isTriggerHeld = (simulation: Simulation, input: InputFrame) =>
	isAttract(simulation.state) || input.firing;

const fire = (simulation: Simulation) => {
	const { balance, state } = simulation;
	state.fireCooldown += balance.fireInterval;
	state.cannon.recoil = 1;
	state.shots += 1;
	chargeUp(simulation);
	simulation.events.push({ type: "shot", x: state.cannon.x });
	spawnTroop(simulation, state.cannon.x);
};

export const operateCannon = (simulation: Simulation, input: InputFrame, seconds: number) => {
	const { state } = simulation;
	aim(simulation, input, seconds);
	state.cannon.recoil = Math.max(0, state.cannon.recoil - seconds * RECOIL_RECOVERY);
	state.fireCooldown -= seconds;
	const firing = isTriggerHeld(simulation, input);
	operateSidekicks(simulation, firing, seconds);
	if (!firing) {
		state.fireCooldown = Math.max(0, state.fireCooldown);
		return;
	}
	if (state.fireCooldown > 0) return;
	fire(simulation);
};
