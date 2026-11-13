import { useEffect } from "react";
import {
	describeMatch,
	type MatchDescription,
	subscribeFrames,
	subscribeMatchEvents,
	subscribeMatchStarts,
} from "#/features/game-session";
import { usePressedStore } from "#/features/input";
import { useProgressStore } from "#/features/progress";
import { optional } from "#/shared/optional";
import {
	type InputKind,
	registerProperties,
	reportSilentError,
	setErrorContext,
	subscribeAppSignals,
} from "#/shared/telemetry";
import { readMatchContext } from "./error-context";
import { createMatchRecorder } from "./match-recorder";

type PressedState = ReturnType<typeof usePressedStore.getState>;

// A telemetria nunca derruba o jogo: falha nela vira reporte e o jogo segue.
const guarded =
	<Value,>(task: (value: Value) => void) =>
	(value: Value) => {
		try {
			task(value);
		} catch (error) {
			reportSilentError("telemetry_failed", error);
		}
	};

const readWallet = () => useProgressStore.getState().wallet;

// Um gravador por página: remontar o componente (StrictMode, HMR) não reanuncia a partida.
const recorder = createMatchRecorder({ readWallet });

const beginWith = (description: MatchDescription) => {
	const { best, wallet } = useProgressStore.getState();
	recorder.begin({ ...description, previousBest: best, wallet });
};

const watchInput = () => {
	let lastKind = optional<InputKind>(null);
	return usePressedStore.subscribe(
		guarded((pressed: PressedState) => {
			if (!pressed.lastKind) return;
			recorder.firstInput(pressed.lastKind);
			if (pressed.lastKind === lastKind) return;
			lastKind = pressed.lastKind;
			registerProperties({ input_kind: lastKind });
		}),
	);
};

const startRecording = () => {
	const closePage = guarded(() => recorder.abandon("page_closed"));
	setErrorContext(readMatchContext);
	beginWith(describeMatch());
	const stops = [
		subscribeMatchStarts(guarded(beginWith)),
		watchInput(),
		subscribeMatchEvents(recorder.observe),
		subscribeFrames(recorder.sample),
		subscribeAppSignals(recorder.signal),
	];
	window.addEventListener("pagehide", closePage);
	return () => {
		window.removeEventListener("pagehide", closePage);
		for (const stop of stops) stop();
	};
};

// Montado no layout da arena: acompanha menu e partida sem desmontar na troca de rota.
export const MatchTelemetry = () => {
	useEffect(startRecording, []);
	return null;
};
