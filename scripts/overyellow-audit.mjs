import pkg from "../apps/web/node_modules/playwright/index.js";
const { chromium } = pkg;
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outDir = join(repoRoot, "output/playwright");
mkdirSync(outDir, { recursive: true });

const REF = "https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096";
const KUBO = "http://127.0.0.1:3333/";

const regions = {
  leftCopy: { x: 0.02, y: 0.55, w: 0.28, h: 0.35 },
  center: { x: 0.35, y: 0.25, w: 0.25, h: 0.35 },
  rightEnergy: { x: 0.65, y: 0.2, w: 0.3, h: 0.5 },
  topLeft: { x: 0.02, y: 0.05, w: 0.25, h: 0.2 },
  midRightBand: { x: 0.55, y: 0.35, w: 0.2, h: 0.25 },
  full: { x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
};

async function sampleScreenshotRegions(page, clip, regions) {
  const buf = await page.screenshot({ type: "png", clip, animations: "disabled" });
  return page.evaluate(
    async ({ b64, regions }) => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/png" });
      const bmp = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = bmp.width;
      c.height = bmp.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const results = {};
      for (const [name, r] of Object.entries(regions)) {
        const x = Math.floor(r.x * c.width);
        const y = Math.floor(r.y * c.height);
        const w = Math.max(1, Math.floor(r.w * c.width));
        const h = Math.max(1, Math.floor(r.h * c.height));
        const data = ctx.getImageData(x, y, w, h).data;
        let R = 0,
          G = 0,
          B = 0,
          n = 0;
        let bright = 0,
          mid = 0,
          dark = 0,
          yellowish = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r0 = data[i],
            g0 = data[i + 1],
            b0 = data[i + 2];
          R += r0;
          G += g0;
          B += b0;
          n++;
          const lum = 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0;
          if (lum > 140) bright++;
          else if (lum > 45) mid++;
          else dark++;
          if (r0 > 80 && g0 > 60 && b0 < Math.min(r0, g0) * 0.55 && (r0 + g0) / 2 > b0 + 30) {
            yellowish++;
          }
        }
        results[name] = {
          avg: {
            r: Math.round(R / n),
            g: Math.round(G / n),
            b: Math.round(B / n),
          },
          lum: Math.round((0.2126 * R + 0.7152 * G + 0.0722 * B) / n),
          pctBright: +((100 * bright) / n).toFixed(1),
          pctMid: +((100 * mid) / n).toFixed(1),
          pctDark: +((100 * dark) / n).toFixed(1),
          pctYellowish: +((100 * yellowish) / n).toFixed(1),
        };
      }
      return results;
    },
    { b64: buf.toString("base64"), regions },
  );
}

async function captureKubo(browser, viewport, name) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(KUBO, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  try {
    await page.waitForSelector('canvas.mosaic-hero-canvas[data-mosaic-ready="true"]', {
      timeout: 5000,
    });
  } catch {}
  await page.waitForTimeout(400);

  const meta = await page.evaluate(() => {
    const hero = document.querySelector("section#top") || document.querySelector("section");
    const canvas = document.querySelector("canvas.mosaic-hero-canvas");
    const fallback = document.querySelector(".mosaic-hero-fallback");
    const styles = getComputedStyle(document.documentElement);
    const hr = hero?.getBoundingClientRect();
    return {
      hero: hr ? { x: hr.x, y: hr.y, w: hr.width, h: hr.height } : null,
      canvas: canvas
        ? {
            ready: canvas.dataset.mosaicReady,
            cols: canvas.dataset.mosaicColumns,
            rows: canvas.dataset.mosaicRows,
            iw: canvas.width,
            ih: canvas.height,
            opacity: getComputedStyle(canvas).opacity,
          }
        : null,
      fallbackOpacity: fallback ? getComputedStyle(fallback).opacity : null,
      tokens: {
        background: styles.getPropertyValue("--background").trim(),
        primary: styles.getPropertyValue("--primary").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        card: styles.getPropertyValue("--card").trim(),
      },
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    };
  });

  const path = join(outDir, `current-hero-overyellow-audit-${name}.png`);
  await page.screenshot({ path, fullPage: false, animations: "disabled" });

  const clip = { x: 0, y: 0, width: viewport.width, height: viewport.height };
  const samples = await sampleScreenshotRegions(page, clip, regions);
  await page.close();
  return { path: path.replace(repoRoot + "/", ""), meta, samples, viewport };
}

