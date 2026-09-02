import { readFile } from "node:fs/promises";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal";
};

let cachedFonts: Promise<OgFont[]> | null = null;
let cachedMark: Promise<string> | null = null;

async function loadTtf(assetUrl: URL): Promise<ArrayBuffer> {
  const buffer = await readFile(assetUrl);
  // Copy into a fresh ArrayBuffer — Buffer#buffer can be SharedArrayBuffer.
  return Uint8Array.from(buffer).buffer;
}

export function loadStackOgFonts(): Promise<OgFont[]> {
  cachedFonts ??= Promise.all([
    loadTtf(new URL("../_assets/SpaceGrotesk-Medium.ttf", import.meta.url)).then((data) => ({
      name: "Space Grotesk",
      data,
      weight: 500 as const,
      style: "normal" as const,
    })),
    loadTtf(new URL("../_assets/SpaceGrotesk-Bold.ttf", import.meta.url)).then((data) => ({
      name: "Space Grotesk",
      data,
      weight: 700 as const,
      style: "normal" as const,
    })),
    loadTtf(new URL("../_assets/IBMPlexMono-Regular.ttf", import.meta.url)).then((data) => ({
      name: "IBM Plex Mono",
      data,
      weight: 400 as const,
      style: "normal" as const,
    })),
    loadTtf(new URL("../_assets/IBMPlexMono-Medium.ttf", import.meta.url)).then((data) => ({
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
