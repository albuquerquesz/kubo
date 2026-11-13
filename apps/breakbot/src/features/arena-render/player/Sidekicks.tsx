import { defaultBalance, type Sidekick, sidekickBack, sidekickX } from "@breakbot/game-core";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { readSnapshot } from "#/features/game-session";
import { CANNON_SCENE_Z, DEPTH_SCALE, toSceneX } from "../world";
import { CANNON_SCALE } from "./Cannon";
import { CannonModel, showRecoil } from "./CannonModel";

const SIDEKICK_SCALE = CANNON_SCALE * 0.78;
// Um pouco atrás do canhão, para os dois não se sobreporem na câmera.
const SIDEKICK_SCENE_Z = CANNON_SCENE_Z + 0.25;
const POP_SPEED = 5;
const SLOTS = Array.from({ length: defaultBalance.maxSidekicks }, (_, slot) => slot);

type SidekickSlot = {
	slot: number;
};

// Cresce com um pequeno exagero ao chegar, como os robôs brotando.
const popScale = (growth: number) => growth * (1 + Math.sin(growth * Math.PI) * 0.35);

const place = (rig: Group, sidekick: Readonly<Sidekick>, cannonX: number, growth: number) => {
	rig.visible = true;
	rig.position.x = toSceneX(sidekickX(cannonX, sidekick.slot));
	rig.position.z = SIDEKICK_SCENE_Z + sidekickBack(sidekick.slot) * DEPTH_SCALE;
	rig.scale.setScalar(SIDEKICK_SCALE * popScale(growth));
};

const findSidekick = (sidekicks: readonly Readonly<Sidekick>[], slot: number) =>
	sidekicks.find((sidekick) => sidekick.slot === slot);

// Um modelo por slot da formação: aparece quando o slot ganha um mini-canhão.
const SidekickCannon = ({ slot }: SidekickSlot) => {
	const rig = useRef<Group>(null);
	const barrel = useRef<Group>(null);
	const flash = useRef<Mesh>(null);
	const growth = useRef(0);

	useFrame((_, delta) => {
		if (!rig.current) return;
		const { cannon, sidekicks } = readSnapshot();
		const sidekick = findSidekick(sidekicks, slot);
		rig.current.visible = false;
		if (!sidekick) {
			growth.current = 0;
			return;
		}
		growth.current = Math.min(1, growth.current + delta * POP_SPEED);
		place(rig.current, sidekick, cannon.x, growth.current);
		showRecoil({ barrel, flash }, sidekick.recoil);
	});

	return (
		<group ref={rig} position-z={SIDEKICK_SCENE_Z} visible={false}>
			<CannonModel barrel={barrel} flash={flash} />
		</group>
	);
};

export const Sidekicks = () => (
	<>
		{SLOTS.map((slot) => (
			<SidekickCannon key={slot} slot={slot} />
		))}
	</>
);
