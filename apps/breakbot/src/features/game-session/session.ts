import { createMatch, type Match, type MatchMode, type MatchSnapshot } from "@breakbot/game-core";
import { create } from "zustand";
import type { MatchEntry } from "#/shared/telemetry";
import { entryFor } from "./match-entry";

// Identidade de uma partida: o que a telemetria e os reportes precisam saber dela.
export type MatchIdentity = {
	matchId: string;
	seed: number;
	mode: MatchMode;
	entry: MatchEntry;
};

type SessionStore = MatchIdentity & {
	match: Match;
	// Modo da última partida iniciada de propósito; nulo na partida criada no boot.
	lastStarted: MatchMode | null;
	halted: boolean;
};

type Headcount = {
	bots: number;
	troops: number;
};

export type MatchStatus = Pick<
	MatchSnapshot,
	"mode" | "phase" | "wave" | "score" | "lives" | "kills" | "coins" | "elapsed" | "charge"
> &
	Headcount;

const newSession = (mode: MatchMode, lastStarted: MatchMode | null) => {
	const seed = Date.now();
	return {
		match: createMatch({ seed, mode }),
		mode,
		seed,
		matchId: crypto.randomUUID(),
		entry: entryFor(lastStarted),
		lastStarted,
		halted: false,
	} satisfies SessionStore;
};

const readStatus = (snapshot: MatchSnapshot) =>
	({
		mode: snapshot.mode,
		phase: snapshot.phase,
		wave: snapshot.wave,
		score: snapshot.score,
		lives: snapshot.lives,
		kills: snapshot.kills,
		coins: snapshot.coins,
		elapsed: snapshot.elapsed,
		charge: snapshot.charge,
		bots: snapshot.bots.length,
		troops: snapshot.troops.length,
	}) satisfies MatchStatus;

export const useSession = create<SessionStore>()(() => newSession("attract", null));

export const currentMatch = () => useSession.getState().match;

export const readSnapshot = () => currentMatch().snapshot();

// A partida atual vista de fora: identidade mais o estado vivo do core.
export const describeMatch = () => {
	const { matchId, seed, mode, entry, match } = useSession.getState();
	return { matchId, seed, mode, entry, snapshot: match.snapshot() };
};

export type MatchDescription = ReturnType<typeof describeMatch>;

type MatchStartListener = (description: MatchDescription) => void;

export const subscribeMatchStarts = (listener: MatchStartListener) =>
	useSession.subscribe((session, previous) => {
		if (session.matchId === previous.matchId) return;
		listener(describeMatch());
	});

export const useMatchStatus = create<MatchStatus>()(() => readStatus(readSnapshot()));

export const syncStatus = () => useMatchStatus.setState(readStatus(readSnapshot()));

export const startMatch = (mode: MatchMode) => {
	const { lastStarted } = useSession.getState();
	useSession.setState({ ...newSession(mode, lastStarted), lastStarted: mode });
	syncStatus();
};

// Uma falha no passo da partida congela a simulação em vez de repetir o erro a cada frame.
export const haltMatch = () => useSession.setState({ halted: true });

export const isHalted = () => useSession.getState().halted;

export const useMatchHalted = () => useSession((session) => session.halted);

export const skipIntro = () => currentMatch().dispatch({ type: "skipIntro" });

export const fireChampion = () => currentMatch().dispatch({ type: "fireChampion" });
