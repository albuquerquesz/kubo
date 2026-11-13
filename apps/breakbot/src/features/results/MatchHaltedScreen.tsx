import { Button } from "#/shared/ui/Button";
import { FailureScreen, REPORTED_DETAIL } from "#/shared/ui/FailureScreen";

type MatchHaltedScreenProps = {
	onReplay: () => void;
	onMenu: () => void;
};

// A partida parou por um erro no passo da simulação; o erro já foi reportado.
export const MatchHaltedScreen = ({ onReplay, onMenu }: MatchHaltedScreenProps) => (
	<FailureScreen title="A partida travou" detail={REPORTED_DETAIL}>
		<Button onClick={onReplay}>Recomeçar</Button>
		<Button variant="secondary" onClick={onMenu}>
			Menu
		</Button>
	</FailureScreen>
);
