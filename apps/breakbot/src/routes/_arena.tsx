import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Arena } from "#/features/arena-render";
import { MatchTelemetry } from "#/features/telemetry";

const ArenaLayout = () => (
	<main className="relative mx-auto h-dvh max-w-120 overflow-hidden">
		<Arena />
		<MatchTelemetry />
		<Outlet />
	</main>
);

// O Canvas WebGL só existe no cliente; fica no layout para sobreviver à troca menu ↔ partida.
export const Route = createFileRoute("/_arena")({
	ssr: false,
	component: ArenaLayout,
});
