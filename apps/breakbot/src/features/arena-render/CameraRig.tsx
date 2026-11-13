import { CANNON_Z } from "@breakbot/game-core";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { readSnapshot } from "#/features/game-session";
import { toSceneX, toSceneZ } from "./world";

// Calibrada contra quadros do vídeo de referência: canhão a ~78% da altura e ~61% da largura,
// faixa ocupando ~27% da tela na altura dele e linhas da pista inclinadas ~18° na tela.
const TARGET_Z = toSceneZ(CANNON_Z + 12);
const YAW = (10 * Math.PI) / 180;
const PITCH = (43 * Math.PI) / 180;
const DISTANCE = 22;
// A câmera desliza só uma fração do deslocamento do canhão, com amortecimento, como no vídeo.
const FOLLOW_RATIO = 0.35;
const FOLLOW_EASE = 3;

const GROUND = Math.cos(PITCH) * DISTANCE;
const OFFSET_X = -Math.sin(YAW) * GROUND;
const OFFSET_Y = Math.sin(PITCH) * DISTANCE;
const OFFSET_Z = Math.cos(YAW) * GROUND;

export const CameraRig = () => {
	const followX = useRef(0);

	useFrame(({ camera }, delta) => {
		const targetX = toSceneX(readSnapshot().cannon.x) * FOLLOW_RATIO;
		followX.current += (targetX - followX.current) * Math.min(1, delta * FOLLOW_EASE);
		camera.position.set(followX.current + OFFSET_X, OFFSET_Y, TARGET_Z + OFFSET_Z);
		camera.lookAt(followX.current, 0, TARGET_Z);
	});

	return null;
};
