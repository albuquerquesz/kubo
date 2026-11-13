import { type PointerEvent, type PropsWithChildren, useRef } from "react";
import { reportSilentError } from "#/shared/telemetry";
import { controls, markPressed } from "./controls";
import { inputKindOf } from "./input-kind";

// Arrastar a largura inteira da tela move o canhão ~2 unidades de pista (igual ao protótipo).
const AIM_SENSITIVITY = 1.95;

type PressHandler = {
	onPress: () => void;
};

type InputSurfaceProps = PropsWithChildren<PressHandler>;

type ActivePointer = {
	id: number;
	lastX: number;
};

export const InputSurface = ({ onPress, children }: InputSurfaceProps) => {
	const active = useRef<ActivePointer | null>(null);

	const press = (event: PointerEvent<HTMLDivElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		active.current = { id: event.pointerId, lastX: event.clientX };
		controls.pointerFiring = true;
		markPressed(inputKindOf(event.pointerType));
		onPress();
	};

	const drag = (event: PointerEvent<HTMLDivElement>) => {
		const pointer = active.current;
		if (pointer?.id !== event.pointerId) return;
		const width = event.currentTarget.clientWidth;
		// Largura zero (layout ainda não medido) daria mira infinita.
		if (width <= 0) {
			reportSilentError("input_non_finite", "superfície de toque sem largura", { width });
			return;
		}
		controls.aimDelta += ((event.clientX - pointer.lastX) / width) * AIM_SENSITIVITY;
		pointer.lastX = event.clientX;
	};

	const release = (event: PointerEvent<HTMLDivElement>) => {
		if (active.current?.id !== event.pointerId) return;
		active.current = null;
		controls.pointerFiring = false;
	};

	return (
		<div
			className="absolute inset-0 touch-none"
			data-testid="input-surface"
			onPointerDown={press}
			onPointerMove={drag}
			onPointerUp={release}
			onPointerCancel={release}
		>
			{children}
		</div>
	);
};
