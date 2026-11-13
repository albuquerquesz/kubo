import { beforeEach, describe, expect, it } from "vitest";
import { createRecordingSink, installSink, resetTelemetry } from "#/shared/telemetry";
import { LEGACY_VERSION, migrateProgress, wrapLegacySave } from "./progress-migration";

let recording = createRecordingSink();

const silentKinds = () => recording.exceptions.map((report) => report.kind);

beforeEach(() => {
	resetTelemetry();
	recording = createRecordingSink();
	installSink(recording.sink);
});

describe("migração do save push_v2", () => {
	it("preserva recorde, segredos, tiros e mute do protótipo", () => {
		const legacy = {
			best: { wave: 7, score: 812 },
			eggs: ["dev", "sudo"],
			shots: 1200,
			muted: true,
		};
		expect(migrateProgress(legacy, LEGACY_VERSION)).toEqual({
			best: { wave: 7, score: 812 },
			wallet: 0,
			secrets: ["dev", "sudo"],
			lifetimeShots: 1200,
			muted: true,
		});
		expect(silentKinds()).toEqual([]);
	});

	it("campo ausente no protótipo vale o padrão sem alerta", () => {
		const migrated = migrateProgress({ best: { wave: 2, score: 40 } }, LEGACY_VERSION);
		expect(migrated).toMatchObject({ best: { wave: 2, score: 40 }, secrets: [], lifetimeShots: 0 });
		expect(silentKinds()).toEqual([]);
	});

	it("segredos repetidos são guardados uma vez", () => {
		const migrated = migrateProgress({ eggs: ["vim", "vim", "rm"] }, LEGACY_VERSION);
		expect(migrated.secrets).toEqual(["vim", "rm"]);
	});

	it("lista de segredos com lixo cai no padrão e é reportada", () => {
		const migrated = migrateProgress(
			{ best: { wave: 3, score: 9 }, eggs: ["dev", 42] },
			LEGACY_VERSION,
		);
		expect(migrated).toMatchObject({ best: { wave: 3, score: 9 }, secrets: [] });
		expect(silentKinds()).toEqual(["progress_load_failed"]);
	});

	it("save do protótipo que não é objeto vira o padrão", () => {
		expect(migrateProgress("lixo", LEGACY_VERSION)).toMatchObject({ best: null, secrets: [] });
		expect(silentKinds()).toEqual(["progress_load_failed"]);
	});
});

describe("migração do schema v0", () => {
	it("mantém recorde e carteira e preenche os campos novos", () => {
		expect(migrateProgress({ best: { wave: 4, score: 90 }, wallet: 12 }, 0)).toEqual({
			best: { wave: 4, score: 90 },
			wallet: 12,
			secrets: [],
			lifetimeShots: 0,
			muted: false,
		});
		expect(silentKinds()).toEqual([]);
	});
});

describe("wrapLegacySave", () => {
	it("sem save do protótipo não há nada a migrar", () => {
		expect(wrapLegacySave(null)).toBeNull();
	});

	it("embrulha o save cru no envelope versionado do persist", () => {
		expect(JSON.parse(wrapLegacySave('{"eggs":["dev"]}') ?? "")).toEqual({
			state: { eggs: ["dev"] },
			version: LEGACY_VERSION,
		});
	});
});
