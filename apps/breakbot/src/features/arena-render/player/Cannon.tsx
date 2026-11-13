import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { readSnapshot } from "#/features/game-session";
import { CANNON_SCENE_Z, toSceneX } from "../world";
import { CannonModel, MUZZLE_REACH, showRecoil } from "./CannonModel";

// Escala ajustada para o canhão ocupar ~1/4 da faixa, como na referência.
export const CANNON_SCALE = 0.62;
export const MUZZLE_AHEAD = MUZZLE_REACH * CANNON_SCALE;

export const Cannon = () => {
	const rig = useRef<Group>(null);
	const barrel = useRef<Group>(null);
	const flash = useRef<Mesh>(null);

	useFrame(() => {
		if (!rig.current) return;
		const { cannon } = readSnapshot();
		rig.current.position.x = toSceneX(cannon.x);
		showRecoil({ barrel, flash }, cannon.recoil);
	});

	return (
		<group ref={rig} position-z={CANNON_SCENE_Z} scale={CANNON_SCALE}>
			<CannonModel barrel={barrel} flash={flash} />
		</group>
	);
};
