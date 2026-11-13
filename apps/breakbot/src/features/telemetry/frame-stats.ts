import type { FrameSample } from "#/features/game-session";
import type { PerformanceSummary } from "#/shared/telemetry";
import { roundTo } from "./rounding";

const FPS_WINDOW_SECONDS = 0.5;
// Frame mais longo que isto é aba voltando do segundo plano, não lentidão do aparelho.
const STALL_SECONDS = 0.5;
const LAG_WINDOW_SECONDS = 3;
const LAG_RATIO = 0.25;

const percentile = (values: number[], fraction: number) => {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((first, second) => first - second);
	return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0;
};

export const createFrameStats = () => {
	const fpsSamples = new Array<number>();
	const totals = { seconds: 0, dropped: 0, bots: 0, troops: 0 };
	const fpsWindow = { frames: 0, seconds: 0 };
	const lagWindow = { seconds: 0, dropped: 0 };

	const closeFpsWindow = () => {
		if (fpsWindow.seconds < FPS_WINDOW_SECONDS) return;
		fpsSamples.push(fpsWindow.frames / fpsWindow.seconds);
		fpsWindow.frames = 0;
		fpsWindow.seconds = 0;
	};

	// Devolve verdadeiro quando uma janela de alguns segundos fechou descartando tempo demais.
	const closeLagWindow = () => {
		if (lagWindow.seconds < LAG_WINDOW_SECONDS) return false;
		const lagging = lagWindow.dropped / lagWindow.seconds > LAG_RATIO;
		lagWindow.seconds = 0;
		lagWindow.dropped = 0;
		return lagging;
	};

	const sample = ({ deltaSeconds, droppedSeconds, snapshot }: FrameSample) => {
		totals.bots = Math.max(totals.bots, snapshot.bots.length);
		totals.troops = Math.max(totals.troops, snapshot.troops.length);
		if (deltaSeconds > STALL_SECONDS) return false;
		totals.seconds += deltaSeconds;
		totals.dropped += droppedSeconds;
		fpsWindow.frames += 1;
		fpsWindow.seconds += deltaSeconds;
		lagWindow.seconds += deltaSeconds;
		lagWindow.dropped += droppedSeconds;
		closeFpsWindow();
		return closeLagWindow();
	};

	const summary = () =>
		({
			fps_median: roundTo(percentile(fpsSamples, 0.5), 1),
			fps_low: roundTo(percentile(fpsSamples, 0.1), 1),
			dropped_ratio: roundTo(totals.seconds > 0 ? totals.dropped / totals.seconds : 0, 3),
			bot_peak: totals.bots,
			troop_peak: totals.troops,
		}) satisfies PerformanceSummary;

	return { sample, summary };
};
