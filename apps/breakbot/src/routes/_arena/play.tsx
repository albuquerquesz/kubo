import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { fireChampion, skipIntro, startMatch, useMatchHalted } from "#/features/game-session";
import { Hud } from "#/features/hud";
import {
	type CommandKeys,
	InputSurface,
	useCommandKeys,
	useKeyboardControls,
} from "#/features/input";
import { ProgressSync } from "#/features/progress";
import { MatchHaltedScreen, ResultsScreen, useMatchResult } from "#/features/results";

const startPlaying = () => startMatch("play");

// Atalhos de teclado: G solta o gigante aliado quando a carga está cheia.
const commandKeys = { g: fireChampion } satisfies CommandKeys;

const PlayRoute = () => {
	const navigate = useNavigate();
	const result = useMatchResult();
	const halted = useMatchHalted();
	const toMenu = () => navigate({ to: "/" });
	useKeyboardControls();
	useCommandKeys(commandKeys);
	useEffect(startPlaying, []);

	return (
		<>
			<InputSurface onPress={skipIntro} />
			<Hud />
			<ProgressSync />
			{result && <ResultsScreen result={result} onReplay={startPlaying} onMenu={toMenu} />}
			{halted && <MatchHaltedScreen onReplay={startPlaying} onMenu={toMenu} />}
		</>
	);
};

export const Route = createFileRoute("/_arena/play")({ component: PlayRoute });
