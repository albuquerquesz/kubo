import { laneBounds, WALL_DEPTH, type Wall } from "@breakbot/game-core";
import fontUrl from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-800-normal.woff?url";
import { Edges, RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ComponentRef, useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { readSnapshot } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { DEPTH_SCALE, rampLift, sceneCenterX, sceneWidth, toSceneZ } from "../world";

const WIDTH = sceneWidth(laneBounds.side) - 0.2;
const HEIGHT = 0.7;
const DEPTH = WALL_DEPTH * DEPTH_SCALE;
const FLASH_DECAY = 6;

type WallSlot = {
	index: number;
};

type WallLook = {
	block: Group;
	label: ComponentRef<typeof Text>;
	material: MeshStandardMaterial;
};

const showWall = (look: WallLook, wall: Readonly<Wall>, lastHealth: number) => {
	look.block.visible = true;
	// Parada no deck da rampa esquerda, na altura dele.
	look.block.position.y = rampLift("side", wall.z) + HEIGHT / 2;
	look.block.position.z = toSceneZ(wall.z);
	if (wall.health === lastHealth) return;
	look.label.text = String(Math.max(0, wall.health));
	look.label.sync();
	look.material.emissiveIntensity = 0.9;
};

// Um bloco do pool: segue a parede de mesmo índice no snapshot, ou some se ela não existir.
export const WallBlock = ({ index }: WallSlot) => {
	const block = useRef<Group>(null);
	const label = useRef<ComponentRef<typeof Text>>(null);
	const material = useRef<MeshStandardMaterial>(null);
	const lastHealth = useRef(0);

	useFrame((_, delta) => {
		if (!block.current || !label.current || !material.current) return;
		const look = { block: block.current, label: label.current, material: material.current };
		material.current.emissiveIntensity = Math.max(
			0.15,
			material.current.emissiveIntensity - delta * FLASH_DECAY,
		);
		const wall = readSnapshot().walls[index];
		block.current.visible = false;
		if (!wall) return;
		showWall(look, wall, lastHealth.current);
		lastHealth.current = wall.health;
	});

	return (
		<group ref={block} position={[sceneCenterX(laneBounds.side), HEIGHT / 2, 0]} visible={false}>
			<RoundedBox args={[WIDTH, HEIGHT, DEPTH]} radius={0.06}>
				<meshStandardMaterial
					ref={material}
					color={palette.sky}
					emissive={palette.bright}
					emissiveIntensity={0.15}
					roughness={0.35}
				/>
				<Edges color={palette.skyDeep} threshold={30} />
			</RoundedBox>
			<mesh position={[0, -HEIGHT / 2 + 0.06, DEPTH / 2 + 0.002]}>
				<planeGeometry args={[WIDTH - 0.08, 0.1]} />
				<meshBasicMaterial color={palette.skyDeep} />
			</mesh>
			<Text
				ref={label}
				font={fontUrl}
				position={[0, 0.02, DEPTH / 2 + 0.01]}
				fontSize={0.42}
				color={palette.bright}
				outlineWidth={0.03}
				outlineColor={palette.skyDeep}
			>
				0
			</Text>
		</group>
	);
};
