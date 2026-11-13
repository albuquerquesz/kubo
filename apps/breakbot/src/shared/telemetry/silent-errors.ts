import type { TelemetryProperties } from "./catalog";

export type SilentErrorLevel = "fatal" | "error" | "warning";

type SilentErrorSpec = {
	level: SilentErrorLevel;
	title: string;
};

// Cada tipo vira uma issue própria no error tracking (fingerprint = tipo).
export const silentErrors = {
	webgl_unavailable: { level: "fatal", title: "WebGL indisponível: arena não abriu" },
	webgl_context_lost: { level: "error", title: "Contexto WebGL perdido durante o jogo" },
	render_crashed: { level: "fatal", title: "Erro em componente 3D da arena" },
	match_loop_failed: { level: "fatal", title: "Passo da partida lançou exceção" },
	match_listener_failed: { level: "error", title: "Ouvinte de evento da partida lançou exceção" },
	match_state_invalid: { level: "error", title: "Estado da partida com valor inválido" },
	input_non_finite: { level: "warning", title: "Mira não finita vinda do toque" },
	results_missing: { level: "error", title: "Fim de jogo sem tela de fim" },
	wallet_mismatch: { level: "warning", title: "Carteira não bate com as moedas da partida" },
	progress_storage_unavailable: {
		level: "warning",
		title: "Armazenamento do navegador indisponível",
	},
	progress_load_failed: { level: "error", title: "Progresso salvo ilegível foi descartado" },
	chunk_load_failed: { level: "error", title: "Falha ao carregar código depois de um deploy" },
	route_error: { level: "error", title: "Erro ao renderizar rota" },
	react_recoverable_error: { level: "warning", title: "Erro recuperado pelo React" },
	simulation_lagging: { level: "warning", title: "Simulação descartando tempo (câmera lenta)" },
	telemetry_failed: { level: "warning", title: "Telemetria lançou exceção" },
} satisfies Record<string, SilentErrorSpec>;

export type SilentErrorKind = keyof typeof silentErrors;

export type SilentErrorReport = SilentErrorSpec & {
	kind: SilentErrorKind;
	error: Error;
	context: TelemetryProperties;
};
