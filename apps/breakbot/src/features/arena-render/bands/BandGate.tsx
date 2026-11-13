import { type Band, laneBounds } from "@breakbot/game-core";
import fontUrl from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-800-normal.woff?url";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ComponentRef, useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { readSnapshot, useMatchEvents } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { sceneCenterX, sceneWidth, toSceneZ } from "../world";

// Fecha o corredor de muro a muro, parada.
const WIDTH = sceneWidth(laneBounds.main);
const CENTER_X = sceneCenterX(laneBounds.main);
const HEIGHT = 1.1;
const PANEL_DEPTH = 0.06;
const POST_RADIUS = 0.05;
const RESTING_GLOW = 0.35;
const FLASH_DECAY = 5;

type BandSlot = {
	index: number;
};

type BandLook = {
	gate: Group;
	label: ComponentRef<typeof Text>;
};

const labelFor = (band: Readonly<Band>) => `×${band.multiplier}`;

const showBand = (look: BandLook, band: Readonly<Band>) => {
	look.gate.visible = true;
	look.gate.position.set(CENTER_X, 0, toSceneZ(band.z));
	const text = labelFor(band);
	if (look.label.text === text) return;
	look.label.text = text;
	look.label.sync();
};

// Painel roxo translúcido com "×N" de muro a muro no corredor; pisca quando multiplica.
export const BandGate = ({ index }: BandSlot) => {
	const gate = useRef<Group>(null);
	const label = useRef<ComponentRef<typeof Text>>(null);
	const panel = useRef<MeshStandardMaterial>(null);

	useMatchEvents((event) => {
		if (event.type !== "bandCrossed" || event.band !== index || !panel.current) return;
		panel.current.emissiveIntensity = 1.1;
	});

	useFrame((_, delta) => {
		if (!gate.current || !label.current || !panel.current) return;
		panel.current.emissiveIntensity = Math.max(
			RESTING_GLOW,
			panel.current.emissiveIntensity - delta * FLASH_DECAY,
		);
		const band = readSnapshot().bands[index];
		gate.current.visible = false;
		if (!band) return;
		showBand({ gate: gate.current, label: label.current }, band);
	});

	return (
		<group ref={gate} visible={false}>
			<mesh position-y={HEIGHT / 2}>
				<boxGeometry args={[WIDTH, HEIGHT, PANEL_DEPTH]} />
				<meshStandardMaterial
					ref={panel}
					color={palette.grape}
					emissive={palette.grape}
					emissiveIntensity={RESTING_GLOW}
					transparent
					opacity={0.55}
					roughness={0.3}
					depthWrite={false}
				/>
			</mesh>
			{[-1, 1].map((side) => (
				<mesh key={side} position={[(side * WIDTH) / 2, HEIGHT / 2 + 0.05, 0]}>
					<boxGeometry args={[POST_RADIUS * 2, HEIGHT + 0.1, POST_RADIUS * 2]} />
					<meshStandardMaterial color={palette.grapeDeep} roughness={0.5} />
				</mesh>
			))}
			<Text
				ref={label}
				font={fontUrl}
				position={[0, HEIGHT / 2, PANEL_DEPTH / 2 + 0.01]}
				fontSize={0.78}
				color={palette.bright}
				outlineWidth={0.05}
				outlineColor={palette.grapeDeep}
			>
				×
			</Text>
		</group>
	);
};
