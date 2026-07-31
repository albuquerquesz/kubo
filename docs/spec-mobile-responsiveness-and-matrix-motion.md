# Mobile responsiveness and matrix motion specification

**Status:** in progress (P0 + P1 layout/nav/CTA matrix landed; hydration + P2 open)  
**Scope:** home page (`/`) responsive behavior; Hero Mosaic and final CTA Matrix animation  
**Evidence date:** 2026-07-31

## Objective

Make the home page dependable on phones and short landscape viewports without weakening its editorial visual language. The hero must keep its content readable and immediately actionable; the CTA Matrix must remain decorative, battery-conscious, static for reduced motion, and visually present before WebGL is ready.

This is a specification only. It does not authorize visual or behavior changes by itself.

## Evidence and current baseline

Playwright was run against the local development server at `http://localhost:3333/`.

| Viewport / state               | Observed result                                                                                                                                                                   | Evidence                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320 x 568                      | No horizontal document overflow. Hero fills the viewport, but the install command hit area measures **237.84 x 38px**.                                                            | [hero capture](../output/playwright/mobile-responsiveness-audit/home-320x568-hero.png)                                                                                             |
| 390 x 844                      | Hero is **390 x 844px**; Mosaic Canvas reports ready with **18 columns x 37 rows**. No horizontal overflow.                                                                       | [hero capture](../output/playwright/mobile-responsiveness-audit/home-390x844-hero.png)                                                                                             |
| 430 x 932                      | Hero remains legible, but the lower-aligned composition leaves a very large quiet area above the copy. Treat the vertical balance as a composition check, not a defect by itself. | [hero capture](../output/playwright/mobile-responsiveness-audit/home-430x932-hero.png)                                                                                             |
| 844 x 390 landscape            | Hero grows to **441.75px** while the visual viewport is 390px high. The initial copy/install action is therefore partly below the fold.                                           | [hero capture](../output/playwright/mobile-responsiveness-audit/home-844x390-landscape-hero.png)                                                                                   |
| 390 x 844 CTA                  | CTA is **352.5px** high; its Canvas is **390 x 351.5px**.                                                                                                                         | [CTA capture](../output/playwright/mobile-responsiveness-audit/home-390x844-final-cta.png)                                                                                         |
| CTA motion, normal preference  | Two CTA frames sampled 5.5 seconds apart differ by **272.783 absolute-error pixels** (ratio **0.000828725**), confirming the shader continues animating.                          | [frame A](../output/playwright/mobile-responsiveness-audit/cta-390-motion-a.png), [frame B](../output/playwright/mobile-responsiveness-audit/cta-390-motion-b.png)                 |
| CTA motion, reduced preference | Two frames sampled 5.5 seconds apart have **0 absolute-error pixels**. The settled result is correctly static after hydration.                                                    | [frame A](../output/playwright/mobile-responsiveness-audit/cta-390-reduced-motion-a.png), [frame B](../output/playwright/mobile-responsiveness-audit/cta-390-reduced-motion-b.png) |
| Mobile navigation, 390 x 844   | The drawer opens at full viewport size and focus moves to Close. Its current fixed/hidden overflow model has not been proven safe for short devices or text zoom.                 | [drawer capture](../output/playwright/mobile-responsiveness-audit/home-390x844-mobile-nav.png)                                                                                     |

The normal and reduced-motion CTA frame comparison is intentionally a behavior check, not a visual quality judgment. A running animation is appropriate only while its section is visible and motion is allowed.

## Current implementation map

