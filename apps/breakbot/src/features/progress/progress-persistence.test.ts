import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRecordingSink, installSink, resetTelemetry } from "#/shared/telemetry";
import { defaultProgress, PROGRESS_KEY, PROGRESS_VERSION } from "./progress-schema";
import { creditCoins, useProgressStore } from "./progress-store";

let recording = createRecordingSink();

const savedAs = (raw: string) => ({
	getItem: () => raw,
	setItem: () => {},
	removeItem: () => {},
});

const storageWith = (entries: Record<string, string>) => {
	const saved = new Map(Object.entries(entries));
	return {
		saved,
		getItem: (name: string) => saved.get(name) ?? null,
		setItem: (name: string, value: string) => {
			saved.set(name, value);
		},
		removeItem: (name: string) => {
			saved.delete(name);
		},
	};
};

const brokenStorage = {
	getItem: () => {
		throw new Error("SecurityError");
	},
	setItem: () => {
		throw new Error("QuotaExceededError");
	},
	removeItem: () => {},
};

const silentKinds = () => recording.exceptions.map((report) => report.kind);

beforeEach(() => {
	resetTelemetry();
	recording = createRecordingSink();
	installSink(recording.sink);
	useProgressStore.setState(defaultProgress());
});

afterEach(() => vi.unstubAllGlobals());

describe("progresso salvo", () => {
	it("save ilegível é descartado e reportado", async () => {
		vi.stubGlobal("localStorage", savedAs("{quebrado"));
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState().wallet).toBe(0);
		expect(silentKinds()).toEqual(["progress_load_failed"]);
	});

	it("campo com forma errada cai no padrão e é reportado", async () => {
		const state = { best: { wave: 4, score: 90 }, wallet: "muito" };
		const saved = { state, version: PROGRESS_VERSION };
		vi.stubGlobal("localStorage", savedAs(JSON.stringify(saved)));
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState()).toMatchObject({ best: { wave: 4, score: 90 }, wallet: 0 });
		expect(silentKinds()).toEqual(["progress_load_failed"]);
	});

	it("save válido hidrata sem alerta", async () => {
		const state = { best: { wave: 2, score: 30 }, wallet: 12, secrets: ["dev"], muted: true };
		const saved = { state, version: PROGRESS_VERSION };
		vi.stubGlobal("localStorage", savedAs(JSON.stringify(saved)));
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState()).toMatchObject(state);
		expect(silentKinds()).toEqual([]);
	});

	it("save v0 migra para o schema atual e é regravado", async () => {
		const legacyApp = { state: { best: { wave: 5, score: 70 }, wallet: 8 }, version: 0 };
		const storage = storageWith({ [PROGRESS_KEY]: JSON.stringify(legacyApp) });
		vi.stubGlobal("localStorage", storage);
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState()).toMatchObject({ best: { wave: 5, score: 70 }, wallet: 8 });
		expect(JSON.parse(storage.saved.get(PROGRESS_KEY) ?? "")).toMatchObject({
			version: PROGRESS_VERSION,
			state: { secrets: [], lifetimeShots: 0, muted: false },
		});
	});

	it("sem save do jogo, importa o push_v2 do protótipo", async () => {
		const prototype = { best: { wave: 9, score: 1500 }, eggs: ["konami", "n42"], shots: 1337 };
		const storage = storageWith({ push_v2: JSON.stringify(prototype) });
		vi.stubGlobal("localStorage", storage);
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState()).toMatchObject({
			best: { wave: 9, score: 1500 },
			secrets: ["konami", "n42"],
			lifetimeShots: 1337,
		});
		expect(storage.saved.has(PROGRESS_KEY)).toBe(true);
		expect(silentKinds()).toEqual([]);
	});

	it("save do jogo tem prioridade sobre o push_v2", async () => {
		const current = { state: { best: { wave: 2, score: 10 } }, version: PROGRESS_VERSION };
		const prototype = { best: { wave: 9, score: 1500 } };
		vi.stubGlobal(
			"localStorage",
			storageWith({ [PROGRESS_KEY]: JSON.stringify(current), push_v2: JSON.stringify(prototype) }),
		);
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState().best).toEqual({ wave: 2, score: 10 });
	});

	it("push_v2 ilegível não quebra o boot", async () => {
		vi.stubGlobal("localStorage", storageWith({ push_v2: "{quebrado" }));
		await useProgressStore.persist.rehydrate();
		expect(useProgressStore.getState()).toMatchObject(defaultProgress());
		expect(silentKinds()).toEqual(["progress_load_failed"]);
	});

	it("armazenamento bloqueado é reportado e o jogo segue em memória", async () => {
		vi.stubGlobal("localStorage", brokenStorage);
		await useProgressStore.persist.rehydrate();
		creditCoins(3);
		expect(useProgressStore.getState().wallet).toBe(3);
		expect(silentKinds()).toEqual(["progress_storage_unavailable", "progress_storage_unavailable"]);
		expect(recording.exceptions.map((report) => report.error.message)).toEqual([
			"SecurityError",
			"QuotaExceededError",
		]);
	});
});
