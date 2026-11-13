import { defaultBalance, type HorizontalRange, laneBounds } from "@breakbot/game-core";
import { ExtrudeGeometry, Shape } from "three";
import { palette } from "#/shared/palette";
import { type BoxPart, mergeParts } from "../part-geometry";
import {
	DECK_HEIGHT,
	DEPTH_SCALE,
	RAMP_FOOT_Z,
	RAMP_TOP_Z,
	sceneCenterX,
	sceneWidth,
	toSceneX,
	toSceneZ,
} from "../world";

const { mouthZ } = defaultBalance.funnel;
const POST_GAP = 0.9;
const POST_SIZE = 0.12;
const TRIM_HEIGHT = 0.36;
const RAIL_HEIGHTS = [0.16, 0.32];
const DECK_THICKNESS = 0.12;
const SUPPORT_DEPTHS = [5, 9, 13];
const STRIPE_DEPTHS = [4, 6, 8, 10, 12];

export type RampSide = {
	// Faixa do deck: da borda da pista até o lado do corredor (o muro de contenção incluso).
	deck: HorizontalRange;
	// x do core onde corre a cerquinha que encara o corredor.
	railX: number;
};

export const rampSides = [
	{ deck: { left: -1, right: laneBounds.main.left }, railX: laneBounds.main.left - 0.02 },
	{ deck: { left: laneBounds.main.right, right: 1 }, railX: laneBounds.main.right + 0.02 },
] satisfies RampSide[];

// Laje fina: sobe do chão até a ponte, deixando o espaço sob o trecho elevado aberto.
const profile = () => {
	const shape = new Shape();
	shape.moveTo(RAMP_FOOT_Z * DEPTH_SCALE, 0);
	shape.lineTo(RAMP_TOP_Z * DEPTH_SCALE, DECK_HEIGHT);
	shape.lineTo(mouthZ * DEPTH_SCALE, DECK_HEIGHT);
	shape.lineTo(mouthZ * DEPTH_SCALE, DECK_HEIGHT - DECK_THICKNESS);
	shape.lineTo(RAMP_TOP_Z * DEPTH_SCALE, DECK_HEIGHT - DECK_THICKNESS);
	shape.lineTo(RAMP_FOOT_Z * DEPTH_SCALE, -DECK_THICKNESS);
	shape.closePath();
	return shape;
};

// Extruda o perfil na largura do deck e gira para o eixo da pista (z da cena = -z do core).
export const createDeckGeometry = ({ deck }: RampSide) => {
	const body = new ExtrudeGeometry(profile(), { depth: sceneWidth(deck), bevelEnabled: false });
	body.rotateY(Math.PI / 2);
	body.translate(toSceneX(deck.left), 0, 0);
	return body;
};

const posts = (x: number, near: number, far: number) =>
	Array.from({ length: Math.floor((far - near) / POST_GAP) + 1 }, (_, index) => ({
		size: [POST_SIZE, TRIM_HEIGHT, POST_SIZE],
		at: [x, DECK_HEIGHT + TRIM_HEIGHT / 2, near + index * POST_GAP],
		color: palette.steel,
		rounding: 0.03,
	})) satisfies BoxPart[];

const rails = (x: number, near: number, far: number) =>
	RAIL_HEIGHTS.map(
		(height) =>
			({
				size: [0.07, 0.09, far - near],
				at: [x, DECK_HEIGHT + height, (near + far) / 2],
				color: palette.steel,
			}) satisfies BoxPart,
	);

const supports = (deck: HorizontalRange) =>
	SUPPORT_DEPTHS.map((z) => ({
		size: [0.22, DECK_HEIGHT - DECK_THICKNESS, 0.22],
		at: [sceneCenterX(deck), (DECK_HEIGHT - DECK_THICKNESS) / 2, toSceneZ(z)],
		color: palette.steel,
	})) satisfies BoxPart[];

const roadStripes = (deck: HorizontalRange) =>
	STRIPE_DEPTHS.map((z) => ({
		size: [0.06, 0.012, 0.45],
		at: [sceneCenterX(deck), DECK_HEIGHT + 0.008, toSceneZ(z)],
		color: palette.stripe,
	})) satisfies BoxPart[];

// Guarda-corpo metálico, pilares e marcação de estrada no trecho elevado.
export const createRampTrim = () =>
	mergeParts(
		rampSides.flatMap(({ railX, deck }) => {
			const x = toSceneX(railX);
			const near = toSceneZ(mouthZ);
			const far = toSceneZ(RAMP_TOP_Z);
			return [
				...posts(x, near, far),
				...rails(x, near, far),
				...supports(deck),
				...roadStripes(deck),
			];
		}),
	);