async function captureRef(browser, viewport, name) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;background:#0e0e0e;height:100%;overflow:hidden}
    img{display:block;max-width:100vw;max-height:100vh;width:auto;height:auto;margin:0 auto;object-fit:contain}
    .wrap{display:flex;align-items:center;justify-content:center;width:100vw;height:100vh}
  </style></head><body><div class="wrap"><img id="ref" src="${REF}" /></div></body></html>`);
  await page.waitForFunction(
    () => {
      const img = document.getElementById("ref");
      return img && img.complete && img.naturalWidth > 0;
    },
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);

  const imgBox = await page.evaluate(() => {
    const img = document.getElementById("ref");
    const r = img.getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      nw: img.naturalWidth,
      nh: img.naturalHeight,
    };
  });

  const path = join(outDir, `reference-fluxion-spread-audit-${name}.png`);
  await page.screenshot({ path, fullPage: false, animations: "disabled" });

  const clip = {
    x: Math.max(0, Math.floor(imgBox.x)),
    y: Math.max(0, Math.floor(imgBox.y)),
    width: Math.min(viewport.width, Math.floor(imgBox.w)),
    height: Math.min(viewport.height, Math.floor(imgBox.h)),
  };
  const samples = await sampleScreenshotRegions(page, clip, regions);
  await page.close();
  return {
    path: path.replace(repoRoot + "/", ""),
    imgBox,
    samples,
    viewport,
  };
}

const browser = await chromium.launch({ headless: true });
const report = { capturedAt: new Date().toISOString(), kubo: {}, reference: {} };

report.kubo["1440x900"] = await captureKubo(browser, { width: 1440, height: 900 }, "1440x900");
report.reference["1440x900"] = await captureRef(browser, { width: 1440, height: 900 }, "1440x900");

report.kubo["1908x1070"] = await captureKubo(browser, { width: 1908, height: 1070 }, "1908");
report.reference["1908x1070"] = await captureRef(browser, { width: 1908, height: 1070 }, "1908");

report.kubo["390x844"] = await captureKubo(browser, { width: 390, height: 844 }, "390x844");

// Close-ups
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(KUBO, { waitUntil: "networkidle", timeout: 60000 });
  try {
    await page.waitForSelector('canvas.mosaic-hero-canvas[data-mosaic-ready="true"]', {
      timeout: 5000,
    });
  } catch {}
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(outDir, "current-hero-overyellow-tile-closeup.png"),
    clip: { x: 900, y: 200, width: 400, height: 300 },
    animations: "disabled",
  });
  await page.screenshot({
    path: join(outDir, "current-hero-overyellow-left-copy.png"),
    clip: { x: 0, y: 400, width: 500, height: 400 },
    animations: "disabled",
  });
  await page.close();
}

{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;background:#0e0e0e;height:100%;overflow:hidden}
    img{display:block;max-width:100vw;max-height:100vh;margin:0 auto}
    .wrap{display:flex;align-items:center;justify-content:center;width:100vw;height:100vh}
  </style></head><body><div class="wrap"><img id="ref" src="${REF}" /></div></body></html>`);
  await page.waitForFunction(
    () => {
      const img = document.getElementById("ref");
      return img && img.complete && img.naturalWidth > 0;
    },
    { timeout: 30000 },
  );
  const box = await page.evaluate(() => {
    const r = document.getElementById("ref").getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.screenshot({
    path: join(outDir, "reference-fluxion-tile-closeup.png"),
    clip: {
      x: Math.floor(box.x + box.w * 0.62),
      y: Math.floor(box.y + box.h * 0.25),
      width: Math.floor(box.w * 0.3),
      height: Math.floor(box.h * 0.35),
    },
    animations: "disabled",
  });
  await page.screenshot({
    path: join(outDir, "reference-fluxion-left-copy.png"),
    clip: {
      x: Math.floor(box.x),
      y: Math.floor(box.y + box.h * 0.45),
      width: Math.floor(box.w * 0.35),
      height: Math.floor(box.h * 0.45),
    },
    animations: "disabled",
  });
  await page.close();
}

await browser.close();
writeFileSync(join(outDir, "overyellow-audit-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
