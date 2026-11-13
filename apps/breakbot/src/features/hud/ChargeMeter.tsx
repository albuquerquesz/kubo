import { defaultBalance } from "@breakbot/game-core";
import { fireChampion, useMatchStatus } from "#/features/game-session";

const { chargeCapacity } = defaultBalance;

// A tecla G faz o mesmo (atalho registrado na rota de jogo).
const ChampionButton = () => (
	<button
		type="button"
		className="pointer-events-auto animate-pulse-go rounded-full border-2 border-warn bg-ink/90 px-5 py-2 font-extrabold text-lg text-warn [text-shadow:0_0_8px_#e3b341]"
		data-testid="champion-button"
		onClick={fireChampion}
	>
		⚡ GIGANTE
	</button>
);

// Com a carga cheia, aparece o botão que solta o gigante aliado.
export const ChargeMeter = () => {
	const ready = useMatchStatus(
		(status) =>
			status.mode === "play" && status.phase === "playing" && status.charge >= chargeCapacity,
	);
	if (!ready) return null;
	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center">
			<ChampionButton />
		</div>
	);
};
