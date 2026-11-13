import type { Lane, MatchEvent, MatchSnapshot } from "@breakbot/game-core";
import fontUrl from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-800-normal.woff?url";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ComponentRef, type PropsWithChildren, useMemo, useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { readSnapshot, useMatchEvents } from "#/features/game-session";
import { palette } from "#/shared/palette";
import { rampLift, toSceneX, toSceneZ } from "../world";
import { createStatueGeometry, PEDESTAL_DEPTH, PEDESTAL_HEIGHT } from "./statue-geometry";

const SHAKE_DECAY = 6;
const SHAKE_AMPLITUDE = 0.05;
const FLASH_DECAY = 5;
const CRUMBLE_SPEED = 4;

type StatueState = NonNullable<MatchSnapshot["statue"]>;

type StatueHitEvent = Extract<MatchEvent["type"], "statueHit" | "sideStatueHit">;

type StatueFigureLook = {
	select: (snapshot: MatchSnapshot) => MatchSnapshot["statue"];
	hitEvent: StatueHitEvent;
	scale: number;
	// Rampa onde a estátua fica: dá a altura do chão sob ela.
	lane: Lane;
};

type StatueFigureProps = PropsWithChildren<StatueFigureLook>;

type StatuePlacement = Pick<StatueFigureLook, "scale" | "lane">;

type StatueLook = {
	rig: Group;
	label: ComponentRef<typeof Text>;
};

type StatueMotion = {
	shake: number;
	fall: number;
	lastHealth: number;
};

const relabel = (look: StatueLook, statue: StatueState, motion: StatueMotion) => {
	if (statue.health === motion.lastHealth) return;
	motion.lastHealth = statue.health;
	look.label.text = String(Math.max(0, statue.health));
	look.label.sync();
};

// Quebrada, a estátua afunda e encolhe; a próxima chega inteira.
const settleFall = (statue: StatueState, motion: StatueMotion, delta: number) => {
	if (!statue.dead) {
		motion.fall = 0;
		return;
	}
	motion.fall = Math.min(1, motion.fall + delta * CRUMBLE_SPEED);
};

const showStatue = (
	look: StatueLook,
	statue: StatueState,
	motion: StatueMotion,
	{ scale, lane }: StatuePlacement,
	elapsed: number,
) => {
	const wobble = Math.sin(elapsed * 60) * SHAKE_AMPLITUDE * motion.shake;
	const ground = rampLift(lane, statue.z);
	look.rig.visible = motion.fall < 1;
	look.rig.position.set(
		toSceneX(statue.x) + wobble,
		ground - motion.fall * 0.4,
		toSceneZ(statue.z),
	);
	look.rig.scale.setScalar(scale * (1 - motion.fall));
};

// Golem de pedra com a vida no pedestal: treme e acende quando leva tiro, desmorona ao quebrar.
export const StatueFigure = ({ select, hitEvent, scale, lane, children }: StatueFigureProps) => {
	const rig = useRef<Group>(null);
	const label = useRef<ComponentRef<typeof Text>>(null);
	const material = useRef<MeshStandardMaterial>(null);
	const motion = useRef<StatueMotion>({ shake: 0, fall: 0, lastHealth: -1 });
	const geometry = useMemo(createStatueGeometry, []);

	useMatchEvents((event) => {
		if (event.type !== hitEvent || !material.current) return;
		motion.current.shake = 1;
		material.current.emissiveIntensity = 0.6;
	});

	useFrame(({ clock }, delta) => {
		if (!rig.current || !label.current || !material.current) return;
		const current = motion.current;
		current.shake = Math.max(0, current.shake - delta * SHAKE_DECAY);
		material.current.emissiveIntensity = Math.max(
			0,
			material.current.emissiveIntensity - delta * FLASH_DECAY,
		);
		const statue = select(readSnapshot());
		rig.current.visible = false;
		if (!statue) return;
		const look = { rig: rig.current, label: label.current };
		relabel(look, statue, current);
		settleFall(statue, current, delta);
		showStatue(look, statue, current, { scale, lane }, clock.elapsedTime);
	});

	return (
		<group ref={rig} visible={false}>
			{children}
			<mesh geometry={geometry}>
				<meshStandardMaterial
					ref={material}
					vertexColors
					emissive={palette.bright}
					emissiveIntensity={0}
					roughness={0.85}
				/>
			</mesh>
			<Text
				ref={label}
				font={fontUrl}
				position={[0, PEDESTAL_HEIGHT / 2, PEDESTAL_DEPTH / 2 + 0.01]}
				fontSize={0.4}
				color={palette.bright}
				outlineWidth={0.04}
				outlineColor={palette.stoneDeep}
			>
				0
			</Text>
		</group>
	);
};
