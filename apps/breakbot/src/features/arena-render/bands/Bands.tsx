import { defaultBalance } from "@breakbot/game-core";
import { BandGate } from "./BandGate";

const BAND_SLOTS = defaultBalance.bandLayout.map((_, index) => index);

export const Bands = () => (
	<>
		{BAND_SLOTS.map((index) => (
			<BandGate key={index} index={index} />
		))}
	</>
);
