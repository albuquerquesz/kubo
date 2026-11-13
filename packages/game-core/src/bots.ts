import { CROWD_CELL_WIDTH, crowdAt } from "./collision";
import type { Bot } from "./entities";
import { funnelBoundsAt } from "./funnel";
import { isScoring, type Simulation } from "./simulation";
import { BREACH_Z, botBounds, clamp, type HorizontalRange } from "./track";

const BOT_RADIUS = 0.03;
const GROWTH_RATE = 2.2;
const ACTIVE_GROWTH = 0.3;
const SWAY = 0.02;

export const remainingBotRoom = (simulation: Simulation) =>
	simulation.balance.botCap - simulation.state.bots.length;

export type BotPlacement = Pick<Bot, "x" | "z" | "lane" | "growth">;

export const spawnBot = (simulation: Simulation, placement: BotPlacement) => {
	const { random, state } = simulation;
	if (remainingBotRoom(simulation) <= 0) return;
	state.bots.push({
		...placement,
		radius: BOT_RADIUS,
		health: 1,
		animationOffset: random.between(0, Math.PI * 2),
		dead: false,
		speed: state.waveSettings.speed,
		drift: 0,
	});
};

export const growBots = (bots: Bot[], seconds: number) => {
	for (const bot of bots) {
		bot.growth = Math.min(1, bot.growth + seconds * GROWTH_RATE);
	}
};

const breach = (simulation: Simulation, bot: Bot) => {
	bot.dead = true;
	const livesLost = isScoring(simulation.state) ? 1 : 0;
	simulation.state.lives -= livesLost;
	simulation.events.push({ type: "botBreached", x: bot.x, livesLost });
};

// O funil fecha aos poucos: o robô desliza pela barricada até o corredor e não sai mais dele.
const freeAt = (simulation: Simulation, bot: Bot) =>
	funnelBoundsAt(simulation.balance.funnel, bot.z);

const widthOf = (range: HorizontalRange) => range.right - range.left;

// Mantém a posição relativa do robô na largura livre: o funil aperta a horda por igual em vez
// de empilhar todo mundo colado na cerca, onde a tropa não dá conta de chegar.
const squeeze = (x: number, from: HorizontalRange, to: HorizontalRange) =>
	to.left + ((x - from.left) / widthOf(from)) * widthOf(to);

// Quantas células de cada lado o robô enxerga: além da vizinha, a camada de trás também sente
// o buraco e vem junto.
const CROWD_REACH = 2;
// Rapidez (por segundo) com que o deslize lateral alcança o alvo: acelera e freia aos poucos,
// sem tranco quando a contagem das células muda de um tick para o outro.
const DRIFT_EASE = 3;

const isInside = (x: number, free: HorizontalRange) => x >= free.left && x <= free.right;

// Média de robôs por célula de um lado, até a cerca. Sem célula livre daquele lado (colado na
// cerca), conta como igual à do próprio robô: o lado de fora não é vazio para onde escorrer.
const crowdToward = (simulation: Simulation, bot: Bot, free: HorizontalRange, side: number) => {
	let crowd = 0;
	let cells = 0;
	for (let step = 1; step <= CROWD_REACH; step++) {
		const x = bot.x + side * step * CROWD_CELL_WIDTH;
		if (!isInside(x, free)) break;
		crowd += crowdAt(simulation, x, bot.z);
		cells += 1;
	}
	if (cells === 0) return crowdAt(simulation, bot.x, bot.z);
	return crowd / cells;
};

// Quanto um lado está mais vazio que a célula do próprio robô.
const pullToward = (simulation: Simulation, bot: Bot, free: HorizontalRange, side: number) =>
	Math.max(0, crowdAt(simulation, bot.x, bot.z) - crowdToward(simulation, bot, free, side));

// A horda escorre para os vazios: o robô desliza para o lado mais vazio que a própria célula.
// O buraco que o canhão abre no meio se fecha e o bolo colado na cerca se espalha.
const spread = (simulation: Simulation, bot: Bot, free: HorizontalRange, seconds: number) => {
	const own = Math.max(1, crowdAt(simulation, bot.x, bot.z));
	const right = pullToward(simulation, bot, free, 1);
	const left = pullToward(simulation, bot, free, -1);
	const imbalance = Math.max(-1, Math.min(1, (right - left) / own));
	const target = imbalance * simulation.balance.hordeFillSpeed;
	bot.drift += (target - bot.drift) * Math.min(1, DRIFT_EASE * seconds);
	return bot.drift * seconds;
};

const moveBot = (simulation: Simulation, bot: Bot, seconds: number) => {
	if (bot.growth < ACTIVE_GROWTH) return;
	const before = freeAt(simulation, bot);
	bot.z -= bot.speed * seconds;
	const after = freeAt(simulation, bot);
	const sway = Math.sin(simulation.state.elapsed * 2 + bot.animationOffset) * SWAY * seconds;
	const drift = sway + spread(simulation, bot, before, seconds);
	bot.x = clamp(clamp(squeeze(bot.x + drift, before, after), botBounds), after);
	if (bot.z > BREACH_Z) return;
	breach(simulation, bot);
};

export const moveBots = (simulation: Simulation, seconds: number) => {
	for (const bot of simulation.state.bots) {
		if (bot.dead) continue;
		moveBot(simulation, bot, seconds);
	}
};

export const removeFallenBots = (simulation: Simulation) => {
	simulation.state.bots = simulation.state.bots.filter((bot) => !bot.dead);
};
