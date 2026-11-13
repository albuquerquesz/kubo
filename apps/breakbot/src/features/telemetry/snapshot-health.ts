import { type Body, defaultBalance, type MatchSnapshot } from "@breakbot/game-core";

type HealthCheck = [name: string, healthy: (snapshot: MatchSnapshot) => boolean];

type Position = Pick<Body, "x" | "z">;

// Amostra pequena: checar as ~2400 entidades a cada inspeção custaria frame.
const ENTITY_SAMPLE = 32;

const isPlaced = (body: Position) => Number.isFinite(body.x) && Number.isFinite(body.z);

const sampleOf = (bodies: readonly Position[]) => bodies.slice(0, ENTITY_SAMPLE).every(isPlaced);

const checks = [
	["cannon", (snapshot) => Number.isFinite(snapshot.cannon.x)],
	["clock", (snapshot) => Number.isFinite(snapshot.elapsed)],
	["lives", (snapshot) => snapshot.lives >= 0 && snapshot.lives <= defaultBalance.maxLives],
	["botCap", (snapshot) => snapshot.bots.length <= defaultBalance.botCap],
	["troopCap", (snapshot) => snapshot.troops.length <= defaultBalance.troopCap],
	["bots", (snapshot) => sampleOf(snapshot.bots)],
	["troops", (snapshot) => sampleOf(snapshot.troops)],
] satisfies HealthCheck[];

// Invariantes que, quebradas, deixam o jogo rodando mas sem sentido (tropa sem colidir, HUD com lixo).
export const findStateProblems = (snapshot: MatchSnapshot) =>
	checks.filter(([, healthy]) => !healthy(snapshot)).map(([name]) => name);
