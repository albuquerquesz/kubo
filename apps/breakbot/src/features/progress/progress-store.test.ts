import { describe, expect, it } from "vitest";
import {
	addLifetimeShots,
	creditCoins,
	setMuted,
	settleMatch,
	useProgressStore,
} from "./progress-store";

const stats = { wave: 3, score: 400, kills: 120, coins: 12, elapsed: 61 };

describe("settleMatch", () => {
	it("registra a primeira partida sem comemorar", () => {
		const result = settleMatch(stats, null);
		expect(result.newRecord).toBe(false);
		expect(result.best).toEqual({ wave: 3, score: 400 });
	});

	it("comemora quando passa da onda do recorde", () => {
		const result = settleMatch(stats, { wave: 2, score: 900 });
		expect(result.newRecord).toBe(true);
		expect(result.best).toEqual({ wave: 3, score: 400 });
	});

	it("desempata a mesma onda pelos pontos", () => {
		expect(settleMatch(stats, { wave: 3, score: 399 }).newRecord).toBe(true);
		expect(settleMatch(stats, { wave: 3, score: 400 }).newRecord).toBe(false);
	});

	it("mantém o recorde antigo quando a partida foi pior", () => {
		const result = settleMatch(stats, { wave: 5, score: 100 });
		expect(result.newRecord).toBe(false);
		expect(result.best).toEqual({ wave: 5, score: 100 });
	});
});

describe("creditCoins", () => {
	it("acumula na carteira", () => {
		useProgressStore.setState({ wallet: 0 });
		creditCoins(4);
		creditCoins(7);
		expect(useProgressStore.getState().wallet).toBe(11);
	});
});

describe("addLifetimeShots", () => {
	it("soma os tiros de cada partida ao total da vida", () => {
		useProgressStore.setState({ lifetimeShots: 0 });
		addLifetimeShots(300);
		addLifetimeShots(45);
		expect(useProgressStore.getState().lifetimeShots).toBe(345);
	});
});

describe("setMuted", () => {
	it("guarda a preferência de som", () => {
		setMuted(true);
		expect(useProgressStore.getState().muted).toBe(true);
		setMuted(false);
		expect(useProgressStore.getState().muted).toBe(false);
	});
});
