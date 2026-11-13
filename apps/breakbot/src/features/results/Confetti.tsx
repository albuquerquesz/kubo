import { useState } from "react";
import { palette } from "#/shared/palette";

type ConfettiPiece = {
	left: number;
	top: number;
	delay: number;
	duration: number;
	size: number;
	color: string;
};

const PIECE_COUNT = 72;
const COLORS = [palette.go, palette.warn, palette.sky, palette.grape, palette.alert];

// Variação puramente visual: pode usar Math.random (a regra do RNG com seed vale só para o core).
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const createPiece = (index: number) =>
	({
		left: randomBetween(0, 100),
		top: randomBetween(-4, 30),
		delay: randomBetween(0, 0.5),
		duration: randomBetween(3, 5),
		size: randomBetween(9, 15),
		color: COLORS[index % COLORS.length] ?? palette.warn,
	}) satisfies ConfettiPiece;

const createPieces = () => Array.from({ length: PIECE_COUNT }, (_, index) => createPiece(index));

// Começa já dentro da tela (até 30% de altura) e desacelera ao cair: visível desde o primeiro frame.
const Piece = ({ left, top, delay, duration, size, color }: ConfettiPiece) => (
	<span
		className="absolute block animate-confetti rounded-[2px]"
		style={{
			left: `${left}%`,
			top: `${top}%`,
			width: size,
			height: size * 0.5,
			backgroundColor: color,
			animationDelay: `${delay}s`,
			animationDuration: `${duration}s`,
		}}
	/>
);

// Confete de DOM/CSS, uma vez por tela de recorde; some sozinho e não bloqueia os botões.
export const Confetti = () => {
	const [pieces] = useState(createPieces);
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 z-20 overflow-hidden motion-reduce:hidden"
			data-testid="confetti"
		>
			{pieces.map((piece, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: lista fixa gerada uma vez, nunca reordena
				<Piece key={index} {...piece} />
			))}
		</div>
	);
};
