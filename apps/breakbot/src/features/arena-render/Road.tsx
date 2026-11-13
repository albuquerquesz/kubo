import { type HorizontalRange, laneBounds } from "@breakbot/game-core";
import { type PaletteColor, palette } from "#/shared/palette";
import { Strip } from "./Strip";
import { FAR_Z, NEAR_Z } from "./world";

// Tracejado no meio do corredor da horda; as laterais ficam embaixo das rampas.
const LANE_DIVIDERS = [(laneBounds.main.left + laneBounds.main.right) / 2];
const DASH_HALF_WIDTH = 0.009;
const DASH_PERIOD = 7;
const DASH_LENGTH = 3.5;
const ZEBRA_LENGTH = 3;

type RoadMarking = {
	bounds: HorizontalRange;
	color: PaletteColor;
	opacity: number;
	lift: number;
};

// Camadas fixas da pista, de baixo para cima, sempre de ponta a ponta.
const roadMarkings = [
	{ bounds: { left: -3, right: 3 }, color: palette.shoulder, opacity: 1, lift: -0.01 },
	{ bounds: { left: -1, right: 1 }, color: palette.asphalt, opacity: 1, lift: 0 },
	{ bounds: { left: -1, right: -0.985 }, color: palette.stripe, opacity: 0.55, lift: 0.002 },
	{ bounds: { left: 0.985, right: 1 }, color: palette.stripe, opacity: 0.55, lift: 0.002 },
] satisfies RoadMarking[];

const zebraEdges = [
	{ left: -1.09, right: -1 },
	{ left: 1, right: 1.09 },
] satisfies HorizontalRange[];

const dividerBounds = LANE_DIVIDERS.map(
	(center) =>
		({ left: center - DASH_HALF_WIDTH, right: center + DASH_HALF_WIDTH }) satisfies HorizontalRange,
);

const stepsAlong = (period: number) =>
	Array.from(
		{ length: Math.ceil((FAR_Z - NEAR_Z) / period) },
		(_, index) => NEAR_Z + index * period,
	);

const LaneDashes = () => (
	<group>
		{stepsAlong(DASH_PERIOD).flatMap((near) =>
			dividerBounds.map((bounds) => (
				<Strip
					key={`${near}:${bounds.left}`}
					bounds={bounds}
					near={near}
					far={near + DASH_LENGTH}
					color={palette.stripe}
					opacity={0.6}
					lift={0.003}
				/>
			)),
		)}
	</group>
);

const Zebras = () => (
	<group>
		{stepsAlong(ZEBRA_LENGTH).flatMap((near, index) =>
			zebraEdges.map((bounds) => (
				<Strip
					key={`${near}:${bounds.left}`}
					bounds={bounds}
					near={near}
					far={near + ZEBRA_LENGTH}
					color={index % 2 ? palette.alert : palette.stripe}
					lift={0.004}
				/>
			)),
		)}
	</group>
);

export const Road = () => (
	<group>
		{roadMarkings.map((marking) => (
			<Strip
				key={`${marking.bounds.left}:${marking.color}`}
				{...marking}
				near={NEAR_Z}
				far={FAR_Z}
			/>
		))}
		<LaneDashes />
		<Zebras />
	</group>
);
