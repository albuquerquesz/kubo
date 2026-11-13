export const roundTo = (value: number, decimals: number) => {
	const scale = 10 ** decimals;
	return Math.round(value * scale) / scale;
};
