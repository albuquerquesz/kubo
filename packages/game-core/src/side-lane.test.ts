import { describe, expect, it } from "vitest";
import {
	type Balance,
	cannonBounds,
	defaultBalance,
	FIXED_STEP,
	idleInput,
	laneBounds,
	type Match,
	type MatchEvent,
	sidekickFormation,
	sidekickX,
	WALL_DEPTH,
} from "./index";
import {
	countOf,
	holdFire,
	parkedWaves,
	quietWaves,
	run,
	startPlaying,
	withWaves,
} from "./test-support";

const aimLeft = (match: Match) =>
	run(match, FIXED_STEP, { ...idleInput, aimDelta: -0.7 - match.snapshot().cannon.x });

// Sem faixas e sem a estátua da direita no caminho: só a fileira lateral age sobre a tropa.
const sideLaneOnly = (balance: Balance) => ({ ...balance, bandLayout: [], statueZ: 999 });

// Estátua da fileira de 1 de vida: o primeiro tiro na fileira a derruba.
const openLane = (balance: Balance) => ({ ...sideLaneOnly(balance), sideStatueHealth: () => 1 });

const healthsOf = (events: MatchEvent[], type: "wallHit" | "sideStatueHit") =>
	events.flatMap((event) => (event.type === type ? [event.health] : []));

const runUntil = (match: Match, type: MatchEvent["type"], seconds: number) => {
	for (let elapsed = 0; elapsed < seconds; elapsed += FIXED_STEP) {
		const events = run(match, FIXED_STEP, holdFire);
		if (events.some((event) => event.type === type)) return events;
	}
	throw new Error(`${type} não aconteceu em ${seconds}s`);
};

describe("rampa esquerda", () => {
	it("mirar à esquerda do muro manda a tropa para a rampa esquerda", () => {
		const match = startPlaying({ ...withWaves(quietWaves, 100), sideStatueZ: 999 });
		aimLeft(match);
		run(match, 0.2, holdFire);
		run(match, FIXED_STEP, { ...idleInput, aimDelta: 0.8 });
		run(match, 0.2, holdFire);
		const lanes = match.snapshot().troops.map((troop) => troop.lane);
		expect(lanes).toContain("side");
		expect(lanes).toContain("main");
	});

	it("tropa da rampa esquerda não derruba robôs do corredor", () => {
		const match = startPlaying({ ...defaultBalance, sideStatueZ: 999 });
		aimLeft(match);
		const events = run(match, 3.5, holdFire);
		expect(countOf(events, "botKilled")).toBe(0);
	});
});

describe("estátua da fileira", () => {
	it("tranca a fileira desde a primeira onda, com a vida da onda", () => {
		const match = startPlaying(withWaves(quietWaves, 100));
		expect(match.snapshot().sideStatue).toMatchObject({
			z: defaultBalance.sideStatueZ,
			health: defaultBalance.sideStatueHealth(1),
			dead: false,
		});
	});

	it("de pé, segura a tropa da fileira e as paredes atrás dela ficam intactas", () => {
		const balance = { ...sideLaneOnly(withWaves(quietWaves, 100)), sideStatueHealth: () => 500 };
		const match = startPlaying(balance);
		aimLeft(match);
		const events = run(match, 8, holdFire);
		expect(healthsOf(events, "sideStatueHit").slice(0, 3)).toEqual([499, 498, 497]);
		expect(countOf(events, "wallHit")).toBe(0);
		expect(match.snapshot().walls).toHaveLength(defaultBalance.wallRowZ.length);
	});

	it("quebrar só libera as paredes: o upgrade do canhão é da estátua da direita", () => {
		const match = startPlaying(openLane(withWaves(parkedWaves, 100)));
		aimLeft(match);
		const events = runUntil(match, "sideStatueBroken", 2);
		expect(events.filter((event) => event.type === "sideStatueBroken")).toEqual([
			{ type: "sideStatueBroken", wave: 1 },
		]);
		expect(match.snapshot().cannonUpgrades).toBe(0);
	});

	it("derrubada, não volta: na onda seguinte só a fila de paredes volta cheia", () => {
		const balance = { ...openLane(withWaves(parkedWaves, 3)), wallHealth: () => 1 };
		const match = startPlaying(balance);
		aimLeft(match);
		runUntil(match, "wallBroken", 3);
		expect(match.snapshot().walls.length).toBeLessThan(defaultBalance.wallRowZ.length);
		run(match, FIXED_STEP, { ...idleInput, aimDelta: 1 });
		run(match, 4);
		expect(match.snapshot().wave).toBe(2);
		expect(match.snapshot().sideStatue).toMatchObject({ dead: true });
		expect(match.snapshot().walls).toHaveLength(defaultBalance.wallRowZ.length);
		aimLeft(match);
		const events = runUntil(match, "wallHit", 3);
		expect(countOf(events, "sideStatueHit")).toBe(0);
	});
});

