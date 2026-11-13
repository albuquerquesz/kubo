import type { Band } from "./entities";
import type { Funnel } from "./funnel";
import type { HordeLayout } from "./horde-formation";
import { sidekickFormation } from "./sidekick-formation";

// Curva de dificuldade: a horda vem em fluxo contínuo (`hordeStream`), então a onda só acelera
// a marcha (1.52/s na onda 1, até 3.5/s). `horde` é uma massa extra solta no início da onda,
// zerada no jogo: o fluxo já mantém a pista cheia.
const waveSettings = (wave: number) => ({
	horde: 0,
	speed: Math.min(3.5, 1.4 + wave * 0.12),
});

const wallHealth = (wave: number) => 20 + wave * 10;

// Estátua da fileira: pequena (como o "5" da referência), cresce devagar com a onda.
const sideStatueHealth = (wave: number) => 8 + wave * 4;

// As ondas se emendam sem pausa: a duração só marca de quanto em quanto tempo a marcha acelera.
const waveDuration = (wave: number) => Math.min(45, 30 + wave * 1.5);

// Estátua da direita é um objetivo difícil: 500 na primeira onda, +100 por onda, até 1000.
const statueHealth = (wave: number) => Math.min(1000, 400 + wave * 100);

// Faixas em z crescente, cada uma fechando o corredor inteiro, as duas perto do canhão: a ×2
// logo na frente dele e a ×3 um pouco mais adiante.
const bandLayout = [
	{ z: 5, multiplier: 2 },
	{ z: 10, multiplier: 3 },
] satisfies Band[];

// Funil logo na frente da horda: concentra os robôs no corredor (`laneBounds.main`), que segue
// até o canhão entre as rampas. As rampas acabam na face (mouthZ).
const funnel = {
	wideZ: 24,
	neckZ: 19,
	mouthZ: 14,
} satisfies Funnel;

// Mega horda: fileiras a cada 0.62 de profundidade deixam a massa mais compacta.
// São 24 robôs na largura toda mais 12 no corredor (~1800 no início), e o fluxo repõe
// as fileiras no fundo. O reforço no corredor deixa o meio, onde o canhão mais atira, cheio.
const hordeLayout = {
	columns: 24,
	corridorColumns: 12,
	rowGap: 0.62,
	frontZ: 25,
} satisfies HordeLayout;

export const defaultBalance = {
	startingLives: 30,
	maxLives: 30,
	livesRestored: 5,
	restoreLivesEveryWaves: 5,
	introDuration: 2.1,
	troopSpeed: 8.5,
	// Um tiro a cada 0.25s; o mini-canhão continua em 1 tiro por segundo (`sidekickFireInterval`).
	fireInterval: 0.25,
	cannonSpeed: 1.8,
	troopCap: 900,
	// Folga para a área atrás do funil lotada mais o corredor cheio de robôs descendo.
	botCap: 3000,
	clearBonusPerWave: 25,
	// Dano em área: a tropa que derruba um robô leva junto os vizinhos mais próximos,
	// até este total de robôs por impacto, dentro deste raio (em unidades da pista, z achatado).
	blastTargets: 8,
	blastRadius: 0.16,
	// Moedas creditadas no fim de cada onda: uma a cada tantos robôs derrubados nela.
	killsPerCoin: 10,
	minimumWaveSeconds: 5,
	attractWaves: 3,
	// Fila de 3 paredes paradas na rampa esquerda, entre a estátua da fileira (z 4) e a face
	// da barricada (z 14); nasce com cada estátua e só leva dano depois que ela cai.
	wallRowZ: [7, 9.5, 12],
	wallHealth,
	bandLayout,
	funnel,
	hordeLayout,
	hordeStream: true,
	// A horda escorre para os vazios: robô com o lado mais cheio desliza (até x/s) para o mais
	// vazio, acelerando aos poucos, e o buraco que o canhão abre no meio se fecha.
	hordeFillSpeed: 0.9,
	// Mini-canhões: até 14 em cunha atrás do canhão (15 canhões), na metade da cadência dele.
	maxSidekicks: sidekickFormation.length,
	sidekickFireInterval: 1,
	// Ao multiplicar: duração do destaque nos bonecos e o leque lateral (x/s) em que se abrem.
	multiplyBoost: 0.45,
	cloneSpread: 0.35,
	// Na rampa direita, logo antes da face da barricada: mirar à direita do muro acerta a estátua.
	statueZ: 11,
	statueWidth: 0.36,
	statueHealth,
	sideStatueZ: 4,
	sideStatueHealth,
	// Carga: cada tiro do canhão principal soma 1 até encher e liberar um gigante aliado.
	chargeCapacity: 60,
	// Gigante aliado: tropa grande que troca HP com a horda e pontua mais na torre.
	championHealth: 40,
	championRadius: 0.075,
	championSpeed: 20,
	championTowerPoints: 12,
	waveSettings,
	waveDuration,
};

export type Balance = typeof defaultBalance;
export type WaveSettings = ReturnType<Balance["waveSettings"]>;
