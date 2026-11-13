import type { InstancedMesh } from "three";

type PlaceInstance<Item> = (
	mesh: InstancedMesh,
	item: Item,
	index: number,
	elapsed: number,
) => void;

// Reescreve as matrizes de um InstancedMesh a partir de uma coleção do snapshot.
export const syncInstances = <Item>(
	mesh: InstancedMesh | null,
	items: readonly Item[],
	elapsed: number,
	place: PlaceInstance<Item>,
) => {
	if (!mesh) return;
	for (const [index, item] of items.entries()) place(mesh, item, index, elapsed);
	mesh.count = items.length;
	mesh.instanceMatrix.needsUpdate = true;
	if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
};
