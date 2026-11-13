// Rampa esquerda (`side`), corredor da horda (`main`) e rampa direita (`rightSide`).
export type Lane = "side" | "main" | "rightSide";

export type HorizontalRange = {
	readonly left: number;
	readonly right: number;
};

// Encurtada de 100 (protótipo) para 55; o funil fica perto do canhão (z 14–24) e o fundo,
// até 60, guarda a mega horda da reserva.
export const TRACK_LENGTH = 60;
export const TOWER_Z = TRACK_LENGTH - 0.5;
export const BREACH_Z = -1;
export const MUZZLE_Z = -3;
export const CANNON_Z = -6;

// Depois das barricadas a horda fica presa no corredor; as laterais viram rampas elevadas de
// recursos, sem robô. As rampas acabam na face das barricadas (`funnel.mouthZ`).
export const laneBounds = {
	side: { left: -0.97, right: -0.51 },
	main: { left: -0.405, right: 0.405 },
	rightSide: { left: 0.51, right: 0.97 },
} satisfies Record<Lane, HorizontalRange>;

// Muros de contenção entre cada rampa e o corredor.
export const rampWalls = {
	left: { left: laneBounds.side.right, right: laneBounds.main.left },
	right: { left: laneBounds.main.right, right: laneBounds.rightSide.left },
} satisfies Record<"left" | "right", HorizontalRange>;

// Área larga atrás das barricadas, onde a horda nasce antes de afunilar. Tudo simétrico em
// torno do centro da estrada: o corredor fica no meio e as rampas têm a mesma largura.
export const hordeBounds = { left: -0.94, right: 0.94 } satisfies HorizontalRange;

export const cannonBounds = { left: -0.84, right: 0.84 } satisfies HorizontalRange;

export const CORRIDOR_CENTER = (laneBounds.main.left + laneBounds.main.right) / 2;

// Faixa onde robô pode nascer ou andar: a área da horda com uma folga da borda.
const BOT_EDGE_MARGIN = 0.03;
export const botBounds = {
	left: hordeBounds.left + BOT_EDGE_MARGIN,
	right: hordeBounds.right - BOT_EDGE_MARGIN,
} satisfies HorizontalRange;

const centerOf = (range: HorizontalRange) => (range.left + range.right) / 2;

// Mirar além de um muro manda a tropa para a rampa daquele lado.
export const laneFor = (x: number) => {
	if (x < centerOf(rampWalls.left)) return "side";
	if (x > centerOf(rampWalls.right)) return "rightSide";
	return "main";
};

export const clamp = (value: number, bounds: HorizontalRange) =>
	Math.min(bounds.right, Math.max(bounds.left, value));
