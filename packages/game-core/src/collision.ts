import type { Body, Bot, Troop } from "./entities";
import { awardPoints, type Simulation } from "./simulation";
import { TRACK_LENGTH } from "./track";

// Grade espacial uniforme: cada tropa só testa os robôs das células vizinhas.
const CELL_WIDTH = 0.1;
const CELL_DEPTH = 1.2;
const X_OFFSET = 1.2;
const Z_OFFSET = 15;
const GRID_COLUMNS = 24;
const GRID_ROWS = Math.ceil((TRACK_LENGTH + 30) / CELL_DEPTH);
// A pista é muito mais longa que larga; achatar z deixa a colisão parecida com o que se vê.
const DEPTH_SQUASH = 0.075;

const cellIndex = (limit: number, value: number) =>
	Math.min(limit - 1, Math.max(0, Math.floor(value)));
const columnOf = (x: number) => cellIndex(GRID_COLUMNS, (x + X_OFFSET) / CELL_WIDTH);
const rowOf = (z: number) => cellIndex(GRID_ROWS, (z + Z_OFFSET) / CELL_DEPTH);

export const createBotGrid = () =>
	Array.from({ length: GRID_COLUMNS * GRID_ROWS }, () => new Array<Bot>());

const fillGrid = (grid: Bot[][], bots: Bot[]) => {
	for (const cell of grid) cell.length = 0;
	for (const bot of bots) {
		if (bot.dead) continue;
		grid[rowOf(bot.z) * GRID_COLUMNS + columnOf(bot.x)]?.push(bot);
	}
};

const squaredDistance = (from: Body, to: Body) => {
	const distanceX = to.x - from.x;
	const distanceZ = (to.z - from.z) * DEPTH_SQUASH;
	return distanceX * distanceX + distanceZ * distanceZ;
};

const overlaps = (troop: Troop, bot: Bot) => {
	const reach = bot.radius + troop.radius;
	return squaredDistance(troop, bot) < reach * reach;
};

const canEngage = (troop: Troop, bot: Bot) =>
	!troop.dead && !bot.dead && bot.lane === troop.lane && overlaps(troop, bot);

const defeat = (simulation: Simulation, bot: Bot) => {
	bot.dead = true;
	simulation.state.kills += 1;
	simulation.state.waveKills += 1;
	awardPoints(simulation, 1);
	simulation.events.push({ type: "botKilled", x: bot.x, z: bot.z });
};

// Largura de uma célula da grade: a distância em x até a célula vizinha.
export const CROWD_CELL_WIDTH = CELL_WIDTH;

// Robôs vivos na célula de um ponto da pista, contados no último tick da colisão.
export const crowdAt = (simulation: Simulation, x: number, z: number) =>
	simulation.botGrid[rowOf(z) * GRID_COLUMNS + columnOf(x)]?.length ?? 0;

const isInsideGrid = (row: number, column: number) =>
	row >= 0 && row < GRID_ROWS && column >= 0 && column < GRID_COLUMNS;

type CellVisitor = (bot: Bot) => void;

// Quantas células em volta de um ponto entram na busca, para cada lado.
type GridReach = {
	rows: number;
	columns: number;
};

const TROOP_REACH = { rows: 1, columns: 2 } satisfies GridReach;

// Células que cobrem um raio inteiro (em unidades da pista, z achatado) a partir de qualquer ponto.
const reachOf = (radius: number) => ({
	rows: Math.ceil(radius / DEPTH_SQUASH / CELL_DEPTH),
	columns: Math.ceil(radius / CELL_WIDTH),
});

// Percorre os robôs vivos das células em volta de um ponto da pista.
const visitNeighbourhood = (
	simulation: Simulation,
	origin: Body,
	reach: GridReach,
	visit: CellVisitor,
) => {
	const row = rowOf(origin.z);
	const column = columnOf(origin.x);
	for (let rowOffset = -reach.rows; rowOffset <= reach.rows; rowOffset++) {
		for (let columnOffset = -reach.columns; columnOffset <= reach.columns; columnOffset++) {
			if (!isInsideGrid(row + rowOffset, column + columnOffset)) continue;
			const cell =
				simulation.botGrid[(row + rowOffset) * GRID_COLUMNS + column + columnOffset] ?? [];
			for (const bot of cell) visit(bot);
		}
	}
};

const isBlastTarget = (origin: Bot, radius: number, bot: Bot) =>
	bot !== origin &&
	!bot.dead &&
	bot.lane === origin.lane &&
	squaredDistance(origin, bot) < radius * radius;

const byDistanceFrom = (origin: Bot) => (first: Bot, second: Bot) =>
	squaredDistance(origin, first) - squaredDistance(origin, second);

// O impacto que derruba um robô estilhaça nos vizinhos mais próximos, um ponto de vida em cada.
const blast = (simulation: Simulation, origin: Bot) => {
	const { blastRadius, blastTargets } = simulation.balance;
	const targets = new Array<Bot>();
	visitNeighbourhood(simulation, origin, reachOf(blastRadius), (bot) => {
		if (isBlastTarget(origin, blastRadius, bot)) targets.push(bot);
	});
	for (const bot of targets.sort(byDistanceFrom(origin)).slice(0, blastTargets - 1)) {
		bot.health -= 1;
		if (bot.health <= 0) defeat(simulation, bot);
	}
};

const engage = (simulation: Simulation, troop: Troop, bot: Bot) => {
	if (!canEngage(troop, bot)) return;
	const damage = Math.min(troop.health, bot.health);
	troop.health -= damage;
	bot.health -= damage;
	troop.dead = troop.health <= 0;
	if (bot.health > 0) return;
	defeat(simulation, bot);
	blast(simulation, bot);
};

const engageNeighbourhood = (simulation: Simulation, troop: Troop) =>
	visitNeighbourhood(simulation, troop, TROOP_REACH, (bot) => engage(simulation, troop, bot));

export const resolveCollisions = (simulation: Simulation) => {
	fillGrid(simulation.botGrid, simulation.state.bots);
	for (const troop of simulation.state.troops) {
		if (troop.dead) continue;
		engageNeighbourhood(simulation, troop);
	}
};