| Concern                    | Canonical source                                                                                                                                                                                                                                                                                                           | Current behavior relevant to this specification                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hero layout                | [hero-section.tsx](<../apps/web/src/app/(home)/_components/hero-section.tsx>)                                                                                                                                                                                                                                              | Full-bleed `min-h-svh` composition, bottom-aligned content, fixed desktop-to-mobile spacing.                    |
| Hero artwork               | [mosaic-hero-canvas.tsx](<../apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx>), [mosaic-hero-boot.js](../apps/web/public/mosaic-hero-boot.js), [global.css](../apps/web/src/app/global.css)                                                                                                                     | Decorative, token-based Canvas with a boot paint, CSS fallback, DPR cap, and reduced-motion static phase.       |
| Final CTA                  | [final-cta-dot-matrix.tsx](<../apps/web/src/app/(home)/_components/final-cta-dot-matrix.tsx>)                                                                                                                                                                                                                              | Full-bleed CTA copy and actions over a decorative matrix.                                                       |
| CTA Matrix                 | [dot-matrix-backdrop.tsx](<../apps/web/src/app/(home)/_components/dot-matrix-backdrop.tsx>), [dot-matrix-canvas.tsx](<../apps/web/src/app/(home)/_components/dot-matrix-canvas.tsx>)                                                                                                                                       | React Three Fiber Canvas mounts with the footer and advances `u_time` every frame when reduced motion is false. |
| Header/drawer              | [site-header.tsx](../apps/web/src/components/site/site-header.tsx)                                                                                                                                                                                                                                                         | Fixed header; mobile navigation uses a `fixed inset-0` dialog.                                                  |
| Supporting mobile sections | [logo-marquee.tsx](<../apps/web/src/app/(home)/_components/logo-marquee.tsx>), [custom-stack-panel.tsx](<../apps/web/src/app/(home)/_components/custom-stack-panel.tsx>), [testimonials.tsx](<../apps/web/src/app/(home)/_components/testimonials.tsx>), [footer.tsx](<../apps/web/src/app/(home)/_components/footer.tsx>) | Includes a draggable marquee, cropped media panels, a visually unhinted carousel, and compact footer links.     |

## Prioritized required changes

### P0 — restore reliable hero contract coverage

Update [hero-motion-parity.test.ts](../apps/web/test/hero-motion-parity.test.ts). It still asserts the removed `EtherealBeamsCanvas` and obsolete `min-h-[calc(100svh-3rem)]` class. The focused run currently has **12 passing / 2 failing** assertions for those stale expectations, while [hero-mosaic-background.test.ts](../apps/web/test/hero-mosaic-background.test.ts) passes (**2 tests / 107 assertions**).

Replace the retired stage assertions with current contracts:

- `MosaicHeroCanvas` is the only hero artwork component.
- the artwork is decorative, pointer-inert, and has a static reduced-motion path;
- the hero has an explicit mobile/short-viewport containment contract;
- no horizontal document overflow occurs at the supported mobile widths.

**Acceptance:** the focused motion and Mosaic test files both pass, and no test describes retired Ethereal/sticky behavior as shipped behavior.

**Estimated effort:** S.

### P1 — protect the short landscape hero

At 844 x 390, natural hero content forces the section to 441.75px. A visitor must scroll before the first install action is fully visible. Define a short-viewport responsive mode for `max-height` phone landscape sizes.

Implementation requirements:

- preserve the semantic heading, description, package manager, and copy action; do not hide primary conversion controls;
- use `svh`/safe viewport sizing and a short-height media query to tighten hero top padding, bottom padding, title size/line-height, copy margin, and rail spacing;
- ensure the full command button and its visible focus ring are inside the first visual viewport with an 8px minimum lower clearance after the fixed header is accounted for;
- retain the normal portrait composition at 320–430px; the short-height tuning must not become the default phone layout;
- keep the Mosaic as an `aria-hidden`, `pointer-events-none` background.

**Acceptance:** at 844 x 390 and 667 x 375 landscape, the heading, supporting copy, manager trigger, and entire copy-command button are visible without a scroll; `scrollWidth <= innerWidth`.

**Estimated effort:** M.

### P1 — make mobile navigation safe-area and text-zoom resilient

The mobile dialog in [site-header.tsx](../apps/web/src/components/site/site-header.tsx) is fixed to the viewport and uses `overflow-hidden`. Its bottom utility group cannot independently scroll, so it may be clipped by browser chrome, safe areas, 200% text zoom, or short landscape heights.

Implementation requirements:

- apply `padding-top: env(safe-area-inset-top)` and `padding-bottom: env(safe-area-inset-bottom)` through Tailwind arbitrary properties or a component class;
- keep the header/action bar and CTA reachable, but make the dialog’s central content or the entire inner column vertically scrollable with `overscroll-behavior: contain`;
- preserve modal focus containment, Escape behavior, restored trigger focus, and body-scroll lock;
- test the drawer at 320 x 568, 375 x 667, 390 x 844, and a short landscape viewport at 200% text zoom.

**Acceptance:** every drawer link and Close action is reachable; there is no background scroll, focus escape, or clipped bottom action.

**Estimated effort:** M.

### P1 — make CTA Matrix responsible for mobile GPU and motion preferences

