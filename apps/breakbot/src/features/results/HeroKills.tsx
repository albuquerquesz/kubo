import type { MatchStats } from "@breakbot/game-core";
import type { MatchResult } from "#/features/progress";
import { delayStyle } from "#/shared/animation-delay";
import { reveal } from "./reveal";
import { useCountUp } from "./use-count-up";

type HeroKillsProps = Pick<MatchStats, "kills"> & Pick<MatchResult, "newRecord">;

const glow = {
	over: "text-bright [text-shadow:0_5px_0_#05070a,0_0_28px_rgb(88_166_255/0.45)]",
	record: "text-warn [text-shadow:0_5px_0_#3d2600,0_0_32px_rgb(227_179_65/0.6)]",
} as const;

// O número herói é o estrago feito: quantos robôs caíram na partida.
export const HeroKills = ({ kills, newRecord }: HeroKillsProps) => {
	const shownKills = useCountUp(kills, reveal.hero + 150);
	return (
		<div className="flex animate-rise flex-col items-center" style={delayStyle(reveal.hero)}>
			<span className="font-extrabold text-[13px] text-mute tracking-[0.3em]">
				🤖 ROBÔS DERRUBADOS
			</span>
			<span
				className={`font-extrabold text-[88px] tabular-nums leading-none ${newRecord ? glow.record : glow.over}`}
				data-testid="result-kills"
			>
				{shownKills}
			</span>
		</div>
	);
};
