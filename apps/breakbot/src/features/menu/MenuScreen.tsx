import { useProgressStore } from "#/features/progress";
import { Button } from "#/shared/ui/Button";
import { Overlay } from "#/shared/ui/Overlay";

type MenuScreenProps = {
	onPlay: () => void;
};

const RecordLine = () => {
	const best = useProgressStore((store) => store.best);
	const wallet = useProgressStore((store) => store.wallet);
	if (!best) return null;
	return (
		<small className="text-[11px] text-faint">
			Recorde: onda {best.wave} · ★ {best.score} · <span className="text-warn">◉ {wallet}</span>
		</small>
	);
};

export const MenuScreen = ({ onPlay }: MenuScreenProps) => (
	<Overlay>
		<h1 className="animate-glitch font-extrabold text-[clamp(54px,17vw,84px)] text-bright leading-none tracking-[-2px]">
			PUSH<span className="animate-blink text-go">▌</span>
		</h1>
		<p className="m-0 max-w-80 text-[13px] text-mute leading-relaxed">
			Segure e arraste pra atirar. Passe pelas <em className="text-fg not-italic">faixas roxas</em>{" "}
			pra multiplicar sua tropa e aguente <em className="text-fg not-italic">quantas ondas</em>{" "}
			conseguir.
		</p>
		<Button onClick={onPlay}>Jogar</Button>
		<RecordLine />
	</Overlay>
);
