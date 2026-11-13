import type { HorizontalRange } from "@breakbot/game-core";
import type { PaletteColor } from "#/shared/palette";
import { sceneCenterX, sceneWidth, toSceneZ } from "./world";

type StripSpan = {
	bounds: HorizontalRange;
	near: number;
	far: number;
};

type StripLook = {
	color: PaletteColor;
	opacity?: number;
	lift?: number;
};

type StripProps = StripSpan & StripLook;

// Faixa plana deitada na pista, descrita em coordenadas do core.
export const Strip = ({ bounds, near, far, color, opacity = 1, lift = 0 }: StripProps) => (
	<mesh
		position={[sceneCenterX(bounds), lift, (toSceneZ(near) + toSceneZ(far)) / 2]}
		rotation-x={-Math.PI / 2}
	>
		<planeGeometry args={[sceneWidth(bounds), toSceneZ(near) - toSceneZ(far)]} />
		<meshStandardMaterial
			color={color}
			transparent={opacity < 1}
			opacity={opacity}
			roughness={0.9}
			depthWrite={opacity >= 1}
		/>
	</mesh>
);
