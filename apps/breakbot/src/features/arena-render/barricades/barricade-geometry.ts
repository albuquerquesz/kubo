import { defaultBalance, hordeBounds, laneBounds } from "@breakbot/game-core";
import { palette } from "#/shared/palette";
import { type BoxPart, mergeParts } from "../part-geometry";
import { toSceneX, toSceneZ } from "../world";

// Ponto da pista (x e z do core); as peças são montadas em unidades da cena.
type TrackPoint = {
	x: number;
	z: number;
};

type FenceRun = {
	from: TrackPoint;
	to: TrackPoint;
};

const { funnel } = defaultBalance;
const POST_GAP = 0.9;
const POST_SIZE = 0.14;
const FENCE_HEIGHT = 0.62;
const RAIL_HEIGHTS = [0.24, 0.5];

// Ombros transversais e laterais do corredor formam duas quinas retas, com abertura no meio.
const runsOf = (edgeX: number, corridorX: number) =>
	[
		{ from: { x: edgeX, z: funnel.neckZ }, to: { x: corridorX, z: funnel.neckZ } },
		{ from: { x: corridorX, z: funnel.neckZ }, to: { x: corridorX, z: funnel.mouthZ } },
	] satisfies FenceRun[];

const fenceRuns = [
	...runsOf(hordeBounds.left, laneBounds.main.left),
	...runsOf(hordeBounds.right, laneBounds.main.right),
];

const toScene = (point: TrackPoint) => ({ x: toSceneX(point.x), z: toSceneZ(point.z) });

const posts = (start: TrackPoint, deltaX: number, deltaZ: number, length: number) =>
	Array.from({ length: Math.floor(length / POST_GAP) + 1 }, (_, index) => {
		const share = Math.min(1, (index * POST_GAP) / length);
		return {
			size: [POST_SIZE, FENCE_HEIGHT, POST_SIZE],
			at: [start.x + deltaX * share, FENCE_HEIGHT / 2, start.z + deltaZ * share],
			color: palette.woodDeep,
			rounding: 0.03,
		} satisfies BoxPart;
	});

const rails = (start: TrackPoint, deltaX: number, deltaZ: number, length: number) =>
	RAIL_HEIGHTS.map(
		(height) =>
			({
				size: [0.08, 0.11, length],
				at: [start.x + deltaX / 2, height, start.z + deltaZ / 2],
				color: palette.wood,
				turn: Math.atan2(deltaX, deltaZ),
			}) satisfies BoxPart,
	);

// Um trecho reto de cerca: postes a cada POST_GAP e duas tábuas giradas na direção do trecho.
const fenceParts = ({ from, to }: FenceRun) => {
	const start = toScene(from);
	const end = toScene(to);
	const deltaX = end.x - start.x;
	const deltaZ = end.z - start.z;
	const length = Math.hypot(deltaX, deltaZ);
	return [...posts(start, deltaX, deltaZ, length), ...rails(start, deltaX, deltaZ, length)];
};

export const createBarricadeGeometry = () => mergeParts(fenceRuns.flatMap(fenceParts));
