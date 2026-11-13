import { Button } from "#/shared/ui/Button";
import { FailureScreen, reloadPage } from "#/shared/ui/FailureScreen";
import { useContextHealth } from "./context-loss";

export const ContextLostNotice = () => {
	const stuck = useContextHealth((health) => health.stuck);
	if (!stuck) return null;
	return (
		<div className="absolute inset-0 z-30">
			<FailureScreen
				title="A arena travou"
				detail="O aparelho liberou a memória do 3D. Recarregue pra voltar"
			>
				<Button onClick={reloadPage}>Recarregar</Button>
			</FailureScreen>
		</div>
	);
};
