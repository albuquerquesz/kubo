import { reportSilentError } from "#/shared/telemetry";
import type { BestRecord, SavedProgress } from "./progress-schema";

// Validação na borda: o que vem do storage só entra no store depois de passar por aqui.

type FieldReading = { [Field in keyof SavedProgress]: SavedProgress[Field] | undefined };

const isCount = <Value>(value: Value) =>
	typeof value === "number" && Number.isFinite(value) && value >= 0;

const readBest = <Best>(best: Best) => {
	if (best === null) return null;
	if (typeof best !== "object" || !("wave" in best) || !("score" in best)) return undefined;
	const { wave, score } = best;
	if (typeof wave !== "number" || typeof score !== "number") return undefined;
	if (!isCount(wave) || !isCount(score)) return undefined;
	return { wave, score } satisfies BestRecord;
};

const readCount = <Count>(count: Count) =>
	typeof count === "number" && isCount(count) ? count : undefined;

const readSecrets = <Secrets>(secrets: Secrets) => {
	if (!Array.isArray(secrets)) return undefined;
	const names = secrets.filter((secret) => typeof secret === "string").map(String);
	return names.length === secrets.length ? [...new Set(names)] : undefined;
};

const readMuted = <Muted>(muted: Muted) => (typeof muted === "boolean" ? muted : undefined);

// Campo ausente vale o padrão sem alerta (save antigo); campo presente e inválido vira `undefined`.
const readFields = <Source extends object>(source: Source) =>
	({
		best: readBest("best" in source ? source.best : null),
		wallet: readCount("wallet" in source ? source.wallet : 0),
		secrets: readSecrets("secrets" in source ? source.secrets : []),
		lifetimeShots: readCount("lifetimeShots" in source ? source.lifetimeShots : 0),
		muted: readMuted("muted" in source ? source.muted : false),
	}) satisfies FieldReading;

const invalidFields = (reading: FieldReading) =>
	Object.entries(reading)
		.filter(([, value]) => value === undefined)
		.map(([field]) => field);

const withDefaults = (reading: FieldReading, fallback: SavedProgress) =>
	({
		best: reading.best === undefined ? fallback.best : reading.best,
		wallet: reading.wallet ?? fallback.wallet,
		secrets: reading.secrets ?? fallback.secrets,
		lifetimeShots: reading.lifetimeShots ?? fallback.lifetimeShots,
		muted: reading.muted ?? fallback.muted,
	}) satisfies SavedProgress;

const reportShape = (detail: string) =>
	reportSilentError("progress_load_failed", detail, { reason: "shape" });

// Campo inválido cai no padrão e o descarte é reportado: o jogador perdeu esse dado.
export const validateProgress = <Persisted>(persisted: Persisted, fallback: SavedProgress) => {
	if (persisted === undefined || persisted === null) return fallback;
	if (typeof persisted !== "object") {
		reportShape("progresso salvo não é um objeto");
		return fallback;
	}
	const reading = readFields(persisted);
	const invalid = invalidFields(reading);
	if (invalid.length > 0) reportShape(`campos inválidos: ${invalid.join(", ")}`);
	return withDefaults(reading, fallback);
};

export const mergeProgress = <Persisted, Current extends SavedProgress>(
	persisted: Persisted,
	current: Current,
) => ({ ...current, ...validateProgress(persisted, current) });
