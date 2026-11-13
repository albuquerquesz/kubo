import type { SideStatueBroken, StatueBroken } from "@breakbot/game-core";
import { useState } from "react";
import { useMatchEvents, useMatchStatus } from "#/features/game-session";

type BrokenStatue = StatueBroken | SideStatueBroken;

type BannerCopy = {
	title: string;
	detail: string;
};

// O efeito dos upgrades ainda vai ser definido (issue #17); por ora o banner só anuncia.
const copyByStatue = {
	statueBroken: { title: "★ UPGRADE DO CANHÃO", detail: "Canhão melhorado em breve" },
	sideStatueBroken: { title: "RAMPA LIBERADA", detail: "Quebre as paredes e ganhe canhões" },
} satisfies Record<BrokenStatue["type"], BannerCopy>;

export const UpgradeBanner = () => {
	const [broken, setBroken] = useState<BrokenStatue | null>(null);
	const playing = useMatchStatus((status) => status.mode === "play");

	useMatchEvents((event) => {
		if (event.type !== "statueBroken" && event.type !== "sideStatueBroken") return;
		setBroken(event);
	});

	if (!broken || !playing) return null;
	const copy = copyByStatue[broken.type];
	return (
		<div
			key={`${broken.type}:${broken.wave}`}
			className="pointer-events-none absolute inset-x-0 top-[36%] z-10 flex animate-banner flex-col items-center gap-1"
			onAnimationEnd={() => setBroken(null)}
		>
			<p className="font-extrabold text-3xl text-warn [text-shadow:0_0_8px_#05070a]">
				{copy.title}
			</p>
			<p className="font-bold text-bright text-xs">{copy.detail}</p>
		</div>
	);
};
