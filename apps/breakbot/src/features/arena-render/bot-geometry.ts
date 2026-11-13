import { palette } from "#/shared/palette";
import { mergeParts } from "./part-geometry";

// Desenhado maior que o raio de colisão para ler bem na câmera baixa.
export const BOT_VISUAL_SCALE = 1.7;

// Robô em forma de ícone: cubo vermelho arredondado com dois olhinhos brancos.
export const createBotGeometry = () =>
	mergeParts([
		{ size: [0.24, 0.24, 0.22], at: [0, 0.12, 0], color: palette.alert, rounding: 0.06 },
		{
			size: [0.034, 0.034, 0.014],
			at: [-0.045, 0.13, 0.111],
			color: palette.bright,
			rounding: 0.007,
		},
		{
			size: [0.034, 0.034, 0.014],
			at: [0.045, 0.13, 0.111],
			color: palette.bright,
			rounding: 0.007,
		},
	]);

// Versão sem cantos arredondados para a massa longe da câmera: milhares de cópias, poucos vértices.
export const createCrowdBotGeometry = () =>
	mergeParts([
		{ size: [0.24, 0.24, 0.22], at: [0, 0.12, 0], color: palette.alert },
		{ size: [0.034, 0.034, 0.014], at: [-0.045, 0.13, 0.111], color: palette.bright },
		{ size: [0.034, 0.034, 0.014], at: [0.045, 0.13, 0.111], color: palette.bright },
	]);
