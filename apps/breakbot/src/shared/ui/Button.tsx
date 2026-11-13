import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonStyle = {
	variant?: ButtonVariant;
};

type ButtonProps = ComponentProps<"button"> & ButtonStyle;

// Botão "gordo" de jogo mobile: lábio 3D embaixo que afunda ao apertar.
const BASE =
	"relative cursor-pointer overflow-hidden whitespace-nowrap rounded-xl border-2 py-3 font-extrabold text-[17px] tracking-wide transition-[transform,box-shadow] duration-75 active:translate-y-1";

const variants = {
	primary:
		"border-[#56d364]/70 bg-linear-to-b from-go to-go-deep text-white shadow-[0_5px_0_#145224,0_9px_16px_rgb(0_0_0/0.5),inset_0_2px_0_rgb(255_255_255/0.3)] [text-shadow:0_2px_0_#145224] active:shadow-[0_1px_0_#145224,inset_0_2px_0_rgb(255_255_255/0.3)]",
	secondary:
		"border-line bg-linear-to-b from-[#2a313b] to-panel text-bright shadow-[0_5px_0_#05070a,0_9px_16px_rgb(0_0_0/0.5),inset_0_2px_0_rgb(255_255_255/0.08)] [text-shadow:0_2px_0_#05070a] active:shadow-[0_1px_0_#05070a,inset_0_2px_0_rgb(255_255_255/0.08)]",
} satisfies Record<ButtonVariant, string>;

// Brilho que atravessa o botão principal de tempos em tempos: chama o olho sem piscar.
const Shine = ({ variant }: ButtonStyle) => {
	if (variant !== "primary") return null;
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/20 motion-reduce:hidden"
		/>
	);
};

export const Button = ({
	variant = "primary",
	className = "px-7",
	children,
	...props
}: ButtonProps) => (
	<button type="button" className={`${BASE} ${variants[variant]} ${className}`} {...props}>
		<Shine variant={variant} />
		<span className="relative">{children}</span>
	</button>
);
