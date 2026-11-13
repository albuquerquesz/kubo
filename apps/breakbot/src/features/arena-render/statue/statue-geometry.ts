import { palette } from "#/shared/palette";
import { mergeParts } from "../part-geometry";

export const PEDESTAL_HEIGHT = 0.3;
export const PEDESTAL_DEPTH = 0.8;

// Golem de arenito em cima de um pedestal, de frente para a câmera. ~1.6 de altura.
export const createStatueGeometry = () =>
	mergeParts([
		{
			size: [1, PEDESTAL_HEIGHT, PEDESTAL_DEPTH],
			at: [0, PEDESTAL_HEIGHT / 2, 0],
			color: palette.stoneDeep,
			rounding: 0.05,
		},
		{ size: [0.24, 0.42, 0.26], at: [-0.17, 0.51, 0], color: palette.stone, rounding: 0.06 },
		{ size: [0.24, 0.42, 0.26], at: [0.17, 0.51, 0], color: palette.stone, rounding: 0.06 },
		{ size: [0.74, 0.56, 0.46], at: [0, 0.98, 0], color: palette.stone, rounding: 0.12 },
		{ size: [0.22, 0.62, 0.26], at: [-0.5, 0.86, 0.04], color: palette.stoneDeep, rounding: 0.08 },
		{ size: [0.22, 0.62, 0.26], at: [0.5, 0.86, 0.04], color: palette.stoneDeep, rounding: 0.08 },
		{ size: [0.34, 0.3, 0.3], at: [0, 1.42, 0.02], color: palette.stone, rounding: 0.1 },
		{ size: [0.2, 0.05, 0.02], at: [0, 1.44, 0.17], color: palette.stoneDeep, rounding: 0.01 },
	]);
