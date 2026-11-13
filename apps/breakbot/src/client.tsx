import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { startTelemetry } from "#/features/telemetry";
import { reportSilentError } from "#/shared/telemetry";

type RecoverableErrorInfo = {
	componentStack?: string;
};

// Erros que o React recupera sozinho (ex.: mismatch de hidratação) hoje só iam para o console.
const reportRecoverable = <Thrown,>(error: Thrown, errorInfo: RecoverableErrorInfo) =>
	reportSilentError("react_recoverable_error", error, {
		component_stack: errorInfo.componentStack ?? null,
	});

startTelemetry();

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
		{ onRecoverableError: reportRecoverable },
	);
});
