import { palette } from "#/shared/palette";
import { mergeParts } from "./part-geometry";

// Bonequinho verde de costas para a câmera, correndo para -z: pernas, tronco, cabeça com
// visor e mochila. Modelado em unidades de modelo (~0.35 de altura).
export const createTroopGeometry = () =>
	mergeParts([
		{ size: [0.05, 0.11, 0.05], at: [-0.035, 0.055, 0], color: palette.goDeep, rounding: 0.022 },
		{ size: [0.05, 0.11, 0.05], at: [0.035, 0.055, 0], color: palette.goDeep, rounding: 0.022 },
		{ size: [0.14, 0.13, 0.1], at: [0, 0.17, 0], color: palette.go, rounding: 0.045 },
		{ size: [0.13, 0.12, 0.12], at: [0, 0.3, 0], color: palette.goLight, rounding: 0.055 },
		{ size: [0.09, 0.03, 0.02], at: [0, 0.305, -0.055], color: palette.ink, rounding: 0.009 },
		{ size: [0.042, 0.042, 0.11], at: [-0.078, 0.18, -0.03], color: palette.go, rounding: 0.02 },
		{ size: [0.042, 0.042, 0.11], at: [0.078, 0.18, -0.03], color: palette.go, rounding: 0.02 },
		{ size: [0.1, 0.09, 0.05], at: [0, 0.18, 0.07], color: palette.amber, rounding: 0.022 },
	]);
