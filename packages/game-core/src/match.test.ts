import { describe, expect, it } from "vitest";
import {
	type Balance,
	botBounds,
	CORRIDOR_CENTER,
	cannonBounds,
	createMatch,
	defaultBalance,
	FIXED_STEP,
	idleInput,
	laneBounds,
	type Match,
} from "./index";
import {
	countOf,
	holdFire,
	parkedWaves,
	quietWaves,
	run,
	rushingWaves,
	startPlaying,
	sweepFiring,
	withWaves,
} from "./test-support";

describe("partida", () => {
	it("é determinística para a mesma seed e o mesmo input", () => {
		const first = createMatch({ seed: 42, mode: "play" });
		const second = createMatch({ seed: 42, mode: "play" });
		run(first, 8, holdFire);
		run(second, 8, holdFire);
		expect(first.snapshot()).toEqual(second.snapshot());
	});

	it("começa na intro e passa a jogar depois dela", () => {
		const match = createMatch({ seed: 1, mode: "play" });
		expect(match.snapshot().phase).toBe("intro");
		run(match, defaultBalance.introDuration + FIXED_STEP * 2);
		expect(match.snapshot().phase).toBe("playing");
	});

	it("aceita pular a intro só durante a intro", () => {
		const match = createMatch({ seed: 1, mode: "play" });
		run(match, 0.5);
		expect(match.dispatch({ type: "skipIntro" })).toEqual({ accepted: true });
		expect(match.drainEvents()).toEqual([
			{ type: "introSkipped", introElapsed: expect.closeTo(0.5, 1) },
		]);
		expect(match.dispatch({ type: "skipIntro" })).toEqual({
			accepted: false,
			reason: "notInIntro",
		});
	});
});

describe("canhão", () => {
	it("dispara na cadência do balance enquanto o gatilho está pressionado", () => {
		const match = startPlaying({ ...defaultBalance, fireInterval: 0.12 });
		const events = run(match, 1.2, holdFire);
		expect(countOf(events, "shot")).toBeGreaterThanOrEqual(10);
		expect(countOf(events, "shot")).toBeLessThanOrEqual(11);
	});

	it("não dispara sem o gatilho", () => {
		const match = startPlaying();
		expect(countOf(run(match, 1), "shot")).toBe(0);
	});

	it("move pela mira relativa e respeita o limite da pista", () => {
		const match = startPlaying();
		run(match, FIXED_STEP, { ...idleInput, aimDelta: 0.2 });
		expect(match.snapshot().cannon.x).toBeCloseTo(CORRIDOR_CENTER + 0.2);
		run(match, FIXED_STEP, { ...idleInput, aimDelta: 5 });
		expect(match.snapshot().cannon.x).toBe(cannonBounds.right);
	});

	it("ignora mira e tempo não finitos", () => {
		const match = startPlaying();
		const before = match.snapshot().cannon.x;
		match.step(FIXED_STEP, { ...idleInput, aimDelta: Number.NaN });
		match.step(FIXED_STEP, { ...idleInput, aimDelta: Number.POSITIVE_INFINITY });
		expect(match.step(Number.NaN, idleInput)).toBe(0);
		expect(match.snapshot().cannon.x).toBe(before);
		expect(Number.isFinite(match.snapshot().elapsed)).toBe(true);
	});

	it("informa o tempo descartado quando o frame passa do teto de passos", () => {
		const match = startPlaying();
		expect(match.step(FIXED_STEP, idleInput)).toBe(0);
		expect(match.step(1, idleInput)).toBeGreaterThan(0.9);
	});

	it("move pelas setas", () => {
		const match = startPlaying();
		run(match, 0.3, { ...idleInput, aimAxis: -1 });
		expect(match.snapshot().cannon.x).toBeCloseTo(
			CORRIDOR_CENTER - defaultBalance.cannonSpeed * 0.3,
			1,
		);
	});
});

describe("combate e pontuação", () => {
	it("tropa derruba robôs e cada robô derrubado vale 1 ponto", () => {
		const match = startPlaying();
		const events = run(match, 12, holdFire);
		const kills = countOf(events, "botKilled");
		expect(kills).toBeGreaterThan(0);
		expect(match.snapshot().kills).toBe(kills);
		expect(match.snapshot().score).toBe(kills + countOf(events, "towerHit"));
	});

	it("o impacto derruba vários robôs vizinhos de uma vez", () => {
		const match = startPlaying(withWaves(parkedWaves, 100));
		const events = run(match, 3, holdFire);
		const shots = countOf(events, "shot");
		const kills = countOf(events, "botKilled");
		expect(kills).toBeGreaterThan(shots);
		expect(kills).toBeLessThanOrEqual(shots * defaultBalance.blastTargets);
	});

	it("sem dano em área cada tropa derruba no máximo um robô", () => {
		const match = startPlaying({ ...withWaves(parkedWaves, 100), blastTargets: 1, bandLayout: [] });
		const events = run(match, 3, holdFire);
		expect(countOf(events, "botKilled")).toBeGreaterThan(0);
		expect(countOf(events, "botKilled")).toBeLessThanOrEqual(countOf(events, "shot"));
	});

	it("tropa que chega na torre vale 1 ponto", () => {
		const match = startPlaying(withWaves(quietWaves, 100));
		const events = run(match, 4, holdFire);
		const towerHits = countOf(events, "towerHit");
		expect(towerHits).toBeGreaterThan(0);
		expect(match.snapshot().score).toBe(towerHits + countOf(events, "botKilled"));
	});
});

