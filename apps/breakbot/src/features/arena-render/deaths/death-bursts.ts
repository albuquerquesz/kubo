import { Color, type Vector3 } from "three";
import { palette } from "#/shared/palette";

// Morte de robô, só no render: clarão, pulinho girando, estouro e estilhaços em leque.
export const BURST_DURATION = 0.45;
export const SHARDS_PER_BURST = 6;
// Com a horda grande morrem dezenas de robôs por segundo: ao lotar, a explosão mais velha cede.
const BURST_CAPACITY = 256;

const HOP_HEIGHT = 0.45;
const SPIN_TURNS = 2.5;
const SWELL = 0.35;
const SQUASH = 0.4;
const WHITE_SHARE = 0.15;
const SHARD_START_HEIGHT = 0.2;
const SHARD_LAUNCH = 1.4;
const SHARD_GRAVITY = 1.6;
const SHARD_REACH = 0.9;
// Ângulo de ouro: cada explosão gira o leque, sem sortear nada.
const GOLDEN_ANGLE = 2.399;

const FLASH = new Color(palette.bright);
const HEAT = new Color(palette.warn);
const EMBER = new Color(palette.alert);

export type DeathBurst = {
	x: number;
	z: number;
	bornAt: number;
	seed: number;
};

export const createBurstPool = (capacity = BURST_CAPACITY) => ({
	bursts: new Array<DeathBurst>(),
	spawned: 0,
	capacity,
});

export type BurstPool = ReturnType<typeof createBurstPool>;

export const spawnBurst = (pool: BurstPool, x: number, z: number, now: number) => {
	const burst = { x, z, bornAt: now, seed: pool.spawned };
	const slot = pool.spawned % pool.capacity;
	pool.spawned += 1;
	if (pool.bursts.length < pool.capacity) {
		pool.bursts.push(burst);
		return;
	}
	pool.bursts[slot] = burst;
};

export const clearBursts = (pool: BurstPool) => {
	pool.bursts.length = 0;
	pool.spawned = 0;
};

// 0 no instante do abate, 1 quando a explosão termina.
export const burstProgress = (burst: Readonly<DeathBurst>, now: number) =>
	(now - burst.bornAt) / BURST_DURATION;

export const isBurstLive = (progress: number) => progress >= 0 && progress < 1;

// Infla um pouco no começo e encolhe até sumir.
export const corpseScale = (progress: number) =>
	(1 + SWELL * Math.sin(progress * Math.PI)) * (1 - progress * progress);

// Achata no golpe e volta, como borracha.
export const corpseSquash = (progress: number) =>
	1 - SQUASH * Math.sin(Math.min(1, progress * 2) * Math.PI);

export const corpseHop = (progress: number) => HOP_HEIGHT * Math.sin(progress * Math.PI);

export const corpseSpin = (progress: number) => progress * SPIN_TURNS;

// Branco no golpe, amarelo logo depois, vermelho brasa no fim.
export const flashColor = (progress: number, target: Color) => {
	if (progress < WHITE_SHARE) return target.copy(FLASH).lerp(HEAT, progress / WHITE_SHARE);
	return target.copy(HEAT).lerp(EMBER, (progress - WHITE_SHARE) / (1 - WHITE_SHARE));
};

export const shardColor = (shardIndex: number) => (shardIndex % 2 === 0 ? HEAT : EMBER);

// Deslocamento do estilhaço a partir do robô, em unidades da cena: leque, subida e queda.
export const shardOffset = (
	burst: Readonly<DeathBurst>,
	shardIndex: number,
	progress: number,
	target: Vector3,
) => {
	const angle = (shardIndex / SHARDS_PER_BURST) * Math.PI * 2 + burst.seed * GOLDEN_ANGLE;
	const speed = 0.8 + ((burst.seed * 7 + shardIndex * 3) % 5) * 0.1;
	const reach = SHARD_REACH * speed * progress;
	const height = SHARD_START_HEIGHT + SHARD_LAUNCH * progress - SHARD_GRAVITY * progress * progress;
	return target.set(Math.cos(angle) * reach, height, Math.sin(angle) * reach);
};

export const shardScale = (progress: number) => 1 - progress;
