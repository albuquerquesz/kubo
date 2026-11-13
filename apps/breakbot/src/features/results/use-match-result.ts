import { useEffect, useState } from "react";
import { useMatchEvents, useMatchStatus } from "#/features/game-session";
import { type MatchResult, recordResult } from "#/features/progress";

// Pausa dramática entre o último robô passar e a tela de fim (igual ao protótipo).
const REVEAL_DELAY_MS = 1100;

export const useMatchResult = () => {
	const [result, setResult] = useState<MatchResult | null>(null);
	const [revealed, setRevealed] = useState(false);
	const over = useMatchStatus((status) => status.phase === "over");

	useMatchEvents((event) => {
		if (event.type !== "gameOver") return;
		setResult(recordResult(event.stats));
	});

	useEffect(() => {
		setRevealed(false);
		if (!over) return;
		const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [over]);

	return revealed ? result : null;
};
