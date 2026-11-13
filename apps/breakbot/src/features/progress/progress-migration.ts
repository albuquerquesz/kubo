import { defaultProgress } from "./progress-schema";
import { validateProgress } from "./progress-validation";

// Save do protótipo HTML. O formato de `push_v2` não está documentado no SPEC; assumimos
// `{ best: { wave, score }, eggs: string[], shots: number, muted: boolean }`.
// Campo ausente vale o padrão; campo com outra forma cai no padrão e é reportado.
export const LEGACY_KEY = "push_v2";

// O protótipo não versionava o save: -1 marca o `push_v2` entregue ao `migrate` do persist.
export const LEGACY_VERSION = -1;

// Embrulha o JSON cru do protótipo no envelope do persist; JSON inválido falha no parse e é reportado.
export const wrapLegacySave = (raw: string | null) =>
	raw === null ? null : `{"state":${raw},"version":${LEGACY_VERSION}}`;

const fromPushV2 = <Legacy extends object>(legacy: Legacy) => ({
	best: "best" in legacy ? legacy.best : null,
	secrets: "eggs" in legacy ? legacy.eggs : [],
	lifetimeShots: "shots" in legacy ? legacy.shots : 0,
	muted: "muted" in legacy ? legacy.muted : false,
});

const fromLegacy = <Persisted>(persisted: Persisted) => {
	if (typeof persisted !== "object" || persisted === null) return persisted;
	return fromPushV2(persisted);
};

// Toda versão anterior (v0 do app ou push_v2 do protótipo) sai daqui já no schema atual e validada.
export const migrateProgress = <Persisted>(persisted: Persisted, version: number) => {
	if (version === LEGACY_VERSION) return validateProgress(fromLegacy(persisted), defaultProgress());
	return validateProgress(persisted, defaultProgress());
};
