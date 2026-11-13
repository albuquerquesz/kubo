import type { MatchState } from "./simulation";

export type MatchStats = Pick<MatchState, "wave" | "score" | "kills" | "coins" | "elapsed">;

export type Shot = { type: "shot"; x: number };
export type BotKilled = { type: "botKilled"; x: number; z: number };
export type TowerHit = { type: "towerHit"; x: number };
export type BotBreached = { type: "botBreached"; x: number; livesLost: number };
export type IntroSkipped = { type: "introSkipped"; introElapsed: number };
export type WaveStarted = { type: "waveStarted"; wave: number; horde: number };
export type WaveCleared = { type: "waveCleared"; wave: number; bonus: number };
export type LivesRestored = { type: "livesRestored"; amount: number };
export type CoinsEarned = { type: "coinsEarned"; wave: number; kills: number; coins: number };
export type WallHit = { type: "wallHit"; z: number; health: number };
export type WallBroken = { type: "wallBroken"; wave: number };
export type SidekickJoined = { type: "sidekickJoined"; slot: number; total: number };
export type BandCrossed = {
	type: "bandCrossed";
	band: number;
	multiplier: number;
	clones: number;
	x: number;
	z: number;
};
export type StatueHit = { type: "statueHit"; health: number };
export type StatueBroken = { type: "statueBroken"; wave: number };
export type SideStatueHit = { type: "sideStatueHit"; health: number };
export type SideStatueBroken = { type: "sideStatueBroken"; wave: number };
export type ChampionReleased = { type: "championReleased"; x: number; z: number };
export type GameOver = { type: "gameOver"; stats: MatchStats };

export type MatchEvent =
	| Shot
	| BotKilled
	| TowerHit
	| BotBreached
	| IntroSkipped
	| WaveStarted
	| WaveCleared
	| LivesRestored
	| CoinsEarned
	| WallHit
	| WallBroken
	| SidekickJoined
	| BandCrossed
	| StatueHit
	| StatueBroken
	| SideStatueHit
	| SideStatueBroken
	| ChampionReleased
	| GameOver;

export type MatchEventType = MatchEvent["type"];
