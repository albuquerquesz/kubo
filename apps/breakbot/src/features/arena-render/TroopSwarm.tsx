import { defaultBalance, type Troop } from "@breakbot/game-core";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh } from "three";
import { readSnapshot } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { syncInstances } from "./sync-instances";
import { createTroopGeometry } from "./troop-geometry";
import { rampLift, scratch, toSceneX, toSceneZ, UNIT_SCALE } from "./world";

// O boneco foi modelado para o raio padrão da tropa; unidades maiores escalam a partir dele.
// A escala visual exagera o boneco além do raio de colisão para ele ler bem na câmera baixa.
const MODEL_RADIUS = 0.12;
const VISUAL_SCALE = 2.4;
const STRIDE_SPEED = 14;
const FORWARD_LEAN = 0.12;
// Destaque de multiplicação: o boneco dá um pulinho e fica roxo, sem mudar de tamanho.
// A cor por instância multiplica as cores do modelo; acima de 1 ela puxa o verde para lilás.
const BOOST_HOP = 0.35;
const RESTING_TINT = new Color(1, 1, 1);
const BOOST_TINT = new Color(3.4, 0.55, 4);
const tint = new Color();

// 1 no instante da multiplicação, 0 quando o destaque acaba; o seno faz subir e voltar.
const boostWave = (troop: Readonly<Troop>) =>
	Math.sin(Math.PI * Math.min(1, troop.boost / defaultBalance.multiplyBoost));

const paintTroop = (mesh: InstancedMesh, troop: Readonly<Troop>, index: number) => {
	const fade = Math.min(1, troop.boost / defaultBalance.multiplyBoost);
	tint.copy(RESTING_TINT).lerp(BOOST_TINT, fade);
	mesh.setColorAt(index, tint);
};

const placeTroop = (
	mesh: InstancedMesh,
	troop: Readonly<Troop>,
	index: number,
	elapsed: number,
) => {
	const stride = elapsed * STRIDE_SPEED + troop.animationOffset;
	const wave = boostWave(troop);
	const scale = ((troop.radius * UNIT_SCALE) / MODEL_RADIUS) * VISUAL_SCALE;
	scratch.position.set(
		toSceneX(troop.x),
		rampLift(troop.lane, troop.z) + Math.abs(Math.sin(stride)) * 0.04 * scale + wave * BOOST_HOP,
		toSceneZ(troop.z),
	);
	scratch.rotation.set(-FORWARD_LEAN, -troop.velocityX * 0.6, Math.sin(stride) * 0.1);
	scratch.scale.setScalar(scale);
	scratch.updateMatrix();
	mesh.setMatrixAt(index, scratch.matrix);
	paintTroop(mesh, troop, index);
};

// Cria a cor por instância antes do primeiro desenho, para o shader já nascer com ela.
const prepareTint = (mesh: InstancedMesh | null) => {
	if (!mesh) return;
	for (let index = 0; index < mesh.count; index++) mesh.setColorAt(index, RESTING_TINT);
};

export const TroopSwarm = () => {
	const mesh = useRef<InstancedMesh>(null);
	const geometry = useMemo(createTroopGeometry, []);

	useLayoutEffect(() => prepareTint(mesh.current), []);

	useFrame(() => {
		const { troops, elapsed } = readSnapshot();
		syncInstances(mesh.current, troops, elapsed, placeTroop);
	});

	return (
		<instancedMesh
			ref={mesh}
			args={[geometry, undefined, defaultBalance.troopCap]}
			frustumCulled={false}
		>
			<meshStandardMaterial
				vertexColors
				emissive={palette.go}
				emissiveIntensity={0.15}
				roughness={0.45}
			/>
		</instancedMesh>
	);
};
