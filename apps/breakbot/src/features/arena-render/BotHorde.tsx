import { type Bot, defaultBalance } from "@breakbot/game-core";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { InstancedMesh } from "three";
import { readSnapshot } from "#/features/game-session";
import { BOT_VISUAL_SCALE, createBotGeometry, createCrowdBotGeometry } from "./bot-geometry";
import { scratch, toSceneX, toSceneZ } from "./world";

type HordeMeshes = {
	near: InstancedMesh;
	far: InstancedMesh;
};

// Atrás do funil, longe da câmera, o arredondado não faz diferença na tela.
const FAR_FROM_Z = defaultBalance.funnel.wideZ;

// Robôs "brotam" crescendo com um pequeno exagero antes de assentar.
const popScale = (growth: number) => {
	if (growth >= 1) return 1;
	const clamped = Math.max(0, growth);
	return clamped * (1 + Math.sin(clamped * Math.PI) * 0.35);
};

const placeBot = (mesh: InstancedMesh, bot: Readonly<Bot>, index: number, elapsed: number) => {
	const bob = Math.abs(Math.sin(elapsed * 9 + bot.animationOffset)) * 0.025;
	scratch.position.set(toSceneX(bot.x), bob, toSceneZ(bot.z));
	scratch.rotation.set(0, Math.sin(elapsed * 2 + bot.animationOffset) * 0.15, 0);
	scratch.scale.setScalar(popScale(bot.growth) * BOT_VISUAL_SCALE);
	scratch.updateMatrix();
	mesh.setMatrixAt(index, scratch.matrix);
};

const finish = (mesh: InstancedMesh, count: number) => {
	mesh.count = count;
	mesh.instanceMatrix.needsUpdate = true;
};

// Um laço só, sem alocar por frame: cada robô vai para a malha da distância dele.
const syncHorde = (meshes: HordeMeshes, bots: readonly Readonly<Bot>[], elapsed: number) => {
	let near = 0;
	let far = 0;
	for (const bot of bots) {
		if (bot.z < FAR_FROM_Z) {
			placeBot(meshes.near, bot, near, elapsed);
			near += 1;
			continue;
		}
		placeBot(meshes.far, bot, far, elapsed);
		far += 1;
	}
	finish(meshes.near, near);
	finish(meshes.far, far);
};

// Perto do canhão o robô usa o modelo arredondado; a massa atrás do funil, milhares de robôs,
// usa o modelo leve (o arredondado custa milhares de vértices por robô).
export const BotHorde = () => {
	const near = useRef<InstancedMesh>(null);
	const far = useRef<InstancedMesh>(null);
	const roundGeometry = useMemo(createBotGeometry, []);
	const lightGeometry = useMemo(createCrowdBotGeometry, []);

	useFrame(() => {
		if (!near.current || !far.current) return;
		const { bots, elapsed } = readSnapshot();
		syncHorde({ near: near.current, far: far.current }, bots, elapsed);
	});

	return (
		<>
			<instancedMesh
				ref={near}
				args={[roundGeometry, undefined, defaultBalance.botCap]}
				frustumCulled={false}
			>
				<meshStandardMaterial vertexColors roughness={0.55} />
			</instancedMesh>
			<instancedMesh
				ref={far}
				args={[lightGeometry, undefined, defaultBalance.botCap]}
				frustumCulled={false}
			>
				<meshStandardMaterial vertexColors roughness={0.55} />
			</instancedMesh>
		</>
	);
};
