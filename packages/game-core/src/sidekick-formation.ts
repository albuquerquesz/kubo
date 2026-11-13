import { cannonBounds, clamp } from "./track";

// Posição de um mini-canhão em relação ao canhão: deslocamento lateral (x da pista)
// e recuo (z da pista, só visual: a tropa sai sempre da boca do canhão).
export type FormationSpot = {
	offset: number;
	back: number;
};

// Fileiras coladas: com 14 mini-canhões a cunha precisa caber acima da barra de carga.
const FIRST_ROW_BACK = 0.3;
const ROW_GAP = 0.6;

const row = (rank: number, offsets: number[]) =>
	offsets.map((offset) => ({
		offset,
		back: FIRST_ROW_BACK + (rank - 1) * ROW_GAP,
	})) satisfies FormationSpot[];

// Cunha atrás do canhão, preenchida alternando os lados: 2 + 4 + 4 + 4 = 14 mini-canhões.
export const sidekickFormation = [
	...row(1, [-0.16, 0.16]),
	...row(2, [-0.08, 0.08, -0.24, 0.24]),
	...row(3, [-0.16, 0.16, -0.32, 0.32]),
	...row(4, [-0.08, 0.08, -0.24, 0.24]),
] satisfies FormationSpot[];

const NO_SPOT = { offset: 0, back: 0 } satisfies FormationSpot;

const spotOf = (slot: number) => sidekickFormation[slot] ?? NO_SPOT;

// Mesma conta no core e no render: o mini-canhão encosta na borda quando o canhão está nela.
export const sidekickX = (cannonX: number, slot: number) =>
	clamp(cannonX + spotOf(slot).offset, cannonBounds);

export const sidekickBack = (slot: number) => spotOf(slot).back;
