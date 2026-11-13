import { describe, expect, it } from "vitest";
import { standRecord } from "./record-standing";

const stats = { wave: 2, score: 267, kills: 240, coins: 24, elapsed: 29 };

describe("standRecord", () => {
	it("explica a primeira partida", () => {
		const result = { stats, previous: null, best: stats, newRecord: false };
		expect(standRecord(result)).toBe("Primeira partida: agora é bater essa marca");
	});

	it("mostra o recorde que foi batido", () => {
		const previous = { wave: 1, score: 120 };
		const result = { stats, previous, best: stats, newRecord: true };
		expect(standRecord(result)).toBe("Recorde anterior: onda 1 · ★\u00A0120");
	});

	it("diz quantas ondas faltaram", () => {
		const previous = { wave: 4, score: 900 };
		const result = { stats, previous, best: previous, newRecord: false };
		expect(standRecord(result)).toBe("Recorde: onda 4 · ★\u00A0900 · faltaram 2 ondas");
	});

	it("concorda no singular quando falta uma onda", () => {
		const previous = { wave: 3, score: 900 };
		const result = { stats, previous, best: previous, newRecord: false };
		expect(standRecord(result)).toBe("Recorde: onda 3 · ★\u00A0900 · faltou 1 onda");
	});

	it("na mesma onda, mede pelos pontos", () => {
		const previous = { wave: 2, score: 534 };
		const result = { stats, previous, best: previous, newRecord: false };
		expect(standRecord(result)).toBe("Recorde: onda 2 · ★\u00A0534 · faltaram 267 pontos");
	});

	it("diz quanto faltou de um ponto", () => {
		const previous = { wave: 2, score: 268 };
		const result = { stats, previous, best: previous, newRecord: false };
		expect(standRecord(result)).toBe("Recorde: onda 2 · ★\u00A0268 · faltou 1 ponto");
	});

	it("reconhece o empate", () => {
		const previous = { wave: 2, score: 267 };
		const result = { stats, previous, best: previous, newRecord: false };
		expect(standRecord(result)).toBe("Recorde: onda 2 · ★\u00A0267 · empatou com o recorde");
	});
});
