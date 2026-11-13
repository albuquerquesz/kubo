import { defaultBalance, type SidekickJoined } from "@breakbot/game-core";
import { useState } from "react";
import { useMatchEvents, useMatchStatus } from "#/features/game-session";

// Canhão principal + mini-canhões.
const MAX_CANNONS = defaultBalance.maxSidekicks + 1;

export const SidekickBanner = () => {
	const [joined, setJoined] = useState<SidekickJoined | null>(null);
	const playing = useMatchStatus((status) => status.mode === "play");

	useMatchEvents((event) => {
		if (event.type !== "sidekickJoined") return;
		setJoined(event);
	});

	if (!joined || !playing) return null;
	return (
		<div
			key={joined.slot}
			className="pointer-events-none absolute inset-x-0 top-[50%] z-10 flex animate-banner flex-col items-center gap-1"
			onAnimationEnd={() => setJoined(null)}
		>
			<p className="animate-glitch font-extrabold text-3xl text-sky [text-shadow:0_0_8px_#05070a]">
				+1 CANHÃO
			</p>
			<p className="font-bold text-bright text-xs">
				{joined.total} de {MAX_CANNONS} canhões
			</p>
		</div>
	);
};
