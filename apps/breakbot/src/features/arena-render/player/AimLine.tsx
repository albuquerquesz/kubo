import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ComponentRef, useRef } from "react";
import type { Group } from "three";
import { readSnapshot } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { CANNON_SCENE_Z, TOWER_SCENE_Z, toSceneX } from "../world";
import { MUZZLE_AHEAD } from "./Cannon";

const AIM_DASH_SPEED = 3;

export const AimLine = () => {
	const rig = useRef<Group>(null);
	const line = useRef<ComponentRef<typeof Line>>(null);

	useFrame(() => {
		const { cannon, elapsed } = readSnapshot();
		rig.current?.position.setX(toSceneX(cannon.x));
		if (line.current) line.current.material.dashOffset = -elapsed * AIM_DASH_SPEED;
	});

	return (
		<group ref={rig}>
			<Line
				ref={line}
				points={[
					[0, 0.02, CANNON_SCENE_Z - MUZZLE_AHEAD],
					[0, 0.02, TOWER_SCENE_Z],
				]}
				color={palette.go}
				transparent
				opacity={0.3}
				lineWidth={1}
				dashed
				dashSize={0.25}
				gapSize={0.4}
			/>
		</group>
	);
};
