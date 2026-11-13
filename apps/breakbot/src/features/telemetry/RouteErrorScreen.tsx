import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { reportSilentError } from "#/shared/telemetry";
import { Button } from "#/shared/ui/Button";
import { FailureScreen, REPORTED_DETAIL } from "#/shared/ui/FailureScreen";

const backToMenu = () => window.location.assign("/");

export const RouteErrorScreen = ({ error }: ErrorComponentProps) => {
	useEffect(() => reportSilentError("route_error", error), [error]);
	return (
		<FailureScreen title="Algo quebrou" detail={REPORTED_DETAIL}>
			<Button onClick={backToMenu}>Voltar ao menu</Button>
		</FailureScreen>
	);
};
