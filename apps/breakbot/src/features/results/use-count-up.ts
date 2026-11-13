import { useEffect, useState } from "react";

const DURATION_MS = 750;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

const clampProgress = (progress: number) => Math.min(Math.max(progress, 0), 1);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Número que "rola" de 0 até o alvo depois de um atraso, como no placar de jogo mobile.
export const useCountUp = (target: number, delayMs: number) => {
	const [value, setValue] = useState(0);
	useEffect(() => {
		if (prefersReducedMotion()) {
			setValue(target);
			return;
		}
		const start = performance.now() + delayMs;
		let frame = 0;
		const tick = (now: number) => {
			const progress = clampProgress((now - start) / DURATION_MS);
			setValue(Math.round(target * easeOutCubic(progress)));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, delayMs]);
	return value;
};
