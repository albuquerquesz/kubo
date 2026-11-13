import { CANNON_Z, type HorizontalRange, type Lane, TRACK_LENGTH } from "@breakbot/game-core";
import { Object3D } from "three";

// O core usa x ∈ [-1, 1] e z ∈ [-12, 104]; a cena usa unidades do three com a pista indo para -z.
// Meia largura da estrada na cena: maior = pista mais larga na tela (o core não muda).
export const HALF_WIDTH = 6.2;
// Escala dos bonecos e do gigante: fixa, para alargar a pista sem inflar as unidades.
export const UNIT_SCALE = 4;
export const DEPTH_SCALE = 0.55;
export const NEAR_Z = -12;
export const FAR_Z = TRACK_LENGTH + 4;

export const toSceneX = (x: number) => x * HALF_WIDTH;
export const toSceneZ = (z: number) => -z * DEPTH_SCALE;
export const sceneWidth = (bounds: HorizontalRange) => (bounds.right - bounds.left) * HALF_WIDTH;
export const sceneCenterX = (bounds: HorizontalRange) => toSceneX((bounds.left + bounds.right) / 2);

export const CANNON_SCENE_Z = toSceneZ(CANNON_Z);
export const TOWER_SCENE_Z = toSceneZ(TRACK_LENGTH);

// Rampas laterais: sobem do chão perto do canhão até o deck, na altura das barricadas, e seguem
// planas até a face delas, como plataformas acima do corredor. Só o render tem altura; o core
// continua plano.
export const DECK_HEIGHT = 0.75;
export const RAMP_FOOT_Z = CANNON_Z;
export const RAMP_TOP_Z = 3;

const slopeShare = (z: number) =>
	Math.min(1, Math.max(0, (z - RAMP_FOOT_Z) / (RAMP_TOP_Z - RAMP_FOOT_Z)));

// Altura do chão sob um corpo: zero no corredor, a rampa nas laterais.
export const rampLift = (lane: Lane, z: number) =>
	lane === "main" ? 0 : DECK_HEIGHT * slopeShare(z);

// Objeto reaproveitado para montar matrizes de instância sem alocar por frame.
export const scratch = new Object3D();
