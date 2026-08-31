import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal";
};

let cachedFonts: Promise<OgFont[]> | null = null;
let cachedMark: Promise<string> | null = null;

async function loadAsset(relativeFromLib: string): Promise<Buffer> {
  const path = fileURLToPath(new URL(relativeFromLib, import.meta.url));
  return readFile(path);
}

async function loadTtf(relativeFromLib: string): Promise<ArrayBuffer> {
  const buffer = await loadAsset(relativeFromLib);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function loadStackOgFonts(): Promise<OgFont[]> {
  cachedFonts ??= Promise.all([
    loadTtf("../_assets/SpaceGrotesk-Medium.ttf").then((data) => ({
      name: "Space Grotesk",
      data,
      weight: 500 as const,
      style: "normal" as const,
    })),
    loadTtf("../_assets/SpaceGrotesk-Bold.ttf").then((data) => ({
      name: "Space Grotesk",
      data,
      weight: 700 as const,
      style: "normal" as const,
    })),
    loadTtf("../_assets/IBMPlexMono-Regular.ttf").then((data) => ({
      name: "IBM Plex Mono",
      data,
      weight: 400 as const,
      style: "normal" as const,
    })),
    loadTtf("../_assets/IBMPlexMono-Medium.ttf").then((data) => ({
      name: "IBM Plex Mono",
      data,
      weight: 500 as const,
      style: "normal" as const,
    })),
  ]);
  return cachedFonts;
}

export function loadKuboMarkDataUrl(): Promise<string> {
  cachedMark ??= loadAsset("../_assets/kubo-mark.png").then(
    (buffer) => `data:image/png;base64,${buffer.toString("base64")}`,
  );
  return cachedMark;
}
