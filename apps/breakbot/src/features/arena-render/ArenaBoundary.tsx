import { Component, type PropsWithChildren } from "react";
import { reportSilentError, type SilentErrorKind } from "#/shared/telemetry";
import { Button } from "#/shared/ui/Button";
import {
	type FailureCopy,
	FailureScreen,
	REPORTED_DETAIL,
	reloadPage,
} from "#/shared/ui/FailureScreen";

type ArenaFailureKind = Extract<SilentErrorKind, "webgl_unavailable" | "render_crashed">;

type ArenaFailure = {
	failure: ArenaFailureKind | null;
};

const failureOf = (error: Error) =>
	/webgl/i.test(error.message) ? "webgl_unavailable" : "render_crashed";

const copyByFailure = {
	webgl_unavailable: {
		title: "Sem 3D aqui",
		detail:
			"Seu navegador não abriu o WebGL. Tente outro navegador ou ative a aceleração de hardware",
	},
	render_crashed: { title: "A arena quebrou", detail: REPORTED_DETAIL },
} satisfies Record<ArenaFailureKind, FailureCopy>;

// Alarga o literal `{ failure: null }` para o tipo do estado.
const asArenaFailure = (state: ArenaFailure) => state;

// Sem esta borda, um erro do Canvas (inclusive WebGL indisponível) desmonta o app inteiro.
export class ArenaBoundary extends Component<PropsWithChildren, ArenaFailure> {
	override state = asArenaFailure({ failure: null });

	static getDerivedStateFromError(error: Error) {
		return { failure: failureOf(error) } satisfies ArenaFailure;
	}

	override componentDidCatch(error: Error) {
		reportSilentError(failureOf(error), error);
	}

	override render() {
		const { failure } = this.state;
		if (failure === null) return this.props.children;
		return (
			<FailureScreen {...copyByFailure[failure]}>
				<Button onClick={reloadPage}>Recarregar</Button>
			</FailureScreen>
		);
	}
}
