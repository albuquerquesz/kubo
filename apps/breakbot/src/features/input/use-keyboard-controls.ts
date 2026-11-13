import { useEffect } from "react";
import { controls, markPressed, releaseControls } from "./controls";

type HeldControl = "leftHeld" | "rightHeld" | "keyFiring";

const controlByKey = new Map<string, HeldControl>([
	["ArrowLeft", "leftHeld"],
	["ArrowRight", "rightHeld"],
	[" ", "keyFiring"],
]);

const holdKey = (event: KeyboardEvent) => {
	const control = controlByKey.get(event.key);
	if (!control) return;
	event.preventDefault();
	controls[control] = true;
	markPressed("keyboard");
};

const releaseKey = (event: KeyboardEvent) => {
	const control = controlByKey.get(event.key);
	if (!control) return;
	controls[control] = false;
};

export const useKeyboardControls = () => {
	useEffect(() => {
		window.addEventListener("keydown", holdKey);
		window.addEventListener("keyup", releaseKey);
		return () => {
			window.removeEventListener("keydown", holdKey);
			window.removeEventListener("keyup", releaseKey);
			releaseControls();
		};
	}, []);
};
