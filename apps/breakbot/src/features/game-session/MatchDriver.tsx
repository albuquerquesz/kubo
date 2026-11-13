import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { consumeInputFrame } from "#/features/input";
import { reportSilentError } from "#/shared/telemetry";
import { publishFrame } from "./frame-samples";
import { publishMatchEvents } from "./match-events";
import { currentMatch, haltMatch, isHalted, syncStatus } from "./session";

// O HUD não precisa de 60 atualizações por segundo; 12 bastam e poupam re-render.
const STATUS_INTERVAL = 1 / 12;

const advance = (deltaSeconds: number) => {
	const match = currentMatch();
	const droppedSeconds = match.step(deltaSeconds, consumeInputFrame());
	publishMatchEvents(match.drainEvents());
	publishFrame({ deltaSeconds, droppedSeconds, snapshot: match.snapshot() });
};

// O loop do R3F agenda o próximo frame antes de rodar este: sem a guarda, uma exceção
// se repetiria a cada frame e a cena pararia de desenhar sem nenhum aviso.
const advanceGuarded = (deltaSeconds: number) => {
	try {
		advance(deltaSeconds);
	} catch (error) {
		haltMatch();
		syncStatus();
		reportSilentError("match_loop_failed", error);
	}
};

export const MatchDriver = () => {
	const sinceSync = useRef(0);

	useFrame((_, delta) => {
		if (isHalted()) return;
		advanceGuarded(delta);
		sinceSync.current += delta;
		if (sinceSync.current < STATUS_INTERVAL) return;
		sinceSync.current = 0;
		syncStatus();
	});

	return null;
};
