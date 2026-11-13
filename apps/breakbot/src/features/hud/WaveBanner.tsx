import type { WaveStarted } from "@breakbot/game-core";
import { useState } from "react";
import { useMatchEvents } from "#/features/game-session";

type ExtraHordeProps = Pick<WaveStarted, "horde">;

// Com o fluxo contínuo a onda não solta massa nova; só mostra quando houver.
const ExtraHorde = ({ horde }: ExtraHordeProps) => {
	if (horde <= 0) return null;
	return <p className="font-bold text-mute text-xs">+{horde} robôs</p>;
};

export const WaveBanner = () => {
	const [banner, setBanner] = useState<WaveStarted | null>(null);

	useMatchEvents((event) => {
		if (event.type !== "waveStarted" || event.wave <= 1) return;
		setBanner(event);
	});

	if (!banner) return null;
	return (
		<div
			key={banner.wave}
			className="pointer-events-none absolute inset-x-0 top-[33%] z-10 flex animate-banner flex-col items-center gap-2"
			onAnimationEnd={() => setBanner(null)}
		>
			<p className="animate-glitch font-extrabold text-[34px] text-bright [text-shadow:0_0_8px_#05070a]">
				ONDA {banner.wave}
				<span className="animate-blink">▌</span>
			</p>
			<ExtraHorde horde={banner.horde} />
		</div>
	);
};
