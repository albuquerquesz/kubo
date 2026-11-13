import { useMatchStatus } from "#/features/game-session";
import { delayStyle } from "#/shared/animation-delay";
import { Ribbon } from "#/shared/ui/Ribbon";
import { IntroTips } from "./IntroTips";

const SUBTITLE_MS = 200;
const TAP_HINT_MS = 700;

// Abertura da partida: faixa da primeira onda, objetivo e dicas. Um toque pula (ver InputSurface).
export const IntroOverlay = () => {
	const phase = useMatchStatus((status) => status.phase);
	if (phase !== "intro") return null;
	return (
		<div className="pointer-events-none absolute inset-0 z-10 flex animate-fade flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_center,rgb(5_7_10/0.88)_30%,rgb(5_7_10/0.6))] px-6 text-center">
			<div className="animate-slam">
				<Ribbon tone="go">ONDA 1</Ribbon>
			</div>
			<p
				className="m-0 animate-rise font-extrabold text-bright text-lg [text-shadow:0_2px_0_#05070a]"
				style={delayStyle(SUBTITLE_MS)}
			>
				Aguente o máximo de ondas
			</p>
			<IntroTips />
			<p
				className="m-0 animate-[fade_0.3s_both] font-bold text-mute text-sm"
				style={delayStyle(TAP_HINT_MS)}
			>
				<span className="inline-block animate-pulse">Toque pra começar</span>
			</p>
		</div>
	);
};
