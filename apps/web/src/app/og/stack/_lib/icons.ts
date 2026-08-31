import { readFile } from "node:fs/promises";
import path from "node:path";

import { Resvg } from "@resvg/resvg-js";

const ICON_SIZE = 64;
const publicRoot = path.join(process.cwd(), "public");

const cache = new Map<string, Promise<string | null>>();

function mimeForExt(ext: string): string | null {
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".ico") return "image/x-icon";
  return null;
}

function toDataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function svgBufferToPngDataUrl(svg: Buffer): string {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: ICON_SIZE },
  });
  return toDataUrl("image/png", Buffer.from(resvg.render().asPng()));
}

async function loadLocalIcon(iconPath: string): Promise<string | null> {
  const relative = iconPath.replace(/^\//, "");
  const absolute = path.join(publicRoot, relative);
  if (!absolute.startsWith(publicRoot)) return null;

  try {
    const buffer = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    if (ext === ".svg") return svgBufferToPngDataUrl(buffer);
    const mime = mimeForExt(ext);
    if (!mime) return null;
    return toDataUrl(mime, buffer);
  } catch {
    return null;
  }
}

async function loadRemoteIcon(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4_000),
      headers: { Accept: "image/*" },
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await response.arrayBuffer());

    if (contentType.includes("svg") || url.toLowerCase().endsWith(".svg")) {
      return svgBufferToPngDataUrl(buffer);
    }

    if (contentType.startsWith("image/")) {
      return toDataUrl(contentType.split(";")[0]!.trim(), buffer);
    }

    const ext = path.extname(new URL(url).pathname).toLowerCase();
    const mime = mimeForExt(ext);
    if (!mime) return null;
    return toDataUrl(mime, buffer);
  } catch {
    return null;
  }
}

async function resolveIconSrc(icon: string): Promise<string | null> {
  if (!icon) return null;
  if (icon.startsWith("https://") || icon.startsWith("http://")) {
    return loadRemoteIcon(icon);
  }
  if (icon.startsWith("/")) {
    return loadLocalIcon(icon);
  }
  return null;
}

/** Resolve a tech icon to a raster data URL suitable for `next/og` ImageResponse. */
export function loadTechIconDataUrl(icon: string): Promise<string | null> {
  const cached = cache.get(icon);
  if (cached) return cached;

  const pending = resolveIconSrc(icon);
  cache.set(icon, pending);
  return pending;
}

export async function loadTechIconDataUrls(icons: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(icons.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (icon) => [icon, await loadTechIconDataUrl(icon)] as const),
  );
  return new Map(entries.filter((entry): entry is [string, string] => entry[1] != null));
}
