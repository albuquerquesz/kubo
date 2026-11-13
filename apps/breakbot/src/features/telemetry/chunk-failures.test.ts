import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createRecordingSink, installSink, resetTelemetry } from "#/shared/telemetry";
import { flushHeldChunkFailure, handleChunkFailure } from "./chunk-failures";

const sessionMemory = () => {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
		removeItem: (key: string) => values.delete(key),
	};
};

let recording = createRecordingSink();

beforeEach(() => {
	resetTelemetry();
	recording = createRecordingSink();
	installSink(recording.sink);
	vi.stubGlobal("sessionStorage", sessionMemory());
});

afterEach(() => vi.unstubAllGlobals());

it("recarrega uma vez e reporta a falha quando a página volta", () => {
	const reload = vi.fn();
	handleChunkFailure(new Error("chunk velho"), reload);
	expect(reload).toHaveBeenCalledOnce();
	expect(recording.exceptions).toEqual([]);
	flushHeldChunkFailure();
	expect(recording.exceptions).toEqual([
		expect.objectContaining({ kind: "chunk_load_failed", context: { after_reload: true } }),
	]);
});

it("a segunda falha na mesma sessão só reporta, sem recarregar de novo", () => {
	const reload = vi.fn();
	handleChunkFailure(new Error("chunk velho"), reload);
	flushHeldChunkFailure();
	handleChunkFailure(new Error("outro chunk"), reload);
	expect(reload).toHaveBeenCalledOnce();
	expect(recording.exceptions.map((report) => report.context.after_reload)).toEqual([true, false]);
});