The CTA Canvas is mounted through the footer and [dot-matrix-canvas.tsx](<../apps/web/src/app/(home)/_components/dot-matrix-canvas.tsx>) updates `u_time` in `useFrame`. It is configured with `dpr={[1, 2]}` and has no visibility gate. [dot-matrix-backdrop.tsx](<../apps/web/src/app/(home)/_components/dot-matrix-backdrop.tsx>) initializes `reducedMotion` to `false`, then learns the preference in an effect. That permits an animated pre-effect frame for reduced-motion users.

Implement the following as one cohesive CTA Matrix contract:

1. Add an IntersectionObserver-driven `isInView` state with a small prewarm margin. When the CTA is out of view, stop the render loop (`frameloop="never"` or equivalent demand rendering) and do not advance `u_time`.
2. On mobile/coarse-pointer contexts, cap DPR to 1 (or the measured device DPR if lower). Keep the desktop quality policy explicit and testable.
3. Resolve `prefers-reduced-motion` before rendering an animated frame. Use a client-safe media-query subscription pattern that starts in a neutral/static state; reduced motion must render the deterministic final field and never schedule a time update.
4. Add a CSS dot-matrix fallback below the WebGL Canvas. It must be visible before hydration and if WebGL fails, use the same dark/gold treatment, be decorative, and cause no content/layout shift. Reveal the Canvas only after it reports ready.
5. Retain `aria-hidden` and pointer inertness for both layers.

**Acceptance:**

- at 390px, `u_time` remains unchanged while the CTA is offscreen;
- normal motion changes only while the CTA is in/near view;
- `prefers-reduced-motion: reduce` produces matching capture pairs immediately after first paint and after 5.5 seconds;
- fallback is visibly present with Canvas disabled and is replaced without CLS;
- CTA controls remain above the decorative layers and keep at least a 4.5:1 local text contrast.

**Estimated effort:** M.

### P1 — keep the Hero Mosaic copy-safe at mobile widths

The Mosaic field’s normalized bands are shared across breakpoints; protection is primarily the CSS veil. Its technical reduced-motion and first-paint implementation is sound, but its narrow-width composition needs an explicit visual contract instead of relying on a broad dark overlay.

Implementation requirements:

- tune only mobile band placement/veil stops if evidence shows bright cells under copy; preserve the current gold-only palette and rounded tile geometry;
- keep the copy-safe region dark through approximately 70–76% of the mobile frame, while preserving visible gold energy at the far-right edge;
- do not add a smooth full-screen gradient, continuous pale rails, or a white glow behind text;
- keep the boot and React renderers aligned; if band constants change, update both and extend parity coverage.

**Acceptance:** at 320, 390, and 430px the title, description, manager, and command are readable; artwork reaches every hero edge; Canvas reports ready without layout shift; `scrollWidth <= innerWidth`.

**Estimated effort:** M.

### P1 — remove the Hero Mosaic hydration mismatch

The pre-hydration boot painter gives the Mosaic an excellent first visual frame, but it mutates React-owned Canvas attributes and inline `--mosaic-pitch` before hydration. The Playwright development run reports a React hydration mismatch between the server’s `data-mosaic-ready="false"` / fallback pitch and the boot-painted `data-mosaic-ready="true"`, backing dimensions, and measured pitch.

Implementation requirements:

- retain a stable first paint, but avoid mutating attributes or inline styles that React expects to hydrate from server markup;
- establish one explicit boot-to-React adoption contract: either paint a truly separate pre-hydration layer that React replaces cleanly, or make the server/client initial Canvas state match the boot state without viewport-dependent markup drift;
- do not use a blanket `suppressHydrationWarning` as the final solution; it hides evidence without making ownership clear;
- keep the Canvas decorative and preserve its no-layout-shift behavior while ownership changes.

**Acceptance:** a fresh mobile-page load produces no React hydration mismatch in Playwright console output, the Canvas still reports ready, and a first/settled screenshot pair does not flash or change hero bounds.

**Estimated effort:** M–L.

### P2 — mobile target sizes and interaction affordance

Make the following targets a minimum of **44 x 44px** without adding desktop-only visual bulk:

- manager trigger and copy-command shell in [hero-install-card.tsx](<../apps/web/src/app/(home)/_components/hero-install-card.tsx>); the observed 320px copy shell is only 38px high;
- footer links in [footer.tsx](<../apps/web/src/app/(home)/_components/footer.tsx>), using full-row links with clear keyboard focus. Do not rely on hover-only external arrows on touch;
- testimonial carousel affordance in [testimonials.tsx](<../apps/web/src/app/(home)/_components/testimonials.tsx>): show a visible continuation cue/progress or controls, preserve snap, and support keyboard focus movement;
- header density in [site-header.tsx](../apps/web/src/components/site/site-header.tsx): at 320px, consider moving social links to the drawer or showing a smaller set so the primary menu is visually dominant.

