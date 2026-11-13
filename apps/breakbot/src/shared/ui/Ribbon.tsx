import type { PropsWithChildren } from "react";

export type RibbonTone = "alert" | "gold" | "go";

type RibbonStyle = {
	tone: RibbonTone;
};

type RibbonProps = PropsWithChildren<RibbonStyle>;

const SHAPE = "[clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%,6%_50%)]";

const tones = {
	alert: "from-[#ff7b72] via-alert to-[#a40e26] text-white [text-shadow:0_3px_0_#5c0b14]",
	gold: "from-[#ffe08a] via-warn to-[#9e6a03] text-[#3d2600] [text-shadow:0_2px_0_#ffe9a8]",
	go: "from-[#7ee787] via-go to-[#196c2e] text-white [text-shadow:0_3px_0_#0f3d1a]",
} satisfies Record<RibbonTone, string>;

// Faixa de título com pontas cortadas e sombra sólida embaixo (estilo fita de Clash Royale).
export const Ribbon = ({ tone, children }: RibbonProps) => (
	<div className="drop-shadow-[0_6px_0_rgb(0_0_0/0.55)]">
		<h2
			className={`m-0 whitespace-nowrap bg-linear-to-b px-10 py-2.5 font-extrabold text-[26px] tracking-wide ${SHAPE} ${tones[tone]}`}
		>
			{children}
		</h2>
	</div>
);
