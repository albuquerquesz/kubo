import { readSnapshot, useMatchEvents } from "#/features/game-session";
import { addLifetimeShots, creditCoins } from "./progress-store";

// Credita na carteira cada fechamento de onda e soma os tiros da partida ao total da vida.
// O core não emite moedas nem fim de jogo no modo attract, então a demo não conta.
export const ProgressSync = () => {
	useMatchEvents((event) => {
		if (event.type === "coinsEarned") creditCoins(event.coins);
		if (event.type === "gameOver") addLifetimeShots(readSnapshot().shots);
	});
	return null;
};
