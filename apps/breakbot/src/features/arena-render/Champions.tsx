import type { Troop } from "@breakbot/game-core";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, type Group } from "three";
import { readSnapshot } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { rampLift, toSceneX, toSceneZ, UNIT_SCALE } from "./world";

// O corpo do gigante aliado sai do TroopSwarm (escala pelo raio); aqui só o brilho e os orbitais.
const SLOTS = Array.from({ length: 6 }, (_, index) => index);
const AURA_SCALE = 2.6;
const ORBIT_SPEED = 4;
const PULSE_SPEED = 9;
const ORBITALS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

type ChampionSlot = {
	index: number;
};

// Reaproveitado a cada frame: os gigantes aliados vivos, na ordem da tropa.
const champions = new Array<Readonly<Troop>>();

const gatherChampions = (troops: readonly Readonly<Troop>[]) => {
	champions.length = 0;
	for (const troop of troops) {
		if (troop.champion && champions.length < SLOTS.length) champions.push(troop);
	}
};

const placeAura = (rig: Group, champion: Readonly<Troop>, elapsed: number) => {
	const size = champion.radius * UNIT_SCALE * AURA_SCALE;
	rig.visible = true;
	const lift = rampLift(champion.lane, champion.z);
	rig.position.set(toSceneX(champion.x), lift + size * 0.6, toSceneZ(champion.z));
	rig.rotation.y = elapsed * ORBIT_SPEED + champion.animationOffset;
	rig.scale.setScalar(size * (1 + Math.sin(elapsed * PULSE_SPEED) * 0.06));
};

const ChampionGlow = ({ index }: ChampionSlot) => {
	const rig = useRef<Group>(null);

	useFrame(() => {
		if (!rig.current) return;
		const champion = champions[index];
		rig.current.visible = false;
		if (!champion) return;
		placeAura(rig.current, champion, readSnapshot().elapsed);
	});

	return (
		<group ref={rig} visible={false}>
			<mesh>
				<sphereGeometry args={[1, 24, 16]} />
				<meshBasicMaterial
					color={palette.warn}
					transparent
					opacity={0.5}
					blending={AdditiveBlending}
					depthWrite={false}
					toneMapped={false}
				/>
			</mesh>
			{ORBITALS.map((angle) => (
				<mesh key={angle} position={[Math.cos(angle) * 1.1, 0.2, Math.sin(angle) * 1.1]}>
					<sphereGeometry args={[0.16, 12, 8]} />
					<meshBasicMaterial color={palette.warn} toneMapped={false} />
				</mesh>
			))}
		</group>
	);
};

export const Champions = () => {
	useFrame(() => gatherChampions(readSnapshot().troops), -1);
	return SLOTS.map((index) => <ChampionGlow key={index} index={index} />);
};
