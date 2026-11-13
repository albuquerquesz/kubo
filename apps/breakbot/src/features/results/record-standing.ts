import type { BestRecord, MatchResult } from "#/features/progress";

const formatBest = (best: BestRecord) => `onda ${best.wave} · ★\u00A0${best.score}`;

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

// Quanto faltou para bater o recorde: primeiro em ondas, depois em pontos na mesma onda.
const describeGap = (stats: BestRecord, best: BestRecord) => {
	const waves = best.wave - stats.wave;
	if (waves > 0)
		return `${plural(waves, "faltou", "faltaram")} ${waves} ${plural(waves, "onda", "ondas")}`;
	const points = best.score - stats.score;
	if (points > 0)
		return `${plural(points, "faltou", "faltaram")} ${points} ${plural(points, "ponto", "pontos")}`;
	return "empatou com o recorde";
};

// Uma frase discreta sobre o recorde, abaixo dos números da partida.
export const standRecord = ({ stats, previous, newRecord }: MatchResult) => {
	if (previous === null) return "Primeira partida: agora é bater essa marca";
	if (newRecord) return `Recorde anterior: ${formatBest(previous)}`;
	return `Recorde: ${formatBest(previous)} · ${describeGap(stats, previous)}`;
};
