import {
	BoxGeometry,
	type BufferGeometry,
	Color,
	Float32BufferAttribute,
	type Vector3Tuple,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { PaletteColor } from "#/shared/palette";

export type BoxPart = {
	size: Vector3Tuple;
	at: Vector3Tuple;
	color: PaletteColor;
	rounding?: number;
	// Giro em torno do eixo vertical (radianos), para peças na diagonal como cercas do funil.
	turn?: number;
};

const paint = (geometry: BufferGeometry, color: PaletteColor) => {
	const { r: red, g: green, b: blue } = new Color(color);
	const count = geometry.getAttribute("position").count;
	const colors = Array.from({ length: count }, () => [red, green, blue]).flat();
	geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
	return geometry;
};

const ROUNDING_SEGMENTS = 3;

const shapePart = (part: BoxPart) => {
	if (part.rounding === undefined) return new BoxGeometry(...part.size);
	return new RoundedBoxGeometry(...part.size, ROUNDING_SEGMENTS, part.rounding);
};

// Caixas arredondadas saem sem índice; padronizar evita que o merge falhe ao misturar formatos.
const buildPart = (part: BoxPart) => {
	const box = shapePart(part).toNonIndexed();
	box.rotateY(part.turn ?? 0);
	box.translate(...part.at);
	return paint(box, part.color);
};

// Junta caixas coloridas numa geometria só, para desenhar milhares com um InstancedMesh.
export const mergeParts = (parts: BoxPart[]) => mergeGeometries(parts.map(buildPart));
