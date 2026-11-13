import { createChannel } from "#/shared/channel";
import type { ResultAction } from "./catalog";
import { reportSilentError } from "./telemetry";

type ResultsShown = { type: "resultsShown" };
type ResultActionChosen = { type: "resultAction"; action: ResultAction };

export type AppSignal = ResultsShown | ResultActionChosen;

// Sinais de tela que a telemetria precisa ouvir sem que as features dependam dela.
const appSignals = createChannel<AppSignal>((error) =>
	reportSilentError("telemetry_failed", error),
);

export const emitAppSignal = appSignals.publish;
export const subscribeAppSignals = appSignals.subscribe;
