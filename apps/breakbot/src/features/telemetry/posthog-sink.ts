import type { CaptureResult, PostHog } from "posthog-js";
import { readErrorContext, type TelemetrySink } from "#/shared/telemetry";
import type { TelemetryConfig } from "./telemetry-config";

// Exceções capturadas automaticamente pelo SDK ganham o mesmo contexto da partida das nossas.
const withErrorContext = (result: CaptureResult | null) => {
	if (result?.event !== "$exception") return result;
	return { ...result, properties: { ...readErrorContext(), ...result.properties } };
};

const toSink = (posthog: PostHog) =>
	({
		capture: (name, properties) => {
			posthog.capture(name, properties);
		},
		captureException: (report) => {
			posthog.captureException(report.error, {
				...report.context,
				silent_error: report.kind,
				$exception_fingerprint: report.kind,
				$issue_name: report.title,
				$exception_level: report.level,
			});
		},
		register: (properties) => posthog.register(properties),
	}) satisfies TelemetrySink;

export const loadPostHogSink = async (config: TelemetryConfig) => {
	const { default: posthog } = await import("posthog-js");
	posthog.init(config.key, {
		api_host: config.host,
		// Sem autocapture de cliques: só os eventos do catálogo.
		autocapture: false,
		capture_pageview: false,
		capture_pageleave: false,
		rageclick: false,
		capture_dead_clicks: false,
		enable_heatmaps: false,
		capture_heatmaps: false,
		capture_performance: false,
		disable_session_recording: true,
		disable_surveys: true,
		disable_web_experiments: true,
		disable_conversations: true,
		disable_product_tours: true,
		// Erros não tratados e promises rejeitadas continuam automáticos.
		capture_exceptions: true,
		persistence: "localStorage",
		person_profiles: "identified_only",
		before_send: withErrorContext,
		debug: config.debug,
	});
	posthog.register(config.superProperties);
	return toSink(posthog);
};
