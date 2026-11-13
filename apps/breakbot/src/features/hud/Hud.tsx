import { ChargeMeter } from "./ChargeMeter";
import { CoinPop } from "./CoinPop";
import { IntroOverlay } from "./IntroOverlay";
import { SidekickBanner } from "./SidekickBanner";
import { StatusBar } from "./StatusBar";
import { TutorialHint } from "./TutorialHint";
import { UpgradeBanner } from "./UpgradeBanner";
import { WaveBanner } from "./WaveBanner";

export const Hud = () => (
	<>
		<StatusBar />
		<CoinPop />
		<ChargeMeter />
		<IntroOverlay />
		<TutorialHint />
		<WaveBanner />
		<SidekickBanner />
		<UpgradeBanner />
	</>
);
