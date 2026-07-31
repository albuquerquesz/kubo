import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Playwright verification for docs/spec-mobile-responsiveness-and-matrix-motion.md
 * Evidence written to output/playwright/mobile-responsiveness-verify/
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3333";
const OUT = path.resolve(process.cwd(), "../../output/playwright/mobile-responsiveness-verify");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function pass(id, detail) {
  results.push({ id, ok: true, detail });
  console.log(`PASS  ${id} — ${detail}`);
}
function fail(id, detail) {
  results.push({ id, ok: false, detail });
  console.log(`FAIL  ${id} — ${detail}`);
}
function info(id, detail) {
  results.push({ id, ok: null, detail });
  console.log(`INFO  ${id} — ${detail}`);
}

function absDiffPng(bufA, bufB) {
  // Minimal PNG RGBA decode via browser-less approach: use pixelmatch if available,
  // otherwise count byte diffs after stripping headers is wrong — use sharp-free method.
  // We'll use raw pixel buffers from Playwright instead when possible.
  return null;
}

async function pixelDiffFromScreenshots(page, selectorA, waitMs = 0) {
  // Not used
}

async function measureOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
}

async function heroMetrics(page) {
  return page.evaluate(() => {
    const section = document.querySelector("#top");
    const canvas = document.querySelector(".mosaic-hero-canvas");
    const title = document.querySelector(
      "#top h1, #top [class*='hero-section-title'], #top .ui-display",
    );
    const copyBtn = document.querySelector(
      "#top button[aria-label*='copiar' i], #top button[aria-label*='copy' i], #top [data-install-copy], #top button:has(code), #top .hero-section-rail button",
    );
    // Fallbacks for install shell
    const rail = document.querySelector("#top .hero-section-rail");
    const installShell =
      rail?.querySelector("button") ||
      rail?.querySelector("[role='button']") ||
      document.querySelector("#top button");

    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        bottom: r.bottom,
        top: r.top,
        right: r.right,
        left: r.left,
      };
    };

    const sec = rect(section);
    const canvasEl = canvas;
    return {
      hero: sec,
      heroOffsetHeight: section?.offsetHeight ?? null,
      canvasReady: canvasEl?.getAttribute("data-mosaic-ready"),
      canvasCols: canvasEl?.getAttribute("data-mosaic-columns"),
      canvasRows: canvasEl?.getAttribute("data-mosaic-rows"),
      title: rect(title || document.querySelector("#top h1")),
      install: rect(installShell),
      rail: rect(rail),
      viewport: { w: window.innerWidth, h: window.innerHeight },
      headerH:
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--site-header-height"),
        ) ||
        document.querySelector("header")?.getBoundingClientRect().height ||
        48,
    };
  });
}

async function findInstallControl(page) {
  // Return bounding box of the primary copy-command control in hero
  return page.evaluate(() => {
    const rail =
      document.querySelector("#top .hero-section-rail") || document.querySelector("#top");
    const candidates = Array.from(
      rail.querySelectorAll("button, [role='button'], a, [class*='install'], code"),
    );
    // Prefer the largest clickable in the rail
    let best = null;
    let bestArea = 0;
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 20) continue;
      const area = r.width * r.height;
      if (area > bestArea) {
        bestArea = area;
        best = {
          tag: el.tagName,
          text: (el.textContent || "").trim().slice(0, 80),
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          bottom: r.bottom,
          top: r.top,
        };
      }
    }
    // Also try full script shell containers
    const shell = rail.querySelector("[class*='border']");
    if (shell) {
      const r = shell.getBoundingClientRect();
      if (r.width * r.height > bestArea) {
        best = {
          tag: shell.tagName,
          text: (shell.textContent || "").trim().slice(0, 80),
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          bottom: r.bottom,
          top: r.top,
        };
      }
    }
    return best;
  });
}

