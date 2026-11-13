import type { MatchMode } from "@breakbot/game-core";
import type { MatchEntry } from "#/shared/telemetry";

const entryAfter = { attract: "menu", play: "replay" } satisfies Record<MatchMode, MatchEntry>;

// Primeira partida da página: recarga (F5 em /play) ou link direto.
const pageEntry = () => {
	if (typeof PerformanceNavigationTiming === "undefined") return "direct";
	const [navigation] = performance.getEntriesByType("navigation");
	const reloaded =
		navigation instanceof PerformanceNavigationTiming && navigation.type === "reload";
	return reloaded ? "reload" : "direct";
};

export const entryFor = (lastStarted: MatchMode | null) =>
	lastStarted === null ? pageEntry() : entryAfter[lastStarted];
