import { useMatchStatus } from "#/features/game-session";
import { usePressedStore } from "#/features/input";

export const TutorialHint = () => {
	const pressed = usePressedStore((store) => store.pressed);
	const visible = useMatchStatus((status) => status.phase === "playing" && status.wave <= 1);
	if (pressed || !visible) return null;
	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-[30%] z-10 flex flex-col items-center gap-3">
			<p className="animate-pulse font-extrabold text-[15px] text-bright [text-shadow:0_0_6px_#05070a]">
				Segure e arraste
			</p>
			<div className="w-32 border-go/40 border-t-2 border-dashed" />
			<span className="animate-sway text-4xl">👆</span>
		</div>
	);
};