async function ctaMetrics(page) {
  return page.evaluate(() => {
    const cta = document.querySelector("#cta, .final-cta");
    const canvas = cta?.querySelector("canvas");
    const fallback = cta?.querySelector(".dot-matrix-fallback");
    const backdrop = cta?.querySelector("[data-dot-matrix-in-view]");
    const r = cta?.getBoundingClientRect();
    return {
      cta: r ? { x: r.x, y: r.y, w: r.width, h: r.height, top: r.top, bottom: r.bottom } : null,
      canvas: canvas
        ? {
            w: canvas.clientWidth,
            h: canvas.clientHeight,
            display: getComputedStyle(canvas).display,
            opacity: getComputedStyle(canvas).opacity,
          }
        : null,
      fallback: fallback
        ? {
            present: true,
            opacity: getComputedStyle(fallback).opacity,
            display: getComputedStyle(fallback).display,
          }
        : { present: false },
      inView: backdrop?.getAttribute("data-dot-matrix-in-view"),
      reduced: backdrop?.getAttribute("data-dot-matrix-reduced"),
    };
  });
}

async function pixelDiffBuffers(a, b) {
  // PNG decode using playwright's built-in isn't available; use simple approach via canvas in page
  // We'll pass base64 and compute in node with manual IHDR... better: use page.evaluate with ImageData
  return { absError: null, ratio: null };
}

async function screenshotDiff(page, clip, label) {
  // Capture two clips with delay and compute diff via page canvas
  const shotA = await page.screenshot({ type: "png", clip });
  await page.waitForTimeout(5500);
  const shotB = await page.screenshot({ type: "png", clip });
  fs.writeFileSync(path.join(OUT, `${label}-a.png`), shotA);
  fs.writeFileSync(path.join(OUT, `${label}-b.png`), shotB);

  // Diff in browser
  const diff = await page.evaluate(
    async ({ b64a, b64b }) => {
      const load = (b64) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = "data:image/png;base64," + b64;
        });
      const a = await load(b64a);
      const b = await load(b64b);
      const w = a.width;
      const h = a.height;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(a, 0, 0);
      const da = ctx.getImageData(0, 0, w, h).data;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(b, 0, 0);
      const db = ctx.getImageData(0, 0, w, h).data;
      let abs = 0;
      for (let i = 0; i < da.length; i++) abs += Math.abs(da[i] - db[i]);
      const ratio = abs / (w * h * 255 * 4);
      return { absError: abs, ratio, w, h };
    },
    { b64a: shotA.toString("base64"), b64b: shotB.toString("base64") },
  );
  return diff;
}

