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

/** Brand-yellow mark for OG cards — same paths as `KuboMark`. */
const KUBO_MARK_OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 763 678" fill="none"><path fill="#FBC80D" fill-rule="evenodd" d="M100 678H665A8 8 0 0 1 673 670V328H755A8 8 0 0 1 763 320V134A8 8 0 0 1 755 126H673V8A8 8 0 0 1 665 0H561A8 8 0 0 1 553 8V126H213V8A8 8 0 0 1 205 0H100A8 8 0 0 1 92 8V126H10A8 8 0 0 1 2 134V320A8 8 0 0 1 10 328H92V670A8 8 0 0 1 100 678ZM213 292H298V378H213ZM468 292H553V378H468ZM213 547H553V678H213Z"/></svg>`;

export function loadKuboMarkDataUrl(): Promise<string> {
  cachedMark ??= Promise.resolve(
    `data:image/svg+xml;base64,${Buffer.from(KUBO_MARK_OG_SVG).toString("base64")}`,
  );
  return cachedMark;
}
