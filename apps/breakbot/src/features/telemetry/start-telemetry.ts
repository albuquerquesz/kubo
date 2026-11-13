import {
	consoleSink,
	installSink,
	noopSink,
	registerProperties,
	setErrorContext,
} from "#/shared/telemetry";
import { watchChunkFailures } from "./chunk-failures";
import { loadPostHogSink } from "./posthog-sink";
import { readTelemetryConfig, type TelemetryConfig } from "./telemetry-config";

const IDLE_TIMEOUT_MS = 3000;

// O SDK só carrega depois da primeira pintura, para não pesar na abertura do jogo.
const whenIdle = (task: () => void) => {
	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
		return;
	}
	window.setTimeout(task, IDLE_TIMEOUT_MS / 2);
};

const installPostHog = (config: TelemetryConfig) =>
	loadPostHogSink(config)
		.then(installSink)
		.catch((error) => {
			console.warn("[telemetria] PostHog não carregou", error);
			installSink(noopSink);
		});

export const startTelemetry = () => {
	const config = readTelemetryConfig();
	setErrorContext(() => ({ route: window.location.pathname }));
	watchChunkFailures();
	if (!config.key) {
		installSink(config.debug ? consoleSink : noopSink);
		registerProperties(config.superProperties);
		return;
	}
	whenIdle(() => installPostHog(config));
};
