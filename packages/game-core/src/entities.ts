import type { Lane } from "./track";

export type Body = {
	x: number;
	z: number;
	lane: Lane;
	radius: number;
	health: number;
	animationOffset: number;
	dead: boolean;
};

export type Troop = Body & {
	velocityX: number;
	velocityZ: number;
	// Índice da próxima faixa multiplicadora em z crescente: cada faixa dispara uma vez por boneco.
	nextBand: number;
	// Gigante aliado: não multiplica nas faixas ×N.
	champion: boolean;
	// Segundos restantes do destaque de multiplicação (0 = normal); o render anima o boneco com ele.
	boost: number;
};

export type Bot = Body & {
	speed: number;
	growth: number;
	// Velocidade lateral atual (x/s) com que o robô escorre para os vazios da horda.
	drift: number;
};

type WallVitality = {
	maxHealth: number;
};

// Parede azul parada na rampa esquerda: ocupa a rampa inteira, então só precisa de z.
export type Wall = Pick<Body, "z" | "health" | "dead"> & WallVitality;

// Faixa roxa ×N parada no corredor, de muro a muro: cada boneco do corredor que passa vira N.
export type Band = {
	z: number;
	multiplier: number;
};

// Estátua de pedra: a da direita, na rampa direita, dá o upgrade do canhão (efeito a definir);
// a da fileira só tranca as paredes de mini-canhão da rampa esquerda.
export type Statue = Pick<Body, "x" | "z" | "health" | "dead"> & WallVitality;

// Mini-canhão ganho ao quebrar uma parede: ocupa um slot da formação e atira junto.
export type Sidekick = {
	slot: number;
	recoil: number;
	cooldown: number;
};

export type Cannon = {
	x: number;
	recoil: number;
};
