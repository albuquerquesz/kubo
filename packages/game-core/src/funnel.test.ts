import { describe, expect, it } from "vitest";
import {
	CORRIDOR_CENTER,
	defaultBalance,
	FIXED_STEP,
	funnelBoundsAt,
	hordeBounds,
	idleInput,
	laneBounds,
	laneFor,
	type Match,
	rampWalls,
	TRACK_LENGTH,
} from "./index";
import { countOf, holdFire, quietWaves, run, startPlaying, withWaves } from "./test-support";

const { funnel } = defaultBalance;
// Folga do sorteio de posição da formação.
const SPAWN_JITTER = 0.02;
const SWAY_ROOM = 0.03;
// Faixa junto de cada cerca onde a horda não pode se acumular.
const EDGE_ROOM = 0.03;

// Sem faixas e sem estátuas no caminho: só o funil e as rampas agem sobre a tropa.
const funnelOnly = {
	...withWaves(quietWaves, 100),
	bandLayout: [],
	statueZ: 999,
	sideStatueZ: 999,
};

const aimAt = (match: Match, x: number) =>
	run(match, FIXED_STEP, { ...idleInput, aimDelta: x - match.snapshot().cannon.x });

const fireOnce = (match: Match, x: number) => {
	aimAt(match, x);
	run(match, FIXED_STEP, holdFire);
};

describe("funil de barricadas", () => {
	it("deixa a área inteira da horda livre atrás das barricadas", () => {
		expect(funnelBoundsAt(funnel, funnel.wideZ + 1)).toEqual(hordeBounds);
	});

	it("fecha em diagonal até o corredor e não abre mais até o canhão", () => {
		const middle = funnelBoundsAt(funnel, (funnel.wideZ + funnel.neckZ) / 2);
		expect(middle.left).toBeCloseTo((hordeBounds.left + laneBounds.main.left) / 2);
		expect(middle.right).toBeCloseTo((hordeBounds.right + laneBounds.main.right) / 2);
		expect(funnelBoundsAt(funnel, funnel.neckZ)).toEqual(laneBounds.main);
		expect(funnelBoundsAt(funnel, funnel.mouthZ - 1)).toEqual(laneBounds.main);
		expect(funnelBoundsAt(funnel, 0)).toEqual(laneBounds.main);
	});

	it("a horda nasce atrás do pescoço, já com a largura livre do funil", () => {
		const big = { ...withWaves({ ...quietWaves, horde: 1100 }, 100) };
		const match = startPlaying(big);
		const { bots } = match.snapshot();
		expect(bots).toHaveLength(1100);
		for (const bot of bots) {
			const free = funnelBoundsAt(funnel, bot.z);
			expect(bot.z).toBeGreaterThan(funnel.neckZ);
			expect(bot.z).toBeLessThan(TRACK_LENGTH);
			expect(bot.x).toBeGreaterThanOrEqual(free.left - SPAWN_JITTER);
			expect(bot.x).toBeLessThanOrEqual(free.right + SPAWN_JITTER);
		}
	});

	it("depois da face, todo robô desce pelo corredor até o canhão", () => {
		const settings = { horde: 48, speed: 6 };
		const match = startPlaying({ ...funnelOnly, waveSettings: () => settings });
		const seen = new Array<number>();
		for (let elapsed = 0; elapsed < TRACK_LENGTH / settings.speed + 1; elapsed += FIXED_STEP) {
			run(match, FIXED_STEP);
			const pastMouth = match.snapshot().bots.filter((bot) => bot.z < funnel.mouthZ);
			seen.push(...pastMouth.map((bot) => bot.x));
		}
		expect(seen.length).toBeGreaterThan(0);
		expect(Math.min(...seen)).toBeGreaterThanOrEqual(laneBounds.main.left - SWAY_ROOM);
		expect(Math.max(...seen)).toBeLessThanOrEqual(laneBounds.main.right + SWAY_ROOM);
	});

	it("a horda desce o corredor espalhada, sem empilhar colada na cerca", () => {
		const settings = { horde: 600, speed: 6 };
		const match = startPlaying({ ...funnelOnly, waveSettings: () => settings });
		run(match, (funnel.wideZ - funnel.mouthZ + 4) / settings.speed);
		const inCorridor = match.snapshot().bots.filter((bot) => bot.z < funnel.neckZ);
		const onFence = inCorridor.filter(
			(bot) =>
				bot.x < laneBounds.main.left + EDGE_ROOM || bot.x > laneBounds.main.right - EDGE_ROOM,
		);
		expect(inCorridor.length).toBeGreaterThan(100);
		expect(onFence.length / inCorridor.length).toBeLessThan(0.2);
	});

	it("boneco atirado no corredor passa e chega na torre", () => {
		const match = startPlaying(funnelOnly);
		fireOnce(match, CORRIDOR_CENTER);
		const events = run(match, 5);
		expect(countOf(events, "towerHit")).toBe(1);
	});
});

describe("rampas", () => {
	it("mirar além de cada muro manda a tropa para a rampa daquele lado", () => {
		expect(laneFor(rampWalls.left.left - 0.01)).toBe("side");
		expect(laneFor(CORRIDOR_CENTER)).toBe("main");
		expect(laneFor(rampWalls.right.right + 0.01)).toBe("rightSide");
	});

	it.each([
		["esquerda", -0.6],
		["direita", 0.8],
	])("tropa da rampa %s some na face da barricada sem pontuar", (_side, x) => {
		const match = startPlaying(funnelOnly);
		fireOnce(match, x);
		const lane = match.snapshot().troops[0]?.lane;
		expect(lane).toBe(laneFor(x));
		const farthest = new Array<number>();
		for (let elapsed = 0; elapsed < 5; elapsed += FIXED_STEP) {
			const events = run(match, FIXED_STEP);
			expect(countOf(events, "towerHit")).toBe(0);
			farthest.push(...match.snapshot().troops.map((troop) => troop.z));
			for (const troop of match.snapshot().troops) expect(troop.lane).toBe(lane);
		}
		expect(Math.max(...farthest)).toBeLessThan(funnel.mouthZ + 1);
		expect(match.snapshot().troops).toHaveLength(0);
	});

	it("tropa da rampa não encosta na horda", () => {
		const match = startPlaying({ ...defaultBalance, statueZ: 999, sideStatueZ: 999 });
		aimAt(match, -0.6);
		const events = run(match, 6, holdFire);
		aimAt(match, 0.8);
		events.push(...run(match, 6, holdFire));
		expect(countOf(events, "botKilled")).toBe(0);
	});
});
