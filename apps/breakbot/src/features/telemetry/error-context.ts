import { describeMatch } from "#/features/game-session";

// Todo reporte leva onde o jogador estava: rota, modo, fase, onda e a seed para reproduzir no core.
export const readMatchContext = () => {
	const { matchId, seed, mode, snapshot } = describeMatch();
	return {
		route: window.location.pathname,
		mode,
		match_id: matchId,
		seed,
		phase: snapshot.phase,
		wave: snapshot.wave,
	};
};
