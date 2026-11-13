import { laneBounds, type MatchSnapshot } from "@breakbot/game-core";
import { palette } from "#/shared/palette";
import { HALF_WIDTH, sceneWidth } from "../world";
import { StatueFigure } from "./StatueFigure";
import { PEDESTAL_DEPTH, PEDESTAL_HEIGHT } from "./statue-geometry";

// Menor que a da direita, como o "5" da referência.
const SIDE_STATUE_SCALE = 0.3 * HALF_WIDTH;
// A colisão ocupa a rampa esquerda inteira: um muro baixo de pedra deixa isso visível.
const BARRIER_WIDTH = (sceneWidth(laneBounds.side) - 0.1) / SIDE_STATUE_SCALE;
const BARRIER_HEIGHT = PEDESTAL_HEIGHT * 0.7;

const selectSideStatue = (snapshot: MatchSnapshot) => snapshot.sideStatue;

// Estátua que tranca a rampa esquerda: quebrada, libera as paredes de mini-canhão.
export const SideStatue = () => (
	<StatueFigure
		select={selectSideStatue}
		hitEvent="sideStatueHit"
		scale={SIDE_STATUE_SCALE}
		lane="side"
	>
		<mesh position-y={BARRIER_HEIGHT / 2}>
			<boxGeometry args={[BARRIER_WIDTH, BARRIER_HEIGHT, PEDESTAL_DEPTH * 0.9]} />
			<meshStandardMaterial color={palette.stoneDeep} roughness={0.9} />
		</mesh>
	</StatueFigure>
);
