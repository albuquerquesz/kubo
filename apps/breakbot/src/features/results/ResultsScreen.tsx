import { useEffect } from "react";
import type { MatchResult } from "#/features/progress";
import { delayStyle } from "#/shared/animation-delay";
import { emitAppSignal, type ResultAction } from "#/shared/telemetry";
import { Button } from "#/shared/ui/Button";
import { Overlay } from "#/shared/ui/Overlay";
import { Confetti } from "./Confetti";
import { HeroKills } from "./HeroKills";
import { RecordLine } from "./RecordLine";
import { ResultBanner } from "./ResultBanner";
import { reveal } from "./reveal";
import { StatTiles } from "./StatTiles";

type ResultsScreenProps = {
	result: MatchResult;
	onReplay: () => void;
	onMenu: () => void;
};

const announceShown = () => emitAppSignal({ type: "resultsShown" });

const choose = (action: ResultAction, handler: () => void) => () => {
	emitAppSignal({ type: "resultAction", action });
	handler();
};

const PANEL =
	"relative mt-8 flex w-full max-w-84 flex-col items-center gap-4 rounded-3xl border-2 border-[#2d3542] bg-linear-to-b from-[#1b222c] to-ink px-4 pt-11 pb-4 shadow-[0_10px_0_rgb(0_0_0/0.55),0_20px_40px_rgb(0_0_0/0.5),inset_0_2px_0_rgb(255_255_255/0.07)]";

const ResultsPanel = ({ result, onReplay, onMenu }: ResultsScreenProps) => {
	const { stats, newRecord } = result;
	return (
		<Overlay>
			<section className={PANEL}>
				<ResultBanner newRecord={newRecord} />
				<HeroKills kills={stats.kills} newRecord={newRecord} />
				<StatTiles
					wave={stats.wave}
					score={stats.score}
					elapsed={stats.elapsed}
					coins={stats.coins}
				/>
				<RecordLine result={result} />
			</section>
			<div
				className="mt-2 flex w-full max-w-84 animate-rise flex-col items-center gap-3"
				style={delayStyle(reveal.actions)}
			>
				<Button className="w-full px-3" onClick={choose("replay", onReplay)}>
					↻ Jogar de novo
				</Button>
				<button
					type="button"
					className="cursor-pointer px-3 py-1 font-bold text-mute text-sm tracking-wide transition-colors hover:text-bright"
					onClick={choose("menu", onMenu)}
				>
					Voltar ao menu
				</button>
			</div>
		</Overlay>
	);
};

// O confete fica fora do Overlay: o `animate-pop` dele usa transform e prenderia o confete no painel.
export const ResultsScreen = (props: ResultsScreenProps) => {
	useEffect(announceShown, []);
	return (
		<>
			<ResultsPanel {...props} />
			{props.result.newRecord && <Confetti />}
		</>
	);
};
