import type { CoinsEarned } from "@breakbot/game-core";
import { useState } from "react";
import { useMatchEvents } from "#/features/game-session";
import { CoinIcon } from "#/shared/ui/CoinIcon";

// "+N" que sobe ao lado da carteira quando a onda fecha a conta das moedas.
export const CoinPop = () => {
	const [earned, setEarned] = useState<CoinsEarned | null>(null);

	useMatchEvents((event) => {
		if (event.type !== "coinsEarned") return;
		setEarned(event);
	});

	if (!earned) return null;
	return (
		<div
			key={earned.wave}
			className="pointer-events-none absolute top-11 left-3 z-20 flex animate-coin-pop items-center gap-1.5 font-extrabold text-sm text-warn [text-shadow:0_0_6px_#05070a]"
			onAnimationEnd={() => setEarned(null)}
		>
			<CoinIcon />+{earned.coins}
		</div>
	);
};
