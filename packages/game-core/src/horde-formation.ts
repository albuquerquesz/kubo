import { remainingBotRoom, spawnBot } from "./bots";
import type { Simulation } from "./simulation";
import { botBounds, type HorizontalRange, laneBounds, TRACK_LENGTH } from "./track";

// Mega horda que nasce atrás do funil, na largura toda da área da horda, e marcha inteira.
export type HordeLayout = {
	columns: number;
	// Robôs a mais em cada fileira do fluxo, espalhados só na largura do corredor.
	corridorColumns: number;
	rowGap: number;
	frontZ: number;
};

type HordeFormation = {
	rows: number;
	rowGap: number;
};

export const HORDE_BACK_Z = TRACK_LENGTH - 4;
// Fileiras brotam em sequência, da frente para trás.
const ROW_GROWTH_DELAY = 0.03;
const DEPTH_JITTER = 0.15;
const SIDE_JITTER = 0.012;

// Hordas que não cabem até o fundo se compactam, encurtando o espaço entre fileiras.
const formationFor = (layout: HordeLayout, size: number) => {
	const rows = Math.ceil(size / layout.columns);
	const depth = HORDE_BACK_Z - layout.frontZ;
	return {
		rows,
		rowGap: Math.min(layout.rowGap, depth / Math.max(1, rows)),
	} satisfies HordeFormation;
};

const columnShare = (columns: number, column: number) =>
	columns > 1 ? column / (columns - 1) : 0.5;

type RankSlot = {
	span: HorizontalRange;
	columns: number;
	column: number;
};

const spawnRankBot = (simulation: Simulation, slot: RankSlot, z: number, growth: number) => {
	const { random } = simulation;
	const { span, columns, column } = slot;
	const share = columnShare(columns, column);
	spawnBot(simulation, {
		x: span.left + share * (span.right - span.left) + random.between(-SIDE_JITTER, SIDE_JITTER),
		z: z + random.between(-DEPTH_JITTER, DEPTH_JITTER),
		lane: "main",
		growth: growth - random.between(0, 0.15),
	});
};

const spawnHordeBot = (simulation: Simulation, formation: HordeFormation, index: number) => {
	const { columns, frontZ } = simulation.balance.hordeLayout;
	const row = Math.floor(index / columns);
	spawnRankBot(
		simulation,
		{ span: botBounds, columns, column: index % columns },
		frontZ + row * formation.rowGap,
		-row * ROW_GROWTH_DELAY,
	);
};

// Uma fileira inteira, na largura toda da área da horda, mais o reforço na largura do corredor:
// o meio, onde o canhão mais atira, chega mais cheio.
const spawnRank = (simulation: Simulation, z: number, growth: number) => {
	const { columns, corridorColumns } = simulation.balance.hordeLayout;
	for (let column = 0; column < columns; column++) {
		spawnRankBot(simulation, { span: botBounds, columns, column }, z, growth);
	}
	for (let column = 0; column < corridorColumns; column++) {
		const slot = { span: laneBounds.main, columns: corridorColumns, column };
		spawnRankBot(simulation, slot, z, growth);
	}
};

export const spawnHorde = (simulation: Simulation, size: number) => {
	const count = Math.min(size, remainingBotRoom(simulation));
	const formation = formationFor(simulation.balance.hordeLayout, count);
	for (let index = 0; index < count; index++) spawnHordeBot(simulation, formation, index);
};

// Fluxo contínuo: a partida começa com a área atrás das barricadas lotada, da frente do funil
// até o fundo, e uma fileira nova nasce no fundo sempre que a última avança um espaçamento.
// Assim a pista nunca esvazia e as ondas se emendam com os robôs ainda chegando.
export const fillHordeStream = (simulation: Simulation) => {
	const { balance, state } = simulation;
	if (!balance.hordeStream) return;
	const { frontZ, rowGap } = balance.hordeLayout;
	const rows = Math.floor((HORDE_BACK_Z - frontZ) / rowGap) + 1;
	for (let row = 0; row < rows; row++) {
		spawnRank(simulation, frontZ + row * rowGap, -row * ROW_GROWTH_DELAY);
	}
	state.streamTailZ = frontZ + (rows - 1) * rowGap;
};

export const advanceHordeStream = (simulation: Simulation, seconds: number) => {
	const { balance, state } = simulation;
	if (!balance.hordeStream) return;
	const { rowGap } = balance.hordeLayout;
	state.streamTailZ -= state.waveSettings.speed * seconds;
	while (state.streamTailZ + rowGap <= HORDE_BACK_Z) {
		state.streamTailZ += rowGap;
		spawnRank(simulation, state.streamTailZ, 0);
	}
};
