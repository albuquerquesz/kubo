// mulberry32: rápido, com seed e bom o bastante para jogo.
export const createRandom = (seed: number) => {
	let state = seed >>> 0;

	const next = () => {
		state = (state + 0x6d2b79f5) >>> 0;
		const mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		const scrambled = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((scrambled ^ (scrambled >>> 14)) >>> 0) / 4294967296;
	};

	const between = (minimum: number, maximum: number) => minimum + next() * (maximum - minimum);

	return { next, between };
};

export type Random = ReturnType<typeof createRandom>;
