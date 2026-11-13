import type { InputFrame } from "@breakbot/game-core";
import { create } from "zustand";
import type { InputKind } from "#/shared/telemetry";

type ControlState = {
	pointerFiring: boolean;
	keyFiring: boolean;
	leftHeld: boolean;
	rightHeld: boolean;
	aimDelta: number;
};

type PressedStore = {
	pressed: boolean;
	presses: number;
	lastKind: InputKind | null;
};

const idleControls = () => ({
	pointerFiring: false,
	keyFiring: false,
	leftHeld: false,
	rightHeld: false,
	aimDelta: 0,
});

// Parâmetro tipado alarga os literais `false` para `boolean` sem precisar de anotação.
const asControlState = (state: ControlState) => state;

// Estado mutável lido a cada frame pelo loop; não passa pelo React.
export const controls = asControlState(idleControls());

const idlePresses = { pressed: false, presses: 0, lastKind: null } satisfies PressedStore;

export const usePressedStore = create<PressedStore>()(() => idlePresses);

export const markPressed = (kind: InputKind) =>
	usePressedStore.setState((store) => ({
		pressed: true,
		presses: store.presses + 1,
		lastKind: kind,
	}));

const aimAxisOf = (state: ControlState) => {
	if (state.leftHeld === state.rightHeld) return 0;
	return state.leftHeld ? -1 : 1;
};

export const consumeInputFrame = () => {
	const frame = {
		firing: controls.pointerFiring || controls.keyFiring,
		aimDelta: controls.aimDelta,
		aimAxis: aimAxisOf(controls),
	} satisfies InputFrame;
	controls.aimDelta = 0;
	return frame;
};

export const releaseControls = () => {
	Object.assign(controls, idleControls());
};
