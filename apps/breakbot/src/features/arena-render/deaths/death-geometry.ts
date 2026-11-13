import { palette } from "#/shared/palette";
import { mergeParts } from "../part-geometry";

// Brancas de propósito: a cor por instância (clarão → brasa) pinta por cima.
export const createCorpseGeometry = () =>
	mergeParts([{ size: [0.24, 0.24, 0.22], at: [0, 0, 0], color: palette.bright, rounding: 0.06 }]);

export const createShardGeometry = () =>
	mergeParts([{ size: [0.11, 0.11, 0.11], at: [0, 0, 0], color: palette.bright }]);
