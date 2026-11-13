import type { ReactNode } from "react";
import { delayStyle } from "#/shared/animation-delay";

type IntroTip = {
	icon: ReactNode;
	text: string;
};

type IntroTipCardProps = IntroTip & {
	order: number;
};

const FIRST_TIP_MS = 350;
const TIP_STEP_MS = 110;

// Ícones imitam os objetos da pista, pra o jogador reconhecer na hora.
const BandIcon = () => (
	<span className="rounded-md border-2 border-grape bg-[#6e40c9] px-1.5 font-extrabold text-sm text-white leading-5">
		×2
	</span>
);

const StatueIcon = () => (
	<span className="rounded-md border-2 border-[#7d6648] bg-[#c2a57f] px-1.5 font-extrabold text-[#3d2a14] text-sm leading-5">
		12
	</span>
);

const LifeIcon = () => <span className="font-extrabold text-alert text-xl leading-5">♥</span>;

const tips = [
	{ icon: <BandIcon />, text: "Faixas roxas multiplicam a tropa" },
	{ icon: <StatueIcon />, text: "Quebre a estátua da esquerda e ganhe canhões" },
	{ icon: <LifeIcon />, text: "Robô que passa tira vida" },
] satisfies IntroTip[];

const IntroTipCard = ({ icon, text, order }: IntroTipCardProps) => (
	<li
		className="flex animate-rise flex-col items-center gap-2 rounded-xl border-2 border-line bg-linear-to-b from-[#1f2630] to-ink px-2 pt-3 pb-2.5 shadow-[0_3px_0_#05070a,inset_0_1px_0_rgb(255_255_255/0.06)]"
		style={delayStyle(FIRST_TIP_MS + order * TIP_STEP_MS)}
	>
		<span className="flex h-6 items-center">{icon}</span>
		<span className="font-bold text-[11px] text-fg leading-tight">{text}</span>
	</li>
);

// Três "cartas" com o que importa saber antes da primeira onda.
export const IntroTips = () => (
	<ul className="m-0 grid w-full max-w-84 list-none grid-cols-3 gap-2.5 p-0">
		{tips.map((tip, index) => (
			<IntroTipCard key={tip.text} order={index} {...tip} />
		))}
	</ul>
);
