import type { MatchStats } from "@breakbot/game-core";
import type { ReactNode } from "react";
import { delayStyle } from "#/shared/animation-delay";
import { formatClock } from "#/shared/format-clock";
import { CoinIcon } from "#/shared/ui/CoinIcon";
import { reveal } from "./reveal";
import { useCountUp } from "./use-count-up";

type StatTilesProps = Pick<MatchStats, "wave" | "score" | "elapsed" | "coins">;

type TileTone = "plain" | "gold";

type StatTileProps = {
	icon: ReactNode;
	label: string;
	value: string;
	order: number;
	testId?: string;
	tone?: TileTone;
};

const tileTones = {
	plain: "text-bright",
	gold: "text-warn",
} satisfies Record<TileTone, string>;

const tileDelay = (order: number) => reveal.tiles + order * reveal.tileStep;

const StatTile = ({ icon, label, value, order, testId, tone = "plain" }: StatTileProps) => (
	<div
		className={`flex animate-rise flex-col items-center gap-1 ${tileTones[tone]}`}
		style={delayStyle(tileDelay(order))}
	>
		<span className="flex h-6 items-center text-lg leading-none">{icon}</span>
		<span className="font-extrabold text-xl tabular-nums leading-none" data-testid={testId}>
			{value}
		</span>
		<span className="font-bold text-[10px] text-mute tracking-wider">{label}</span>
	</div>
);

// Números secundários da partida lado a lado, sem caixa, revelados um a um.
export const StatTiles = ({ wave, score, elapsed, coins }: StatTilesProps) => {
	const shownWave = useCountUp(wave, tileDelay(0));
	const shownScore = useCountUp(score, tileDelay(1));
	const shownElapsed = useCountUp(elapsed, tileDelay(2));
	const shownCoins = useCountUp(coins, tileDelay(3));
	return (
		<div className="grid w-full grid-cols-4 gap-1">
			<StatTile icon="🌊" label="ONDA" value={String(shownWave)} order={0} testId="result-wave" />
			<StatTile icon="★" label="PONTOS" value={String(shownScore)} order={1} tone="gold" />
			<StatTile icon="⏱️" label="TEMPO" value={formatClock(shownElapsed)} order={2} />
			<StatTile
				icon={<CoinIcon className="size-5" />}
				label="MOEDAS"
				value={`+${shownCoins}`}
				order={3}
				tone="gold"
			/>
		</div>
	);
};
