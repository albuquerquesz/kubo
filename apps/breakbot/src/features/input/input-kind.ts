import type { InputKind } from "#/shared/telemetry";

// Caneta conta como toque: o gesto é o mesmo.
const kindByPointer = new Map<string, InputKind>([
	["mouse", "mouse"],
	["touch", "touch"],
	["pen", "touch"],
]);

export const inputKindOf = (pointerType: string) => kindByPointer.get(pointerType) ?? "touch";
