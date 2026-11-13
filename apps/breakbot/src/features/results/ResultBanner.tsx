import type { MatchResult } from "#/features/progress";
import { delayStyle } from "#/shared/animation-delay";
import { Ribbon } from "#/shared/ui/Ribbon";
import { reveal } from "./reveal";

type ResultBannerProps = Pick<MatchResult, "newRecord">;

// Faixa de título que "bate" na tela, sobreposta ao topo do painel.
export const ResultBanner = ({ newRecord }: ResultBannerProps) => (
	<div
		className="-top-7 absolute inset-x-0 flex animate-slam justify-center"
		style={delayStyle(reveal.banner)}
	>
		{newRecord ? (
			<Ribbon tone="gold">★ NOVO RECORDE ★</Ribbon>
		) : (
			<Ribbon tone="alert">FIM DE JOGO</Ribbon>
		)}
	</div>
);
