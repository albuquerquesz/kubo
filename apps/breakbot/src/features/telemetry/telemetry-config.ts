import type { SuperProperties } from "#/shared/telemetry";

const DEFAULT_HOST = "https://us.i.posthog.com";

// Sem chave (dev, testes, e2e) a telemetria vira no-op ou log no console.
export const readTelemetryConfig = () => {
	const environment = import.meta.env;
	return {
		key: environment.VITE_POSTHOG_KEY ?? "",
		host: environment.VITE_POSTHOG_HOST ?? DEFAULT_HOST,
		debug: environment.VITE_POSTHOG_DEBUG === "true",
		superProperties: {
			build: environment.VITE_BUILD_SHA ?? "dev",
			app_version: environment.VITE_APP_VERSION ?? "dev",
			environment: environment.MODE,
			device_pixel_ratio: window.devicePixelRatio,
		} satisfies SuperProperties,
	};
};

export type TelemetryConfig = ReturnType<typeof readTelemetryConfig>;
