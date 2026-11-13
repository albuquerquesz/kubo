import { useMemo } from "react";
import { createBarricadeGeometry } from "./barricade-geometry";

// As duas barricadas do funil: cercas de madeira que empurram a horda para o corredor.
export const Barricades = () => {
	const geometry = useMemo(createBarricadeGeometry, []);
	return (
		<mesh geometry={geometry}>
			<meshStandardMaterial vertexColors roughness={0.85} />
		</mesh>
	);
};
