import { create } from "zustand";
import { reportSilentError } from "#/shared/telemetry";

type ContextHealth = {
	stuck: boolean;
};

// O celular derruba o contexto WebGL sob pressão de memória; o three.js costuma restaurar sozinho.
// Só depois desta folga sem restauração a arena é dada como travada.
const RESTORE_GRACE_MS = 4000;

export const useContextHealth = create<ContextHealth>()(() => ({ stuck: false }));

// Um reporte por perda: `restored` diz se voltou dentro da folga.
export const watchContextLoss = (canvas: HTMLCanvasElement) => {
	let pending = 0;
	const report = (restored: boolean) =>
		reportSilentError("webgl_context_lost", "contexto WebGL perdido", { restored });
	const giveUp = () => {
		pending = 0;
		useContextHealth.setState({ stuck: true });
		report(false);
	};
	const lose = () => {
		window.clearTimeout(pending);
		pending = window.setTimeout(giveUp, RESTORE_GRACE_MS);
	};
	const restore = () => {
		useContextHealth.setState({ stuck: false });
		if (pending === 0) return;
		window.clearTimeout(pending);
		pending = 0;
		report(true);
	};
	canvas.addEventListener("webglcontextlost", lose);
	canvas.addEventListener("webglcontextrestored", restore);
};