describe("paredes", () => {
	it("nascem com a estátua, paradas em fila entre ela e a face da barricada", () => {
		const match = startPlaying(withWaves(quietWaves, 100));
		const { walls } = match.snapshot();
		expect(walls.map((wall) => wall.z)).toEqual(defaultBalance.wallRowZ);
		for (const wall of walls) {
			expect(wall.z - WALL_DEPTH / 2).toBeGreaterThan(defaultBalance.sideStatueZ);
			expect(wall.z + WALL_DEPTH / 2).toBeLessThan(defaultBalance.funnel.mouthZ);
			expect(wall).toMatchObject({ health: defaultBalance.wallHealth(1), dead: false });
		}
	});

	it("não se movem", () => {
		const match = startPlaying(openLane(withWaves(quietWaves, 100)));
		aimLeft(match);
		run(match, 6, holdFire);
		const zs = match.snapshot().walls.map((wall) => wall.z);
		run(match, 10);
		expect(match.snapshot().walls.map((wall) => wall.z)).toEqual(zs);
	});

	it("cada tropa que acerta a parede tira 1 de vida", () => {
		const match = startPlaying(openLane(withWaves(quietWaves, 100)));
		aimLeft(match);
		const events = run(match, 5, holdFire);
		expect(healthsOf(events, "wallHit").slice(0, 3)).toEqual([29, 28, 27]);
	});

	it("quebrada a da frente, a seguinte vira o alvo", () => {
		const match = startPlaying({ ...openLane(withWaves(quietWaves, 100)), wallHealth: () => 1 });
		aimLeft(match);
		const [front, next] = defaultBalance.wallRowZ;
		const events = runUntil(match, "wallBroken", 5);
		expect(events.find((event) => event.type === "wallHit")).toMatchObject({ z: front });
		const after = runUntil(match, "wallHit", 5);
		expect(after.find((event) => event.type === "wallHit")).toMatchObject({ z: next });
	});
});

describe("mini-canhões", () => {
	// Estátua e uma parede só, ambas de 1 de vida: rende exatamente um mini-canhão por onda.
	const firstWall = (balance: Balance) => ({
		...openLane(balance),
		wallHealth: () => 1,
		wallRowZ: defaultBalance.wallRowZ.slice(0, 1),
	});

	it("quebrar a parede dá um mini-canhão no primeiro slot", () => {
		const match = startPlaying(firstWall(withWaves(quietWaves, 100)));
		aimLeft(match);
		const events = runUntil(match, "wallBroken", 5);
		expect(events.filter((event) => event.type === "sidekickJoined")).toEqual([
			{ type: "sidekickJoined", slot: 0, total: 2 },
		]);
	});

	it("chega a 14 mini-canhões (15 canhões) e as paredes seguintes não dão mais nada", () => {
		// Ondas curtas: cada uma traz estátua e fila nova, até sobrar parede além do teto.
		const match = startPlaying(firstWall(withWaves(quietWaves, 2)));
		aimLeft(match);
		const events = run(match, 40, holdFire);
		const slots = events.flatMap((event) => (event.type === "sidekickJoined" ? [event.slot] : []));
		expect(countOf(events, "wallBroken")).toBeGreaterThan(defaultBalance.maxSidekicks);
		expect(defaultBalance.maxSidekicks).toBe(14);
		expect(slots).toEqual(Array.from({ length: 14 }, (_, slot) => slot));
	});

	it("a formação é simétrica e cabe na faixa do canhão", () => {
		const offsets = sidekickFormation.map((spot) => spot.offset);
		expect(offsets.reduce((sum, offset) => sum + offset, 0)).toBeCloseTo(0);
		for (const slot of offsets.keys()) {
			expect(sidekickX(0, slot)).toBeGreaterThanOrEqual(cannonBounds.left);
			expect(sidekickX(0, slot)).toBeLessThanOrEqual(cannonBounds.right);
		}
	});

	it("o mini-canhão atira junto, ao lado, na metade da cadência", () => {
		const match = startPlaying(firstWall(withWaves(quietWaves, 100)));
		aimLeft(match);
		runUntil(match, "wallBroken", 5);
		run(match, 7);
		expect(match.snapshot().troops).toHaveLength(0);
		const aim = laneBounds.main.right - 0.1;
		run(match, FIXED_STEP, { ...idleInput, aimDelta: aim - match.snapshot().cannon.x });
		run(match, 1.2, holdFire);
		const near = (x: number) =>
			match.snapshot().troops.filter((troop) => Math.abs(troop.x - x) < 0.06).length;
		const fromCannon = near(aim);
		const fromSidekick = near(sidekickX(aim, 0));
		expect(fromCannon + fromSidekick).toBe(match.snapshot().troops.length);
		expect(fromSidekick).toBeGreaterThanOrEqual(Math.floor(fromCannon / 2));
		expect(fromSidekick).toBeLessThanOrEqual(Math.ceil(fromCannon / 2) + 1);
	});

	it("sem gatilho o mini-canhão não atira", () => {
		const match = startPlaying(firstWall(withWaves(quietWaves, 100)));
		aimLeft(match);
		runUntil(match, "wallBroken", 5);
		run(match, 9);
		expect(match.snapshot().troops).toHaveLength(0);
	});
});