describe("vidas e fim de jogo", () => {
	it("robô que passa do canhão tira uma vida", () => {
		const match = startPlaying(withWaves(rushingWaves, 100));
		const events = run(match, 0.9);
		expect(countOf(events, "botBreached")).toBe(2);
		expect(match.snapshot().lives).toBe(defaultBalance.startingLives - 2);
	});

	it("termina a partida quando as vidas acabam", () => {
		const match = startPlaying({
			...withWaves({ ...rushingWaves, horde: 20 }, 100),
			startingLives: 12,
		});
		const events = run(match, 1.5);
		const gameOver = events.find((event) => event.type === "gameOver");
		expect(match.snapshot().phase).toBe("over");
		expect(match.snapshot().lives).toBe(0);
		expect(gameOver).toMatchObject({ stats: { wave: 1, score: 0, kills: 0 } });
	});

	it("o relógio para no game over", () => {
		const match = startPlaying({
			...withWaves({ ...rushingWaves, horde: 20 }, 100),
			startingLives: 12,
		});
		run(match, 1.5);
		const stopped = match.snapshot().elapsed;
		run(match, 3);
		expect(match.snapshot().phase).toBe("over");
		expect(match.snapshot().elapsed).toBe(stopped);
	});
});

describe("ondas", () => {
	it("cada onda segue a curva de dificuldade, emendada na anterior", () => {
		const match = startPlaying({ ...defaultBalance, startingLives: 999, maxLives: 999 });
		const events = run(match, defaultBalance.waveDuration(1) + 0.5, holdFire);
		const snapshot = match.snapshot();
		expect(countOf(events, "waveStarted")).toBe(1);
		expect(snapshot.wave).toBe(2);
		expect(snapshot.waveSettings.speed).toBeCloseTo(1.64);
		expect(snapshot.waveDuration).toBeCloseTo(33);
		for (const bot of snapshot.bots) expect(bot.speed).toBeCloseTo(1.64);
	});

	it("credita moedas no fim da onda pelos robôs derrubados nela", () => {
		const match = startPlaying(withWaves({ ...quietWaves, horde: 48 }, 100));
		const events = sweepFiring(match, 30);
		const settled = events.findIndex((event) => event.type === "coinsEarned");
		const kills = countOf(events.slice(0, settled), "botKilled");
		expect(kills).toBeGreaterThan(40);
		expect(events[settled]).toEqual({
			type: "coinsEarned",
			wave: 1,
			kills,
			coins: Math.floor(kills / 10),
		});
	});

	it("não emite moedas numa onda sem abates", () => {
		const match = startPlaying(withWaves(parkedWaves, 1));
		const events = run(match, 1.5);
		expect(countOf(events, "coinsEarned")).toBe(0);
		expect(match.snapshot().coins).toBe(0);
	});

	it("fecha a conta da onda parcial no game over", () => {
		const balance = withWaves({ horde: 600, speed: 1 }, 200);
		// Sem faixas: a tropa multiplicada limparia a horda e o game over cairia em outra onda.
		// Cadência, velocidade e dano em área fixos: o cenário precisa terminar com a horda de pé.
		const match = startPlaying({
			...balance,
			bandLayout: [],
			fireInterval: 0.12,
			troopSpeed: 30,
			blastTargets: 1,
		});
		const events = [...sweepFiring(match, 20), ...run(match, 110)];
		const gameOver = events.find((event) => event.type === "gameOver");
		const earned = events.filter((event) => event.type === "coinsEarned");
		const total = earned.reduce((sum, event) => sum + event.coins, 0);
		expect(total).toBeGreaterThan(0);
		expect(gameOver).toMatchObject({ stats: { wave: 1, coins: total } });
	});

	it("não dá moedas no modo attract", () => {
		const match = startPlaying(withWaves({ ...quietWaves, horde: 48 }, 100), "attract");
		const events = sweepFiring(match, 30);
		expect(countOf(events, "botKilled")).toBeGreaterThan(10);
		expect(countOf(events, "coinsEarned")).toBe(0);
	});

	it("dá bônus quando a tropa limpa a horda", () => {
		const match = startPlaying(withWaves({ ...quietWaves, horde: 48 }, 100));
		const events = sweepFiring(match, 30);
		const cleared = events.find((event) => event.type === "waveCleared");
		expect(cleared).toEqual({ type: "waveCleared", wave: 1, bonus: 25 });
		expect(countOf(events, "botKilled")).toBeGreaterThan(40);
	});

	it("não dá bônus quando a onda acaba por tempo", () => {
		const match = startPlaying(withWaves({ ...quietWaves, horde: 200 }, 1));
		const events = run(match, 1.5);
		expect(countOf(events, "waveStarted")).toBe(1);
		expect(countOf(events, "waveCleared")).toBe(0);
	});

	it("nenhum robô nasce nem anda fora da faixa que o canhão alcança", () => {
		const match = startPlaying({ ...withWaves(quietWaves, 100), hordeStream: true });
		run(match, 6);
		const positions = match.snapshot().bots.map((bot) => bot.x);
		expect(positions.length).toBeGreaterThan(200);
		expect(Math.max(...positions)).toBeLessThanOrEqual(botBounds.right + 0.012);
		expect(Math.min(...positions)).toBeGreaterThanOrEqual(botBounds.left - 0.012);
	});

	it("recupera vidas nas ondas de cura", () => {
		const balance = { ...withWaves(rushingWaves, 1), restoreLivesEveryWaves: 2, livesRestored: 2 };
		const match = startPlaying(balance);
		const events = run(match, 2.5);
		expect(countOf(events, "waveStarted")).toBe(2);
		expect(events.filter((event) => event.type === "livesRestored")).toEqual([
			{ type: "livesRestored", amount: 2 },
		]);
	});

	it("não passa do teto de vidas", () => {
		const balance = { ...withWaves(quietWaves, 1), restoreLivesEveryWaves: 2 };
		const match = startPlaying(balance);
		const events = run(match, 3.5);
		expect(countOf(events, "livesRestored")).toBe(0);
		expect(match.snapshot().lives).toBe(defaultBalance.maxLives);
	});
});

