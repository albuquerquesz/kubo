import { defaultBalance, type MatchSnapshot } from "@breakbot/game-core";
import { HALF_WIDTH } from "../world";
import { StatueFigure } from "./StatueFigure";

// O modelo tem 1 de largura no pedestal; escala até a largura de colisão da estátua.
const STATUE_SCALE = defaultBalance.statueWidth * HALF_WIDTH;

const selectStatue = (snapshot: MatchSnapshot) => snapshot.statue;

// Estátua grande no deck da rampa direita.
export const Statue = () => (
	<StatueFigure select={selectStatue} hitEvent="statueHit" scale={STATUE_SCALE} lane="rightSide" />
);
