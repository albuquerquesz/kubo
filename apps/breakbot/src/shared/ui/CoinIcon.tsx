type CoinIconProps = {
	className?: string;
};

export const CoinIcon = ({ className = "size-4.5" }: CoinIconProps) => (
	<span
		className={`inline-block shrink-0 rounded-full border-2 border-[#d29922] bg-warn shadow-[inset_0_0_0_1.5px_#8a6914] ${className}`}
	/>
);
