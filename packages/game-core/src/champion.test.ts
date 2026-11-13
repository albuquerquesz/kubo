import { describe, expect, it } from "vitest";
import {
	type Balance,
	CORRIDOR_CENTER,
	createMatch,
	defaultBalance,
	FIXED_STEP,
	idleInput,
	laneFor,
	type Match,
	type MatchEvent,
	type Troop,
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

const aimAt = (match: Match, x: number) =>
	run(match, FIXED_STEP, { ...idleInput, aimDelta: x - match.snapshot().cannon.x });

const fireOnce = (match: Match) => run(match, FIXED_STEP, holdFire);

const championsOf = (match: Match) =>
	match.snapshot().troops.filter((troop: Readonly<Troop>) => troop.champion);

const releases = (events: MatchEvent[]) =>
	events.flatMap((event) => (event.type === "championReleased" ? [event] : []));

// Carga de um tiro e pista limpa: os cenários testam o gigante, não o tempo de encher.
const quickCharge = (balance: Balance = withWaves(quietWaves, 1000)) => ({
	...balance,
	chargeCapacity: 1,
	// Sem bônus de onda limpa: a pontuação medida vem só da torre e dos robôs.
	clearBonusPerWave: 0,
	statueZ: 999,
	sideStatueZ: 999,
});

// Enche a carga com um tiro e espera a tropa desse tiro sair de cena.
const chargedMatch = (balance: Balance) => {
	const match = startPlaying(balance);
	fireOnce(match);
	run(match, 4);
	return match;
};

// Tempo segurando o gatilho para encher a carga padrão na cadência dos cenários, com folga.
const fillSeconds = () =>
	defaultBalance.chargeCapacity * withWaves(quietWaves, 1000).fireInterval + 1;

describe("carga", () => {
	it("soma 1 por tiro normal até o teto da carga", () => {
		const match = startPlaying(withWaves(quietWaves, 1000));
		run(match, 0.5, holdFire);
		const { charge, shots } = match.snapshot();
		expect(shots).toBeGreaterThan(1);
		expect(charge).toBe(shots);

		run(match, fillSeconds(), holdFire);
		expect(match.snapshot().shots).toBeGreaterThan(defaultBalance.chargeCapacity);
		expect(match.snapshot().charge).toBe(defaultBalance.chargeCapacity);
	});

	it("começa vazia e não enche sem atirar", () => {
		const match = startPlaying(withWaves(quietWaves, 1000));
		run(match, 2);
		expect(match.snapshot().charge).toBe(0);
	});
});

describe("comando fireChampion", () => {
	it("é recusado com notCharged antes de a carga encher", () => {
		const match = startPlaying(withWaves(quietWaves, 1000));
		fireOnce(match);
		expect(match.dispatch({ type: "fireChampion" })).toEqual({
			accepted: false,
			reason: "notCharged",
		});
		expect(match.snapshot().charge).toBe(1);
		expect(releases(match.drainEvents())).toHaveLength(0);
		expect(championsOf(match)).toHaveLength(0);
	});

	it("é recusado com notPlaying fora da partida em andamento", () => {
		const match = createMatch({ seed: 7, mode: "play", balance: quickCharge() });
		expect(match.snapshot().phase).toBe("intro");
		expect(match.dispatch({ type: "fireChampion" })).toEqual({
			accepted: false,
			reason: "notPlaying",
		});
	});

	it("com a carga cheia zera a barra e solta o gigante aliado na mira", () => {
		const match = startPlaying(withWaves(quietWaves, 1000));
		run(match, fillSeconds(), holdFire);
		aimAt(match, 0.5);
		expect(match.dispatch({ type: "fireChampion" })).toEqual({ accepted: true });

		const [released] = releases(match.drainEvents());
		expect(match.snapshot().charge).toBe(0);
		expect(released?.x).toBeCloseTo(0.5, 1);
		const [champion] = championsOf(match);
		expect(champion?.health).toBe(defaultBalance.championHealth);
		expect(champion?.radius).toBe(defaultBalance.championRadius);
		expect(champion?.velocityZ).toBe(defaultBalance.championSpeed);
	});
});

describe("gigante aliado", () => {
	it("atravessa vários robôs pela troca de HP", () => {
		// Sem faixas: o tiro que enche a carga não multiplica nem abre o caminho do gigante.
		const match = chargedMatch({ ...quickCharge(withWaves(parkedWaves, 1000)), bandLayout: [] });
		aimAt(match, CORRIDOR_CENTER);
		const killsBefore = match.snapshot().kills;
		match.dispatch({ type: "fireChampion" });
		run(match, 3);
		// Um boneco comum derruba no máximo blastTargets robôs; o gigante passa por muitos.
		expect(match.snapshot().kills - killsBefore).toBeGreaterThan(defaultBalance.blastTargets * 3);
	});

	it("dá 12 pontos ao chegar na torre", () => {
		const match = chargedMatch(quickCharge());
		const { score, kills } = match.snapshot();
		match.dispatch({ type: "fireChampion" });
		const events = run(match, 4);
		expect(countOf(events, "towerHit")).toBe(1);
		// Robô derrubado no caminho vale 1 ponto: desconta para medir só a torre.
		const after = match.snapshot();
		const towerPoints = after.score - score - (after.kills - kills);
		expect(towerPoints).toBe(defaultBalance.championTowerPoints);
	});

	it("mirando na rampa esquerda, sobe a rampa e some na face da barricada", () => {
		const match = chargedMatch(quickCharge());
		aimAt(match, -0.7);
		expect(laneFor(match.snapshot().cannon.x)).toBe("side");
		match.dispatch({ type: "fireChampion" });
		expect(championsOf(match)[0]?.lane).toBe("side");
		const events = run(match, 4);
		expect(championsOf(match)).toHaveLength(0);
		expect(countOf(events, "towerHit")).toBe(0);
	});

	it("não multiplica nas faixas ×N", () => {
		const match = startPlaying(quickCharge());
		expect(countOf(run(match, 2, holdFire), "bandCrossed")).toBeGreaterThan(0);

		run(match, 4);
		match.dispatch({ type: "fireChampion" });
		const events = run(match, 2);
		expect(countOf(events, "bandCrossed")).toBe(0);
		expect(match.snapshot().troops).toHaveLength(1);
	});
});