**Acceptance:** controls meet the size contract at 320px, have visible focus, and retain no-overflow behavior.

**Estimated effort:** S–M, depending on carousel controls.

### P2 — prevent mobile section/media regressions

- The logo marquee uses `touch-action: pan-x`; revise its gesture threshold/axis handling so a vertical swipe that starts over the 160px strip still scrolls the page. Horizontal dragging may remain after intent is clear.
- The image slot in [custom-stack-panel.tsx](<../apps/web/src/app/(home)/_components/custom-stack-panel.tsx>) combines `aspect-[1.9]`, `min-h-[16rem]`, and `object-cover`. Define per-asset mobile crop or contain behavior so important product UI is not lost at 320–430px.
- Long external testimonial titles must have `min-w-0` plus a defined wrap/clamp policy; no card may create horizontal overflow.
- Give raw marquee images explicit intrinsic `width` and `height` attributes.

**Acceptance:** vertical swipes scroll normally over integrations; relevant panel screenshot content remains visible; long fixture titles wrap safely; all supported widths keep `scrollWidth <= innerWidth`.

**Estimated effort:** M.

### P2 — remove avoidable animation/layout overhead

- Cache Hero Canvas dimensions from `ResizeObserver`; do not call `getBoundingClientRect()` on every 12fps draw if size has not changed.
- Replace the shared CTA button `transition-all` usage with explicit animated properties such as `transition-colors` and intentional transform transitions only.
- Add a sampled parity test, or a small shared generation strategy, for duplicated Mosaic band values in the boot renderer and React renderer.

**Acceptance:** animation frames update visual state only, no known animation uses `transition-all`, and boot/hydrated mosaic samples stay visually consistent.

**Estimated effort:** S–M.

## Responsive implementation order

1. Repair stale tests and add mobile viewport assertions (P0).
2. Fix short-landscape hero containment and mobile navigation scrolling/safe areas (P1).
3. Harden CTA Matrix: fallback, visibility pause, DPR policy, and reduced-motion first-paint behavior (P1).
4. Tune Hero Mosaic mobile composition against screenshots only if the first two layout changes expose a contrast regression (P1).
5. Deliver touch target, marquee, media, carousel, and footer affordance improvements (P2).
6. Consolidate performance/parity refinements (P2).

## Required verification

Use Playwright browser checks; do not treat CSS inspection alone as sufficient.

| Check                 | Required assertions                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portrait phones       | 320 x 568, 375 x 667, 390 x 844, and 430 x 932: no horizontal overflow; visible header/menu; readable hero and CTA; interactive elements meet target size.                                               |
| Short landscape       | 667 x 375 and 844 x 390: the complete first hero action is visible; mobile menu/CTA controls are not clipped.                                                                                            |
| Text zoom / safe area | 200% text zoom and a safe-area-capable device emulation: drawer is scrollable, all actions reachable, focus trap and Escape retain current behavior.                                                     |
| Hero Mosaic           | Canvas is ready within two animation frames after hydration; artifact fills hero bounds; no bright field compromises the copy zone; reduced motion has stable capture pairs.                             |
| CTA Matrix            | With normal motion, the field changes only while in/near view. With reduced motion, first and 5.5-second captures match. With Canvas disabled, CSS fallback remains visible and CTA layout is unchanged. |
| Interactions          | Copy action works; manager select opens and closes; marquee allows vertical page scroll; carousel continuation is discoverable; drawer focus starts at Close and returns to its trigger.                 |
| Automation            | Update focused Bun tests and add a browser-level mobile smoke check for `document.documentElement.scrollWidth <= window.innerWidth` at every required viewport.                                          |

## Non-regression constraints

- Keep the Hero Mosaic and CTA Matrix decorative (`aria-hidden`, pointer inert) and preserve semantic headings/actions above them.
- Keep the Kubo gold/near-black palette; do not introduce copied third-party logos, typefaces, artwork, or remote visual dependencies.
- Retain static reduced-motion visuals rather than removing the background completely.
- Preserve the existing desktop composition unless a shared utility change explicitly requires a desktop review.
- Keep screenshots and generated Playwright artifacts under `output/playwright/`; they are evidence, not shipping assets.
