import { defaultBalance } from "@breakbot/game-core";
import { useMatchStatus } from "#/features/game-session";
import { formatClock } from "#/shared/format-clock";
import { CoinIcon } from "#/shared/ui/CoinIcon";

// Cor pela fração das vidas: verde acima da metade, amarelo acima de um quarto.
const livesTone = (lives: number) => {
	const share = lives / defaultBalance.maxLives;
	if (share > 0.5) return "text-go";
	if (share > 0.25) return "text-warn";
	return "text-alert";
};

// Moedas ganhas nesta partida (somam no fim de cada onda); a carteira total fica no menu.
const CoinBadge = () => {
	const coins = useMatchStatus((status) => status.coins);
	return (
		<div className="flex h-7 items-center gap-2 font-extrabold text-lg text-warn [text-shadow:0_0_6px_#05070a]">
			<CoinIcon />
			<span data-testid="coins">{coins}</span>
		</div>
	);
};

const Clock = () => {
	const elapsed = useMatchStatus((status) => status.elapsed);
	return (
		<div
			className="flex h-7 w-25 items-center justify-center font-extrabold text-lg text-bright tabular-nums [text-shadow:0_0_6px_#05070a]"
			data-testid="clock"
		>
			{formatClock(elapsed)}
		</div>
	);
};

const Lives = () => {
	const lives = useMatchStatus((status) => status.lives);
	return (
		<div className={`font-extrabold text-lg ${livesTone(lives)}`} data-testid="lives">
			♥ {Math.max(0, lives)}
		</div>
	);
};

// Some na tela de fim: moedas, tempo e vidas já aparecem no resumo da partida.
export const StatusBar = () => {
	const over = useMatchStatus((status) => status.phase === "over");
	if (over) return null;
	return (
		<div className="pointer-events-none absolute inset-x-3 top-2.5 z-20 flex items-center justify-between">
			<CoinBadge />
			<Clock />
			<Lives />
		</div>
	);
};
