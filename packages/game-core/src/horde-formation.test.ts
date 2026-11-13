import { describe, expect, it } from "vitest";
import {
	botBounds,
	CORRIDOR_CENTER,
	defaultBalance,
	FIXED_STEP,
	HORDE_BACK_Z,
	idleInput,
	laneBounds,
	TRACK_LENGTH,
} from "./index";
import { countOf, holdFire, quietWaves, run, startPlaying, withWaves } from "./test-support";

const { hordeLayout } = defaultBalance;
// Folga da variação de posição sorteada no nascimento.
const SPAWN_ROOM = 0.2;

const withHorde = (horde: number, speed = 1) => withWaves({ ...quietWaves, horde, speed }, 100);

describe("formação da mega horda", () => {
	it("nasce inteira atrás da frente, na largura toda da área da horda", () => {
		const match = startPlaying(withHorde(600));
		const { bots } = match.snapshot();
		expect(bots).toHaveLength(600);
		for (const bot of bots) {
			expect(bot.z).toBeGreaterThanOrEqual(hordeLayout.frontZ - SPAWN_ROOM);
			expect(bot.z).toBeLessThan(TRACK_LENGTH);
			expect(bot.x).toBeGreaterThanOrEqual(botBounds.left - SPAWN_ROOM);
			expect(bot.x).toBeLessThanOrEqual(botBounds.right + SPAWN_ROOM);
		}
		const xs = bots.map((bot) => bot.x);
		expect(Math.min(...xs)).toBeLessThan(botBounds.left + 0.05);
		expect(Math.max(...xs)).toBeGreaterThan(botBounds.right - 0.05);
	});

	it("marcha inteira de uma vez: nenhum robô fica parado", () => {
		const match = startPlaying(withHorde(600, 2));
		const before = new Map(match.snapshot().bots.map((bot, index) => [index, bot.z]));
		run(match, 3);
		const moved = match.snapshot().bots.filter((bot, index) => bot.z < (before.get(index) ?? 0));
		expect(moved).toHaveLength(600);
	});

	it("hordas enormes se compactam sem passar do fundo da pista", () => {
		const match = startPlaying(withHorde(1500));
		const zs = match.snapshot().bots.map((bot) => bot.z);
		expect(zs).toHaveLength(1500);
		expect(Math.max(...zs)).toBeLessThan(TRACK_LENGTH - 4 + SPAWN_ROOM);
	});

	it("a horda desce devagar: bem abaixo da curva antiga", () => {
		expect(defaultBalance.waveSettings(1).speed).toBeCloseTo(1.52);
		expect(defaultBalance.waveSettings(50).speed).toBe(3.5);
	});
});

describe("fluxo contínuo da horda", () => {
	const { frontZ, rowGap, columns, corridorColumns } = hordeLayout;
	const streaming = (speed: number) => ({
		...withWaves({ ...quietWaves, speed }, 100),
		hordeStream: true,
	});
	const rows = Math.floor((HORDE_BACK_Z - frontZ) / rowGap) + 1;

	it("a partida começa com a área atrás das barricadas lotada até o fundo", () => {
		const zs = startPlaying(streaming(0))
			.snapshot()
			.bots.map((bot) => bot.z);
		expect(zs).toHaveLength(rows * (columns + corridorColumns));
		expect(Math.min(...zs)).toBeLessThan(frontZ + SPAWN_ROOM);
		expect(Math.max(...zs)).toBeGreaterThan(HORDE_BACK_Z - rowGap);
	});

	it("repõe fileiras no fundo conforme a massa avança: a pista nunca esvazia", () => {
		const match = startPlaying(streaming(2));
		run(match, 10);
		const zs = match.snapshot().bots.map((bot) => bot.z);
		expect(Math.max(...zs)).toBeGreaterThan(HORDE_BACK_Z - rowGap - SPAWN_ROOM);
		for (let z = frontZ; z < HORDE_BACK_Z - rowGap; z += 1) {
			expect(zs.some((botZ) => Math.abs(botZ - z) < rowGap)).toBe(true);
		}
	});

	it("as ondas se emendam: a virada não solta nem tira robô", () => {
		const match = startPlaying({ ...streaming(0), waveDuration: () => 1 });
		const before = match.snapshot().bots.length;
		const events = run(match, 2.5);
		expect(countOf(events, "waveStarted")).toBe(2);
		expect(match.snapshot().bots).toHaveLength(before);
	});
});

describe("horda escorre para os vazios", () => {
	// Faixa do meio da pista, onde o canhão abre o buraco.
	const CENTER_ROOM = 0.08;
	// Horda parada atrás do funil, sem faixas nem estátuas: só a tropa abre o buraco.
	const parked = {
		...withWaves({ ...quietWaves, horde: 900, speed: 0 }, 100),
		bandLayout: [],
		statueZ: 999,
		sideStatueZ: 999,
	};

	// Atira no meio, espera a tropa sair de cena e conta quantos robôs voltaram ao meio.
	const centerAfterHole = (hordeFillSpeed: number) => {
		const match = startPlaying({ ...parked, hordeFillSpeed });
		run(match, FIXED_STEP, { ...idleInput, aimDelta: CORRIDOR_CENTER - match.snapshot().cannon.x });
		run(match, 2, holdFire);
		run(match, 8);
		return match.snapshot().bots.filter((bot) => Math.abs(bot.x - CORRIDOR_CENTER) < CENTER_ROOM)
			.length;
	};

	it("o buraco que o canhão abre no meio se fecha com os robôs dos lados", () => {
		const stuck = centerAfterHole(0);
		const filled = centerAfterHole(defaultBalance.hordeFillSpeed);
		expect(filled).toBeGreaterThan(stuck * 2);
	});

	it("o deslize acelera aos poucos, sem tranco, e não passa da velocidade de preencher", () => {
		const { hordeFillSpeed } = defaultBalance;
		const match = startPlaying(parked);
		run(match, FIXED_STEP, { ...idleInput, aimDelta: CORRIDOR_CENTER - match.snapshot().cannon.x });
		run(match, 2, holdFire);
		const before = new Map(match.snapshot().bots.map((bot) => [bot, bot.drift]));
		run(match, FIXED_STEP);
		const jumps = match.snapshot().bots.map((bot) => Math.abs(bot.drift - (before.get(bot) ?? 0)));
		const drifts = match.snapshot().bots.map((bot) => Math.abs(bot.drift));
		expect(Math.max(...drifts)).toBeGreaterThan(0);
		expect(Math.max(...drifts)).toBeLessThanOrEqual(hordeFillSpeed);
		expect(Math.max(...jumps)).toBeLessThan(hordeFillSpeed * 0.1);
	});

	it("cada fileira do fluxo chega com reforço no meio do corredor", () => {
		const match = startPlaying({
			...withWaves({ ...quietWaves, speed: 0 }, 100),
			hordeStream: true,
		});
		const { bots } = match.snapshot();
		const corridorShare =
			bots.filter((bot) => bot.x > laneBounds.main.left && bot.x < laneBounds.main.right).length /
			bots.length;
		const corridorWidth = laneBounds.main.right - laneBounds.main.left;
		expect(corridorShare).toBeGreaterThan(
			corridorWidth / (botBounds.right - botBounds.left) + 0.05,
		);
	});
});
