import { RoundedBox } from "@react-three/drei";
import type { RefObject } from "react";
import type { Group, Mesh } from "three";
import { palette } from "#/shared/palette";

// Canhão verde de costas para a câmera: esfera assentada entre quatro rodas pretas de cubo
// branco, encostadas no corpo, e cano de boca alargada apontando pista adentro.
// Usado pelo canhão do jogador e pelos mini-canhões, cada um com sua escala.
const BODY_RADIUS = 0.42;
const WHEEL_RADIUS = 0.3;
const WHEEL_WIDTH = 0.22;
const HUB_RADIUS = 0.14;
const CAP_RADIUS = 0.05;
const WHEEL_X = 0.48;
const WHEEL_Z = 0.34;
const BODY_Y = WHEEL_RADIUS + 0.3;
const BARREL_LENGTH = 0.95;
const MUZZLE_LENGTH = 0.18;
const MUZZLE_MODEL_Z = -(BODY_RADIUS + BARREL_LENGTH);
// Distância do centro do canhão até a boca do cano, em unidades de modelo.
export const MUZZLE_REACH = BODY_RADIUS + BARREL_LENGTH;
const RECOIL_DISTANCE = 0.14;

type WheelPlacement = {
	x: number;
	z: number;
};

const wheelPlacements = [
	{ x: -WHEEL_X, z: -WHEEL_Z },
	{ x: WHEEL_X, z: -WHEEL_Z },
	{ x: -WHEEL_X, z: WHEEL_Z },
	{ x: WHEEL_X, z: WHEEL_Z },
] satisfies WheelPlacement[];

// Roda parada, com o eixo em x: pneu preto, aro branco saliente e tampa central escura.
const Wheel = ({ x, z }: WheelPlacement) => (
	<group position={[x, WHEEL_RADIUS, z]} rotation-z={Math.PI / 2}>
		<mesh>
			<cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 24]} />
			<meshStandardMaterial color={palette.tire} roughness={0.9} />
		</mesh>
		<mesh>
			<cylinderGeometry args={[HUB_RADIUS, HUB_RADIUS, WHEEL_WIDTH + 0.04, 18]} />
			<meshStandardMaterial color={palette.bright} roughness={0.3} />
		</mesh>
		<mesh>
			<cylinderGeometry args={[CAP_RADIUS, CAP_RADIUS, WHEEL_WIDTH + 0.06, 12]} />
			<meshStandardMaterial color={palette.line} roughness={0.5} />
		</mesh>
	</group>
);

const Barrel = () => (
	<>
		<mesh position={[0, BODY_Y, -BODY_RADIUS - BARREL_LENGTH / 2 + 0.2]} rotation-x={Math.PI / 2}>
			<cylinderGeometry args={[0.18, 0.145, BARREL_LENGTH, 18]} />
			<meshStandardMaterial color={palette.goEdge} roughness={0.5} />
		</mesh>
		<mesh position={[0, BODY_Y, MUZZLE_MODEL_Z + MUZZLE_LENGTH / 2]} rotation-x={Math.PI / 2}>
			<cylinderGeometry args={[0.225, 0.225, MUZZLE_LENGTH, 18]} />
			<meshStandardMaterial color={palette.goDeep} roughness={0.5} />
		</mesh>
		<mesh position={[0, BODY_Y, MUZZLE_MODEL_Z]}>
			<torusGeometry args={[0.21, 0.026, 8, 24]} />
			<meshStandardMaterial color={palette.goLight} roughness={0.4} />
		</mesh>
	</>
);

export type CannonParts = {
	barrel: RefObject<Group | null>;
	flash: RefObject<Mesh | null>;
};

// Recuo do cano e clarão na boca a partir do recoil (1 no disparo, decai até 0).
export const showRecoil = ({ barrel, flash }: CannonParts, recoil: number) => {
	if (!barrel.current || !flash.current) return;
	barrel.current.position.z = recoil * RECOIL_DISTANCE;
	flash.current.visible = recoil > 0.3;
	flash.current.scale.setScalar(0.6 + recoil);
};

export const CannonModel = ({ barrel, flash }: CannonParts) => (
	<>
		<RoundedBox args={[0.84, 0.12, 0.76]} radius={0.04} position-y={WHEEL_RADIUS}>
			<meshStandardMaterial color={palette.ink} roughness={0.7} />
		</RoundedBox>
		{wheelPlacements.map((wheel) => (
			<Wheel key={`${wheel.x}:${wheel.z}`} {...wheel} />
		))}
		<mesh position-y={BODY_Y}>
			<sphereGeometry args={[BODY_RADIUS, 28, 20]} />
			<meshStandardMaterial color={palette.go} roughness={0.35} metalness={0.1} />
		</mesh>
		<group ref={barrel}>
			<Barrel />
			<mesh ref={flash} position={[0, BODY_Y, MUZZLE_MODEL_Z - 0.08]} visible={false}>
				<sphereGeometry args={[0.172, 10, 10]} />
				<meshBasicMaterial color={palette.warn} transparent opacity={0.85} toneMapped={false} />
			</mesh>
		</group>
	</>
);
