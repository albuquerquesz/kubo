import { beforeEach, describe, expect, it } from "vitest";
import {
	createRecordingSink,
	installSink,
	reportSilentError,
	resetTelemetry,
	setErrorContext,
	trackEvent,
} from "./index";

beforeEach(() => resetTelemetry());

describe("reporter de erros silenciosos", () => {
	it("usa o tipo como fingerprint e anexa o contexto da partida", () => {
		const recording = createRecordingSink();
		installSink(recording.sink);
		setErrorContext(() => ({ route: "/play", wave: 3 }));
		reportSilentError("webgl_context_lost", new Error("context lost"), { restored: false });
		expect(recording.exceptions).toEqual([
			expect.objectContaining({
				kind: "webgl_context_lost",
				level: "error",
				context: { route: "/play", wave: 3, restored: false },
			}),
		]);
	});

	it("o mesmo erro repetido a cada frame gera um reporte só", () => {
		const recording = createRecordingSink();
		installSink(recording.sink);
		for (let frame = 0; frame < 600; frame++) reportSilentError("match_loop_failed", "boom");
		expect(recording.exceptions).toHaveLength(1);
	});

	it("tem teto de reportes por sessão", () => {
		const recording = createRecordingSink();
		installSink(recording.sink);
		for (let index = 0; index < 100; index++) reportSilentError("route_error", `erro ${index}`);
		expect(recording.exceptions).toHaveLength(25);
	});

	it("transforma qualquer valor lançado em Error", () => {
		const recording = createRecordingSink();
		installSink(recording.sink);
		reportSilentError("chunk_load_failed", { status: 404 });
		expect(recording.exceptions[0]?.error.message).toBe('{"status":404}');
	});
});

describe("buffer antes do SDK", () => {
	it("guarda eventos e erros até o sink real ser instalado", () => {
		trackEvent("$pageview", { path: "/" });
		reportSilentError("react_recoverable_error", "hidratação");
		const recording = createRecordingSink();
		installSink(recording.sink);
		expect(recording.named("$pageview")).toEqual([{ path: "/" }]);
		expect(recording.exceptions).toHaveLength(1);
	});
});
