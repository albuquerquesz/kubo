import { type PaletteColor, palette } from "#/shared/palette";
import { mergeParts } from "./part-geometry";

// O personagem do Kubo (o cubo do logo) em blocos, de costas para a câmera e correndo para -z.
// As medidas vêm direto do SVG da marca (viewBox 763 × 678), então a silhueta é a mesma do logo:
// corpo, duas antenas em cima, dois braços nas laterais, duas pernas e os olhos na frente.
const LOGO_WIDTH = 763;
const LOGO_HEIGHT = 678;
// Unidades de modelo por unidade do logo: ~0.27 de largura e ~0.24 de altura.
const UNIT = 0.00036;
const DEPTH = 0.13;
const ROUNDING = 0.008;
// Os olhos ficam um fio à frente do corpo para não brigar com a face dele.
const EYE_DEPTH = 0.012;

type LogoRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

const block = (rect: LogoRect, color: PaletteColor) => ({
	rect,
	color,
	depth: DEPTH,
	z: 0,
});

const eye = (rect: LogoRect) => ({
	rect,
	color: palette.ink,
	depth: EYE_DEPTH,
	z: -(DEPTH + EYE_DEPTH) / 2,
});

const KUBO_BLOCKS = [
	block({ left: 92, top: 126, right: 673, bottom: 547 }, palette.kuboLight),
	block({ left: 92, top: 0, right: 205, bottom: 126 }, palette.kubo),
	block({ left: 561, top: 0, right: 673, bottom: 126 }, palette.kubo),
	block({ left: 2, top: 126, right: 92, bottom: 328 }, palette.kubo),
	block({ left: 673, top: 126, right: 763, bottom: 328 }, palette.kubo),
	block({ left: 92, top: 547, right: 213, bottom: 678 }, palette.kuboEdge),
	block({ left: 553, top: 547, right: 673, bottom: 678 }, palette.kuboEdge),
	eye({ left: 213, top: 292, right: 298, bottom: 378 }),
	eye({ left: 468, top: 292, right: 553, bottom: 378 }),
];

export const createTroopGeometry = () =>
	mergeParts(
		KUBO_BLOCKS.map(({ rect, color, depth, z }) => ({
			size: [(rect.right - rect.left) * UNIT, (rect.bottom - rect.top) * UNIT, depth],
			at: [
				((rect.left + rect.right) / 2 - LOGO_WIDTH / 2) * UNIT,
				(LOGO_HEIGHT - (rect.top + rect.bottom) / 2) * UNIT,
				z,
			],
			color,
			rounding: ROUNDING,
		})),
	);