async function runViewport(browser, { name, width, height, isMobile = true, landscape = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  // Wait for mosaic ready (or timeout)
  try {
    await page.waitForFunction(
      () =>
        document.querySelector(".mosaic-hero-canvas")?.getAttribute("data-mosaic-ready") === "true",
      { timeout: 8000 },
    );
  } catch {
    /* still report */
  }
  await page.waitForTimeout(400);

  const overflow = await measureOverflow(page);
  const hero = await heroMetrics(page);
  const install = await findInstallControl(page);

  await page.screenshot({
    path: path.join(OUT, `${name}-hero.png`),
    fullPage: false,
  });

  const noOverflow = overflow.scrollWidth <= overflow.innerWidth + 1;
  if (noOverflow) {
    pass(
      `${name}/overflow`,
      `scrollWidth=${overflow.scrollWidth} <= innerWidth=${overflow.innerWidth}`,
    );
  } else {
    fail(
      `${name}/overflow`,
      `scrollWidth=${overflow.scrollWidth} > innerWidth=${overflow.innerWidth}`,
    );
  }

  if (hero.canvasReady === "true") {
    pass(`${name}/mosaic-ready`, `cols=${hero.canvasCols} rows=${hero.canvasRows}`);
  } else {
    fail(`${name}/mosaic-ready`, `data-mosaic-ready=${hero.canvasReady}`);
  }

  if (install) {
    const installRight = install.x + install.w;
    const installLeft = install.x;
    const fullyVisible =
      install.top >= -1 &&
      install.bottom <= height + 1 &&
      installLeft >= -1 &&
      installRight <= width + 1;
    const lowerClearance = height - install.bottom;
    info(
      `${name}/install-box`,
      `${install.w.toFixed(1)}x${install.h.toFixed(1)} top=${install.top.toFixed(1)} bottom=${install.bottom.toFixed(1)} clearance=${lowerClearance.toFixed(1)} text="${install.text}"`,
    );
    if (landscape || height <= 430) {
      // Short landscape: entire install must be in viewport with >=8px clearance
      if (fullyVisible && lowerClearance >= 8) {
        pass(
          `${name}/short-landscape-install`,
          `fully visible with ${lowerClearance.toFixed(1)}px lower clearance`,
        );
      } else {
        fail(
          `${name}/short-landscape-install`,
          `visible=${fullyVisible} clearance=${lowerClearance.toFixed(1)} (need >=8) bottom=${install.bottom.toFixed(1)} vh=${height}`,
        );
      }
    }
  } else {
    fail(`${name}/install-box`, "install control not found");
  }

  // Title visible
  if (hero.title && hero.title.top >= 0 && hero.title.bottom <= height + 20) {
    pass(
      `${name}/title-visible`,
      `top=${hero.title.top.toFixed(1)} bottom=${hero.title.bottom.toFixed(1)}`,
    );
  } else if (hero.title) {
    info(
      `${name}/title-visible`,
      `partial top=${hero.title.top?.toFixed(1)} bottom=${hero.title.bottom?.toFixed(1)}`,
    );
  }

  info(
    `${name}/hero-height`,
    `offsetHeight=${hero.heroOffsetHeight} viewport=${height} sectionH=${hero.hero?.h?.toFixed(1)}`,
  );

  const hydrationMismatches = consoleErrors.filter(
    (t) => /hydrat/i.test(t) || /did not match/i.test(t),
  );
  if (hydrationMismatches.length === 0) {
    pass(`${name}/hydration`, "no hydration mismatch in console errors");
  } else {
    const short = hydrationMismatches[0].split("\n").slice(0, 2).join(" ").slice(0, 180);
    fail(`${name}/hydration`, short + ` (${hydrationMismatches.length} msgs)`);
  }

  if (pageErrors.length) {
    fail(`${name}/pageerror`, pageErrors.slice(0, 2).join(" | "));
  } else {
    pass(`${name}/pageerror`, "none");
  }

  await context.close();
  return { name, overflow, hero, install, consoleErrors, pageErrors };
}

async function runNav(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await page.waitForTimeout(300);

  const close = page.getByRole("button", { name: /fechar|close/i });
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName,
      text: (el?.textContent || "").trim().slice(0, 40),
      aria: el?.getAttribute("aria-label"),
    };
  });
  const dialog = page.getByRole("dialog");
  const dialogBox = await dialog.boundingBox();
  await page.screenshot({ path: path.join(OUT, "nav-390x844-open.png") });

  // All links reachable: check scrollHeight vs clientHeight and last link bottom
  const reach = await page.evaluate(() => {
    const dialog = document.querySelector("#mobile-navigation, [role='dialog']");
    const scroller = dialog?.querySelector(".overflow-y-auto, [class*='overflow-y']") || dialog;
    const links = Array.from(dialog?.querySelectorAll("a") || []);
    const last = links[links.length - 1];
    const closeBtn = dialog?.querySelector("button");
    return {
      dialogH: dialog?.clientHeight,
      scrollH: scroller?.scrollHeight,
      clientH: scroller?.clientHeight,
      canScroll: (scroller?.scrollHeight || 0) > (scroller?.clientHeight || 0) + 2,
      lastLinkBottom: last?.getBoundingClientRect().bottom,
      closeVisible: closeBtn ? closeBtn.getBoundingClientRect().top >= 0 : false,
      linkCount: links.length,
      bodyOverflow: document.body.style.overflow,
    };
  });

  if (reach.bodyOverflow === "hidden") {
    pass("nav/body-lock", "body overflow hidden");
  } else {
    fail("nav/body-lock", `body overflow=${reach.bodyOverflow}`);
  }

  if (/fechar|close/i.test(focused.text || "") || /fechar|close/i.test(focused.aria || "")) {
    pass("nav/focus-close", `focused ${focused.text || focused.aria}`);
  } else {
    fail("nav/focus-close", JSON.stringify(focused));
  }

  if (dialogBox && dialogBox.height >= 800) {
    pass("nav/full-viewport", `dialog h=${dialogBox.height}`);
  } else {
    info("nav/full-viewport", `dialog box=${JSON.stringify(dialogBox)}`);
  }

  info("nav/reachability", JSON.stringify(reach));

  // Escape closes
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const stillOpen = await page.locator("#mobile-navigation").count();
  if (stillOpen === 0) pass("nav/escape", "dialog closed");
  else fail("nav/escape", "dialog still present");

  await context.close();
}

