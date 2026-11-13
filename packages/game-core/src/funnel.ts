import { type HorizontalRange, hordeBounds, laneBounds } from "./track";

// A horda converge gradualmente de wideZ até a abertura central em neckZ, onde ficam os
// ombros transversais retos das cercas. As laterais seguem até mouthZ; dali até o canhão,
// o canal continua como corredor entre as rampas.
export type Funnel = {
	wideZ: number;
	neckZ: number;
	mouthZ: number;
};

export const isInFunnel = (funnel: Funnel, z: number) => z >= funnel.mouthZ && z <= funnel.wideZ;

const blend = (from: number, to: number, share: number) => from + (to - from) * share;

// Faixa livre para a horda num z: a área larga atrás do funil, o corredor do pescoço em diante.
export const funnelBoundsAt = (funnel: Funnel, z: number) => {
	if (z > funnel.wideZ) return hordeBounds;
	if (z <= funnel.neckZ) return laneBounds.main;
	const share = (funnel.wideZ - z) / (funnel.wideZ - funnel.neckZ);
	return {
		left: blend(hordeBounds.left, laneBounds.main.left, share),
		right: blend(hordeBounds.right, laneBounds.main.right, share),
	} satisfies HorizontalRange;
};
