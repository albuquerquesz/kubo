import { Color, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { palette } from "#/shared/palette";
import {
	BURST_DURATION,
	burstProgress,
	clearBursts,
	corpseScale,
	createBurstPool,
	flashColor,
	isBurstLive,
	SHARDS_PER_BURST,
	shardOffset,
	spawnBurst,
} from "./death-bursts";

describe("explosão de robô derrubado", () => {
	it("com o pool cheio, a explosão nova toma o lugar da mais velha", () => {
		const pool = createBurstPool(2);
		spawnBurst(pool, 0.1, 5, 0);
		spawnBurst(pool, 0.2, 6, 0.1);
		spawnBurst(pool, 0.3, 7, 0.2);
		expect(pool.bursts).toHaveLength(2);
		expect(pool.bursts.map((burst) => burst.x)).toEqual([0.3, 0.2]);
	});

	it("começa no abate e acaba depois da duração", () => {
		const pool = createBurstPool();
		spawnBurst(pool, 0, 5, 10);
		const [burst] = pool.bursts;
		if (!burst) throw new Error("explosão não criada");
		expect(burstProgress(burst, 10)).toBe(0);
		expect(isBurstLive(burstProgress(burst, 10 + BURST_DURATION / 2))).toBe(true);
		expect(isBurstLive(burstProgress(burst, 10 + BURST_DURATION + 0.01))).toBe(false);
	});

	it("partida nova começa sem explosões", () => {
		const pool = createBurstPool();
		spawnBurst(pool, 0, 5, 0);
		clearBursts(pool);
		expect(pool.bursts).toHaveLength(0);
	});

	it("o corpo acende branco no golpe e some no fim", () => {
		expect(flashColor(0, new Color()).getHexString()).toBe(
			new Color(palette.bright).getHexString(),
		);
		expect(flashColor(0.99, new Color()).r).toBeGreaterThan(flashColor(0.99, new Color()).g);
		expect(corpseScale(0)).toBe(1);
		expect(corpseScale(1)).toBeCloseTo(0);
	});

	it("os estilhaços se espalham para os lados e caem no chão", () => {
		const pool = createBurstPool();
		spawnBurst(pool, 0, 5, 0);
		const [burst] = pool.bursts;
		if (!burst) throw new Error("explosão não criada");
		const directions = new Set<string>();
		for (let shard = 0; shard < SHARDS_PER_BURST; shard++) {
			const middle = shardOffset(burst, shard, 0.4, new Vector3());
			const end = shardOffset(burst, shard, 1, new Vector3());
			expect(Math.hypot(end.x, end.z)).toBeGreaterThan(Math.hypot(middle.x, middle.z));
			expect(end.y).toBeLessThan(middle.y);
			expect(end.y).toBeGreaterThanOrEqual(-0.001);
			directions.add(`${Math.sign(end.x)},${Math.sign(end.z)}`);
		}
		expect(directions.size).toBeGreaterThan(2);
	});
});
