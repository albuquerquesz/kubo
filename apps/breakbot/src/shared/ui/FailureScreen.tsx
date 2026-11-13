import type { PropsWithChildren } from "react";
import { Overlay } from "./Overlay";

export type FailureCopy = {
	title: string;
	detail: string;
};

type FailureScreenProps = PropsWithChildren<FailureCopy>;

export const REPORTED_DETAIL = "O erro já foi enviado pra gente consertar";

export const reloadPage = () => window.location.reload();

export const FailureScreen = ({ title, detail, children }: FailureScreenProps) => (
	<Overlay>
		<h2 className="animate-glitch font-extrabold text-2xl text-alert">{title}</h2>
		<p className="m-0 max-w-72 text-[13px] text-mute leading-relaxed">{detail}</p>
		{children}
	</Overlay>
);