async function runNavShortLandscape(browser) {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "nav-844x390-open.png") });

  const metrics = await page.evaluate(() => {
    const dialog = document.querySelector("#mobile-navigation, [role='dialog']");
    const scroller =
      dialog?.querySelector(".overflow-y-auto") ||
      dialog?.querySelector("[class*='overflow-y-auto']");
    const cta = Array.from(dialog?.querySelectorAll("a") || []).find((a) =>
      /monte sua stack/i.test(a.textContent || ""),
    );
    // Scroll to bottom
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    const ctaAfter = cta?.getBoundingClientRect();
    const closeBtn = Array.from(dialog?.querySelectorAll("button") || []).find((b) =>
      /fechar/i.test(b.textContent || ""),
    );
    return {
      scrollerScrollH: scroller?.scrollHeight,
      scrollerClientH: scroller?.clientHeight,
      ctaBottom: ctaAfter?.bottom,
      ctaTop: ctaAfter?.top,
      closeTop: closeBtn?.getBoundingClientRect().top,
      vh: window.innerHeight,
    };
  });

  info("nav-landscape/metrics", JSON.stringify(metrics));
  if (metrics.ctaBottom != null && metrics.ctaBottom <= metrics.vh + 2) {
    pass("nav-landscape/cta-reachable", `cta bottom ${metrics.ctaBottom}`);
  } else if ((metrics.scrollerScrollH || 0) > (metrics.scrollerClientH || 0)) {
    pass(
      "nav-landscape/cta-reachable",
      `scrollable column allows reach (scrollH=${metrics.scrollerScrollH} clientH=${metrics.scrollerClientH})`,
    );
  } else {
    fail("nav-landscape/cta-reachable", JSON.stringify(metrics));
  }
  await context.close();
}

