import { Canvas, type RootState } from "@react-three/fiber";
import { MatchDriver } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { ArenaBoundary } from "./ArenaBoundary";
import { BotHorde } from "./BotHorde";
import { Bands } from "./bands/Bands";
import { Barricades } from "./barricades/Barricades";
import { CameraRig } from "./CameraRig";
import { Champions } from "./Champions";
import { ContextLostNotice } from "./ContextLostNotice";
import { watchContextLoss } from "./context-loss";
import { BotDeaths } from "./deaths/BotDeaths";
import { AimLine } from "./player/AimLine";
import { Cannon } from "./player/Cannon";
import { Sidekicks } from "./player/Sidekicks";
import { Road } from "./Road";
import { Ramps } from "./ramps/Ramps";
import { SideStatue } from "./statue/SideStatue";
import { Statue } from "./statue/Statue";
import { TroopSwarm } from "./TroopSwarm";
import { Walls } from "./walls/Walls";

const watchCanvas = ({ gl }: RootState) => watchContextLoss(gl.domElement);

const Scene = () => (
	<Canvas
		className="absolute! inset-0"
		dpr={[1, 2]}
		camera={{ fov: 50, near: 0.1, far: 300 }}
		gl={{ antialias: true }}
		onCreated={watchCanvas}
	>
		<color attach="background" args={[palette.void]} />
		<ambientLight intensity={0.7} />
		<directionalLight position={[3, 8, 6]} intensity={1.6} />
		<MatchDriver />
		<CameraRig />
		<Road />
		<Barricades />
		<Ramps />
		<Walls />
		<Statue />
		<SideStatue />
		<Bands />
		<BotHorde />
		<BotDeaths />
		<TroopSwarm />
		<Champions />
		<AimLine />
		<Cannon />
		<Sidekicks />
	</Canvas>
);

export const Arena = () => (
	<>
		<ArenaBoundary>
			<Scene />
		</ArenaBoundary>
		<ContextLostNotice />
	</>
);
