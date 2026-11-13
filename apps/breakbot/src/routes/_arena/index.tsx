import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { startMatch } from "#/features/game-session";
import { MenuScreen } from "#/features/menu";

const MenuRoute = () => {
	const navigate = useNavigate();
	useEffect(() => startMatch("attract"), []);
	return <MenuScreen onPlay={() => navigate({ to: "/play" })} />;
};

export const Route = createFileRoute("/_arena/")({ component: MenuRoute });
