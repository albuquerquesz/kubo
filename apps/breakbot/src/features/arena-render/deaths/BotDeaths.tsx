import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, Vector3 } from "three";
import { subscribeMatchStarts, useMatchEvents } from "#/features/game-session";
import { BOT_VISUAL_SCALE } from "../bot-geometry";
import { scratch, toSceneX, toSceneZ } from "../world";
import {
	type BurstPool,
	burstProgress,
	clearBursts,
	corpseHop,
	corpseScale,
	corpseSpin,
	corpseSquash,
	createBurstPool,
	type DeathBurst,
	flashColor,
	isBurstLive,
	SHARDS_PER_BURST,
	shardColor,
	shardOffset,
	shardScale,
	spawnBurst,
} from "./death-bursts";
import { createCorpseGeometry, createShardGeometry } from "./death-geometry";

type DeathMeshes = {
	corpses: InstancedMesh;
	shards: InstancedMesh;
};

// Metade da altura do corpo do robô: o giro e o achatado acontecem em torno do centro dele.
const CORPSE_CENTER = 0.12 * BOT_VISUAL_SCALE;
const tint = new Color();
const offset = new Vector3();

const placeCorpse = (
	mesh: InstancedMesh,
	burst: Readonly<DeathBurst>,
	progress: number,
	index: number,
) => {
	const scale = corpseScale(progress) * BOT_VISUAL_SCALE;
	scratch.position.set(toSceneX(burst.x), CORPSE_CENTER + corpseHop(progress), toSceneZ(burst.z));
	scratch.rotation.set(0, corpseSpin(progress), 0);
	scratch.scale.set(scale, scale * corpseSquash(progress), scale);
	scratch.updateMatrix();
	mesh.setMatrixAt(index, scratch.matrix);
	mesh.setColorAt(index, flashColor(progress, tint));
};

const placeShards = (
	mesh: InstancedMesh,
	burst: Readonly<DeathBurst>,
	progress: number,
	first: number,
) => {
	for (let shard = 0; shard < SHARDS_PER_BURST; shard++) {
		shardOffset(burst, shard, progress, offset);
		scratch.position.set(toSceneX(burst.x) + offset.x, offset.y, toSceneZ(burst.z) + offset.z);
		scratch.rotation.set(progress * 9, progress * 7, 0);
		scratch.scale.setScalar(shardScale(progress));
		scratch.updateMatrix();
		mesh.setMatrixAt(first + shard, scratch.matrix);
		mesh.setColorAt(first + shard, shardColor(shard));
	}
};

const finish = (mesh: InstancedMesh, count: number) => {
	mesh.count = count;
	mesh.instanceMatrix.needsUpdate = true;
	if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
};

// Só as explosões ainda vivas vão para a tela, compactadas no começo das malhas.
const syncDeaths = (meshes: DeathMeshes, pool: BurstPool, now: number) => {
	let live = 0;
	for (const burst of pool.bursts) {
		const progress = burstProgress(burst, now);
		if (!isBurstLive(progress)) continue;
		placeCorpse(meshes.corpses, burst, progress, live);
		placeShards(meshes.shards, burst, progress, live * SHARDS_PER_BURST);
		live += 1;
	}
	finish(meshes.corpses, live);
	finish(meshes.shards, live * SHARDS_PER_BURST);
};

// Cria a cor por instância antes do primeiro desenho, para o shader já nascer com ela.
const prepareTint = (mesh: InstancedMesh | null) => {
	if (!mesh) return;
	for (let index = 0; index < mesh.count; index++) mesh.setColorAt(index, tint.set(1, 1, 1));
	mesh.count = 0;
};

// Robô derrubado não some seco: acende, pula girando, estoura e solta estilhaços.
export const BotDeaths = () => {
	const corpses = useRef<InstancedMesh>(null);
	const shards = useRef<InstancedMesh>(null);
	const pool = useMemo(createBurstPool, []);
	const corpseGeometry = useMemo(createCorpseGeometry, []);
	const shardGeometry = useMemo(createShardGeometry, []);
	const clock = useThree((state) => state.clock);

	useLayoutEffect(() => {
		prepareTint(corpses.current);
		prepareTint(shards.current);
	}, []);

	useEffect(() => subscribeMatchStarts(() => clearBursts(pool)), [pool]);

	useMatchEvents((event) => {
		if (event.type !== "botKilled") return;
		spawnBurst(pool, event.x, event.z, clock.elapsedTime);
	});

	useFrame(() => {
		if (!corpses.current || !shards.current) return;
		syncDeaths({ corpses: corpses.current, shards: shards.current }, pool, clock.elapsedTime);
	});

	return (
		<>
			<instancedMesh
				ref={corpses}
				args={[corpseGeometry, undefined, pool.capacity]}
				frustumCulled={false}
			>
				<meshBasicMaterial vertexColors toneMapped={false} />
			</instancedMesh>
			<instancedMesh
				ref={shards}
				args={[shardGeometry, undefined, pool.capacity * SHARDS_PER_BURST]}
				frustumCulled={false}
			>
				<meshBasicMaterial vertexColors toneMapped={false} />
			</instancedMesh>
		</>
	);
};
