import { useEffect } from "react";

type KeyCommand = () => void;

// Tecla (minúscula) para a ação discreta que ela dispara, sem estado segurado.
export type CommandKeys = Record<string, KeyCommand>;

export const useCommandKeys = (commands: CommandKeys) => {
	useEffect(() => {
		const runCommand = (event: KeyboardEvent) => {
			const command = commands[event.key.toLowerCase()];
			if (!command || event.repeat) return;
			event.preventDefault();
			command();
		};
		window.addEventListener("keydown", runCommand);
		return () => window.removeEventListener("keydown", runCommand);
	}, [commands]);
};
