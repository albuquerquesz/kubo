import { defaultBalance } from "@breakbot/game-core";
import { WallBlock } from "./WallBlock";

// Um bloco para cada parede da fila parada atrás da estátua da fileira.
const WALL_SLOTS = defaultBalance.wallRowZ.map((_, index) => index);

export const Walls = () => (
	<>
		{WALL_SLOTS.map((index) => (
			<WallBlock key={index} index={index} />
		))}
	</>
);