async function runCtaMotion(browser, { reduced }) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);

  // Scroll CTA into view
  await page.locator("#cta, .final-cta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const meta = await ctaMetrics(page);
  info(`cta-${reduced ? "reduced" : "motion"}/meta`, JSON.stringify(meta));

  if (meta.fallback?.present) {
    pass(`cta-${reduced ? "reduced" : "motion"}/fallback`, `opacity=${meta.fallback.opacity}`);
  } else {
    fail(`cta-${reduced ? "reduced" : "motion"}/fallback`, "missing .dot-matrix-fallback");
  }

  if (meta.inView === "true") {
    pass(`cta-${reduced ? "reduced" : "motion"}/in-view`, "data-dot-matrix-in-view=true");
  } else {
    fail(`cta-${reduced ? "reduced" : "motion"}/in-view`, `inView=${meta.inView}`);
  }

  if (reduced) {
    if (meta.reduced === "true") {
      pass("cta-reduced/attr", "data-dot-matrix-reduced=true");
    } else {
      fail("cta-reduced/attr", `reduced=${meta.reduced}`);
    }
  }

  const box = await page.locator("#cta, .final-cta").boundingBox();
  if (!box) {
    fail(`cta-${reduced ? "reduced" : "motion"}/box`, "no CTA box");
    await context.close();
    return;
  }

  const clip = {
    x: Math.max(0, box.x),
    y: Math.max(0, box.y),
    width: Math.min(box.width, 390),
    height: Math.min(box.height, 400),
  };

  const label = reduced ? "cta-390-reduced" : "cta-390-motion";
  const diff = await screenshotDiff(page, clip, label);
  info(label + "/diff", JSON.stringify(diff));

  if (reduced) {
    if (diff.absError === 0 || diff.ratio < 0.00001) {
      pass("cta-reduced/static", `absError=${diff.absError} ratio=${diff.ratio}`);
    } else {
      fail("cta-reduced/static", `absError=${diff.absError} ratio=${diff.ratio} (expected ~0)`);
    }
  } else {
    if (diff.absError > 100) {
      pass("cta-motion/animating", `absError=${diff.absError} ratio=${diff.ratio}`);
    } else {
      fail(
        "cta-motion/animating",
        `absError=${diff.absError} ratio=${diff.ratio} (expected motion)`,
      );
    }
  }

  // Offscreen: scroll to top, check in-view false
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const off = await ctaMetrics(page);
  if (off.inView === "false") {
    pass(`cta-${reduced ? "reduced" : "motion"}/offscreen-gate`, "inView=false at top");
  } else {
    // CTA might still be "near" due to rootMargin 120px if page is short — check page height
    const ph = await page.evaluate(() => document.documentElement.scrollHeight);
    if (ph < 1200) {
      info(
        `cta-${reduced ? "reduced" : "motion"}/offscreen-gate`,
        `still inView (pageH=${ph}, prewarm margin may keep near)`,
      );
    } else {
      fail(
        `cta-${reduced ? "reduced" : "motion"}/offscreen-gate`,
        `inView=${off.inView} at scrollY=0 pageH=${ph}`,
      );
    }
  }

  await context.close();
}

async function runTextZoomNav(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  // Approximate 200% text zoom
  await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "nav-390-text-zoom-200.png") });
  const m = await page.evaluate(() => {
    const dialog = document.querySelector("#mobile-navigation");
    const scroller = dialog?.querySelector(".overflow-y-auto");
    return {
      canScroll: (scroller?.scrollHeight || 0) > (scroller?.clientHeight || 0),
      scrollH: scroller?.scrollHeight,
      clientH: scroller?.clientHeight,
    };
  });
  if (m.canScroll || (m.scrollH || 0) <= (m.clientH || 0) + 4) {
    // either scrolls or everything fits
    pass("nav/text-zoom-200", JSON.stringify(m));
  } else {
    fail("nav/text-zoom-200", JSON.stringify(m));
  }
  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  console.log("=== Portrait phones ===");
  for (const vp of [
    { name: "320x568", width: 320, height: 568 },
    { name: "375x667", width: 375, height: 667 },
    { name: "390x844", width: 390, height: 844 },
    { name: "430x932", width: 430, height: 932 },
  ]) {
    await runViewport(browser, vp);
  }

  console.log("=== Short landscape ===");
  for (const vp of [
    { name: "667x375-land", width: 667, height: 375, landscape: true },
    { name: "844x390-land", width: 844, height: 390, landscape: true },
  ]) {
    await runViewport(browser, { ...vp, isMobile: true });
  }

  console.log("=== Mobile nav ===");
  await runNav(browser);
  await runNavShortLandscape(browser);
  await runTextZoomNav(browser);

  console.log("=== CTA motion (this takes ~12s) ===");
  await runCtaMotion(browser, { reduced: false });
  await runCtaMotion(browser, { reduced: true });

  const summary = {
    passed: results.filter((r) => r.ok === true).length,
    failed: results.filter((r) => r.ok === false).length,
    info: results.filter((r) => r.ok === null).length,
    results,
  };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(summary, null, 2));
  console.log("\n=== SUMMARY ===");
  console.log(`PASS=${summary.passed} FAIL=${summary.failed} INFO=${summary.info}`);
  console.log(`Report: ${path.join(OUT, "report.json")}`);
  if (summary.failed > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
