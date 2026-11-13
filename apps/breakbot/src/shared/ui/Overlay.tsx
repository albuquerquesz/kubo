import type { PropsWithChildren } from "react";

export const Overlay = ({ children }: PropsWithChildren) => (
	<div className="absolute inset-0 z-10 flex animate-fade flex-col items-center justify-center gap-3.5 bg-void/80 p-7 text-center backdrop-blur-[2px]">
		<div className="flex w-full animate-pop flex-col items-center gap-3.5">{children}</div>
	</div>
);
