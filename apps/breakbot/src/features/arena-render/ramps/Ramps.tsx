import { useMemo } from "react";
import { palette } from "#/shared/palette";
import { createDeckGeometry, createRampTrim, type RampSide, rampSides } from "./ramp-geometry";

type RampDeckProps = {
	side: RampSide;
};

const RampDeck = ({ side }: RampDeckProps) => {
	const geometry = useMemo(() => createDeckGeometry(side), [side]);
	// Grupo 0 do ExtrudeGeometry são as faces do perfil (laterais); grupo 1, o piso e a rampa.
	return (
		<mesh geometry={geometry}>
			<meshStandardMaterial attach="material-0" color={palette.line} roughness={0.9} />
			<meshStandardMaterial attach="material-1" color={palette.asphalt} roughness={0.85} />
		</mesh>
	);
};

// As duas rampas de recursos, uma de cada lado do corredor, encostadas na face das barricadas.
export const Ramps = () => {
	const trim = useMemo(createRampTrim, []);
	return (
		<group>
			{rampSides.map((side) => (
				<RampDeck key={side.deck.left} side={side} />
			))}
			<mesh geometry={trim}>
				<meshStandardMaterial vertexColors roughness={0.85} />
			</mesh>
		</group>
	);
};