describe("modo attract", () => {
	it("não mexe em vidas nem pontos e recomeça depois da última onda", () => {
		const match = startPlaying(withWaves({ ...rushingWaves, horde: 10 }, 1), "attract");
		const waves = new Array<number>();
		for (let second = 0; second < 5; second++) {
			run(match, 1);
			waves.push(match.snapshot().wave);
		}
		expect(Math.max(...waves)).toBe(defaultBalance.attractWaves);
		expect(waves).toContain(1);
		expect(match.snapshot().lives).toBe(defaultBalance.startingLives);
		expect(match.snapshot().score).toBe(0);
	});
});

describe("faixas multiplicadoras e estátuas", () => {
	type BandPlacement = Balance["bandLayout"][number];

	// Sem robôs e com as estátuas fora de alcance: só a faixa age sobre a tropa.
	const withBands = (bandLayout: BandPlacement[]) => ({
		...withWaves(quietWaves, 100),
		bandLayout,
		statueZ: 999,
		sideStatueZ: 999,
	});

	const aimAt = (match: Match, x: number) =>
		run(match, FIXED_STEP, { ...idleInput, aimDelta: x - match.snapshot().cannon.x });

	const fireOnce = (match: Match, x: number) => {
		aimAt(match, x);
		return run(match, FIXED_STEP, holdFire);
	};

	it("boneco que passa dentro da faixa ×2 vira dois, uma vez só", () => {
		const match = startPlaying(withBands([{ z: 12, multiplier: 2 }]));
		fireOnce(match, 0.3);
		const events = run(match, 1.2);
		expect(match.snapshot().troops).toHaveLength(2);
		expect(events.filter((event) => event.type === "bandCrossed")).toEqual([
			expect.objectContaining({ band: 0, multiplier: 2, clones: 1 }),
		]);
	});

	it("ao multiplicar, original e clone ganham destaque e se abrem para lados opostos", () => {
		const match = startPlaying(withBands([{ z: 12, multiplier: 2 }]));
		fireOnce(match, 0.3);
		for (let elapsed = 0; elapsed < 1.2; elapsed += FIXED_STEP) {
			const crossed = run(match, FIXED_STEP).some((event) => event.type === "bandCrossed");
			if (crossed) break;
		}
		const [original, clone] = match.snapshot().troops;
		expect(original?.boost).toBe(defaultBalance.multiplyBoost);
		expect(clone?.boost).toBe(defaultBalance.multiplyBoost);
		expect(Math.sign((clone?.velocityX ?? 0) - (original?.velocityX ?? 0))).toBe(1);
		run(match, defaultBalance.multiplyBoost + FIXED_STEP);
		expect(match.snapshot().troops.map((troop) => troop.boost)).toEqual([0, 0]);
	});

	it("faixas em sequência multiplicam em cadeia", () => {
		const match = startPlaying(
			withBands([
				{ z: 12, multiplier: 2 },
				{ z: 22, multiplier: 3 },
			]),
		);
		fireOnce(match, 0.3);
		const events = run(match, 1.2);
		expect(match.snapshot().troops).toHaveLength(6);
		expect(countOf(events, "bandCrossed")).toBe(3);
	});

	it.each([
		["esquerdo", laneBounds.main.left + 0.02],
		["direito", laneBounds.main.right - 0.02],
	])("a faixa fecha o corredor: boneco colado no muro %s também multiplica", (_side, x) => {
		const match = startPlaying(withBands([{ z: 12, multiplier: 2 }]));
		fireOnce(match, x);
		const events = run(match, 1.2);
		expect(countOf(events, "bandCrossed")).toBe(1);
	});

	it("tropa das rampas passa sem multiplicar", () => {
		const match = startPlaying(withBands([{ z: 12, multiplier: 2 }]));
		fireOnce(match, laneBounds.side.left + 0.1);
		fireOnce(match, laneBounds.rightSide.right - 0.1);
		const events = run(match, 1.2);
		expect(countOf(events, "bandCrossed")).toBe(0);
	});

	it("a multiplicação respeita o teto de tropa", () => {
		const match = startPlaying({
			...withBands([
				{ z: 12, multiplier: 3 },
				{ z: 22, multiplier: 3 },
			]),
			troopCap: 4,
		});
		fireOnce(match, 0.3);
		run(match, 1.2);
		expect(match.snapshot().troops).toHaveLength(4);
	});

	it("a estátua nasce na rampa direita e fica de pé entre as ondas, guardando o dano", () => {
		const match = startPlaying({ ...withWaves(quietWaves, 2), bandLayout: [] });
		const first = match.snapshot().statue;
		expect(first).toMatchObject({ z: defaultBalance.statueZ, health: 500, maxHealth: 500 });
		expect(first?.x).toBeGreaterThan(laneBounds.rightSide.left);
		expect(first?.x).toBeLessThan(laneBounds.rightSide.right);
		aimAt(match, first?.x ?? 0);
		const events = run(match, 5, holdFire);
		expect(countOf(events, "waveStarted")).toBeGreaterThanOrEqual(2);
		const statue = match.snapshot().statue;
		expect(statue?.x).toBe(first?.x);
		expect(statue?.maxHealth).toBe(500);
		expect(statue?.health).toBe(500 - countOf(events, "statueHit"));
	});

	it("depois de quebrada, a próxima estátua surge com a vida da nova onda", () => {
		const match = startPlaying({
			...withWaves(quietWaves, 4),
			bandLayout: [],
			statueHealth: (wave: number) => wave * 3,
		});
		aimAt(match, match.snapshot().statue?.x ?? 0);
		const broken = () => match.snapshot().statue?.dead === true;
		for (let elapsed = 0; elapsed < 3 && !broken(); elapsed += FIXED_STEP) {
			run(match, FIXED_STEP, holdFire);
		}
		expect(broken()).toBe(true);
		// Sem tiro, uma onda inteira: a próxima começa e os bonecos no ar já saíram de cena.
		run(match, 4);
		expect(match.snapshot().statue).toMatchObject({ health: 6, maxHealth: 6, dead: false });
	});

	it("cada boneco que acerta tira 1 de vida e quebrar a estátua dá o upgrade", () => {
		const match = startPlaying({
			...withWaves(quietWaves, 100),
			bandLayout: [],
			statueHealth: () => 3,
		});
		aimAt(match, match.snapshot().statue?.x ?? 0);
		const events = run(match, 3, holdFire);
		const hits = events.filter((event) => event.type === "statueHit");
		expect(hits.map((hit) => hit.health)).toEqual([2, 1, 0]);
		expect(events.filter((event) => event.type === "statueBroken")).toEqual([
			{ type: "statueBroken", wave: 1 },
		]);
		expect(match.snapshot().statue?.dead).toBe(true);
		expect(match.snapshot().cannonUpgrades).toBe(1);
	});

	it("boneco do corredor colado no muro direito passa direto pela estátua", () => {
		const match = startPlaying({ ...withWaves(quietWaves, 100), bandLayout: [] });
		fireOnce(match, laneBounds.main.right - 0.02);
		const events = run(match, 5);
		expect(countOf(events, "statueHit")).toBe(0);
		expect(countOf(events, "towerHit")).toBe(1);
	});
});
