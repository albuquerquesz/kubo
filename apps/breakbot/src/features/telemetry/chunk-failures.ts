import { reportSilentError, toError } from "#/shared/telemetry";

const RELOAD_FLAG = "breakbot_chunk_reload";
const PENDING_REPORT = "breakbot_chunk_report";

type Reload = () => void;

// sessionStorage pode lançar (modo privado antigo, bloqueio); sem ele, nada de recarga automática.
const withSession = <Result>(task: () => Result, fallback: Result) => {
	try {
		return task();
	} catch {
		return fallback;
	}
};

// O reporte feito logo antes do reload se perderia no buffer; ele espera a página voltar.
export const handleChunkFailure = <Thrown>(thrown: Thrown, reload: Reload) => {
	const message = toError(thrown).message;
	const reloaded = withSession(() => sessionStorage.getItem(RELOAD_FLAG) !== null, true);
	if (reloaded) return reportSilentError("chunk_load_failed", thrown, { after_reload: false });
	const held = withSession(() => {
		sessionStorage.setItem(RELOAD_FLAG, "1");
		sessionStorage.setItem(PENDING_REPORT, message);
		return true;
	}, false);
	if (!held) return reportSilentError("chunk_load_failed", thrown, { after_reload: false });
	reload();
};

export const flushHeldChunkFailure = () => {
	const message = withSession(() => sessionStorage.getItem(PENDING_REPORT), null);
	if (message === null) return;
	withSession(() => sessionStorage.removeItem(PENDING_REPORT), undefined);
	reportSilentError("chunk_load_failed", message, { after_reload: true });
};

// Depois de um deploy, um chunk antigo some do servidor: recarrega uma vez por sessão.
export const watchChunkFailures = () => {
	flushHeldChunkFailure();
	window.addEventListener("vite:preloadError", (event) => {
		event.preventDefault();
		handleChunkFailure(event.payload, () => window.location.reload());
	});
};
