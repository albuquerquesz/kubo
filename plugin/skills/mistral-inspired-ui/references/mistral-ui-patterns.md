# Editorial AI UI pattern reference

## Scope and safety

This reference records durable interaction and composition patterns observed through a Playwright inspection of `https://mistral.ai/` on 2026-07-19. It is not a brand kit or a recipe for cloning the site. Do not reuse the reference site's text, product names, logos, icon drawings, images, color values, exact grid proportions, or visual arrangements. Translate principles into a new product and a clearly original art direction.

## Observed system

| Area             | Pattern observed                                                                               | Reusable interpretation                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Canvas           | Light neutral field punctuated by black, white, and vivid product visuals                      | Keep the quiet-canvas principle, but apply this project's black base and dark-yellow accent rather than the observed light palette. |
| Layout           | Large page cells, hairline dividers, asymmetrical hero, full-bleed section transitions         | Build a grid-first page frame with a shared rule token and a few deliberate asymmetric spans.                                       |
| Type             | Very large, compact editorial headline; small utility labels; concise body copy                | Pair a distinctive display sans with a compact utility/mono face. Drive hierarchy through size and space, not weight alone.         |
| Surfaces         | Mostly flat panels with light borders; little shadow; modest or square corners                 | Treat sections and cards as adjacent architectural cells. Reserve rounding for controls and inset elements.                         |
| Hero             | Text statement, adjacent supporting copy, vivid system-art panel, compact news/control cluster | Use a text-first proposition plus an original capability visual and one secondary proof/news slot.                                  |
| Proof            | Logo procession and wide customer/story rail                                                   | Show independent proof in an accessible, non-essential animated strip and an explicit-control story rail.                           |
| Product explorer | Mosaic overview followed by repeated deep-dive rows with a title, visual, facts, and action    | Use a discoverable index or section anchors, then repeat a consistent explain → demonstrate → act anatomy.                          |
| Footer           | Dense multi-column links with social, legal, app, and language utility                         | Use a structured link matrix that stacks on mobile without hiding legal or utility links.                                           |

## Observed scale and treatment

The Playwright/DOM pass found a compact fixed header (about 48 px), a desktop display headline near 4.5–5 rem, a mobile display scale around 40/48 px, medium headings around 20/24 px, and mono-style utility labels around 13 px. The source uses a warm off-white background, near-black type, fine gray rules, compact controls with small rounding, and saturated red-orange/amber visual fields; it also exposes a large inline-SVG icon system.

Use those proportions as a _relationship_, not a stylesheet to copy: choose a different display family, black/dark-yellow brand treatment, visual geometry, and icon set. The important hierarchy is display headline → concise support → mono utility label → clearly labelled control.

## Formats and hierarchy

Use this adaptable order when the brief does not prescribe another one:

`header → hero/proof slot → trust strip → story rail → product mosaic → capability deep dives → expertise/proof grid → deployment/options comparison → paired CTA → utility footer`

Make every module declare one role:

- **Orient:** headline, short context, primary conversion.
- **Explain:** product overview or visual system diagram.
- **Prove:** customer result, logo, security/deployment, or quantified claim.
- **Explore:** compact product index and linked deep dives.
- **Convert:** paired low- and high-commitment actions.

Use broad desktop cells; collapse multi-column features into copy-first vertical sections on narrow screens. Keep visuals after their associated explanation unless the image itself is the necessary orientation cue.

## Original starter tokens

These values are intentionally original starting points, not sampled values. They express this project's black base and dark-yellow accent; use existing project tokens when available.

```css
:root {
  --canvas: #090909;
  --surface: #111111;
  --surface-raised: #191919;
  --ink: #f5f1e8;
  --muted: #b7b0a2;
  --rule: color-mix(in srgb, var(--ink) 22%, transparent);
  --accent: #b8860b;
  --accent-ink: #090909;
  --display: "Satoshi", "Avenir Next", sans-serif;
  --utility: "IBM Plex Mono", monospace;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-5: 3rem;
  --space-8: clamp(4rem, 10vw, 10rem);
  --rule-width: 1px;
}
```

Prefer `grid-template-columns: repeat(12, minmax(0, 1fr))` for desktop scaffolding, then simplify the semantic order to one column below 768 px. Use `clamp()` for display scale; keep metadata small, legible, and non-essential to understanding.

## Components and icons

| Component     | Anatomy                                                                    | Requirement                                                                                                                   |
| ------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Header        | brand link, grouped primary nav, utility action, primary CTA               | Keep it shallow; make grouped content available by click/focus and a mobile dialog/sheet.                                     |
| Mega panel    | category headings, concise links, optional featured proof                  | Use a full-width ruled panel, not nested hover-only flyouts.                                                                  |
| Hero visual   | one original data/system/mockup field                                      | Give it a job; avoid ornamental gradients with no product meaning.                                                            |
| CTA           | primary conversion and lower-commitment secondary action                   | Differentiate with contrast, not excessive effects; label the intent clearly.                                                 |
| Carousel/rail | visible prev/next buttons, optional count/pagination                       | Buttons need accessible names and disabled states at endpoints.                                                               |
| Feature row   | title, explanation, evidence visual, compact metadata                      | Keep source order coherent when the desktop composition alternates.                                                           |
| Icon set      | directional arrow, plus/minus, menu, close, external-link, social/app mark | Use a consistent stroke/size family. Mark decorative SVGs `aria-hidden`; give meaningful controls text or an accessible name. |

## Motion

Observed motion favors functional movement over spectacle: content rails advance through controls; logo proof can loop; mobile menu and desktop grouped navigation reveal as panels; and scrolling changes composition rather than relying on a separate app shell.

Translate that into restrained motion:

- Use 160–240 ms opacity/translate transitions for menu and hover/focus feedback.
- Use 300–500 ms reveals only when they improve orientation; stagger sparingly.
- Make a logo ticker decorative and pauseable; all brands/proof must remain available without it.
- Never make autoplay the only way to see rail content. Do not animate layout continuously or hide content behind timed transitions.
- Disable non-essential transitions and looping animation under `prefers-reduced-motion: reduce`.

## Responsive rules

| Width   | Composition                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1440 px | Retain asymmetric hero spans, horizontal nav, two-to-four-column proof/product grids, and explicit rail controls.                                           |
| 768 px  | Reduce visual span complexity, turn wide rows into two columns or short scroll-snap rails, and preserve control labels.                                     |
| 390 px  | Use a one-column, copy-first flow; show a single menu trigger and contact/utility escape hatch; stack CTA choices; keep interactive targets at least 44 px. |

Do not treat a hidden desktop mega-menu in the accessibility tree as an acceptable mobile menu. Open the mobile navigation as a real dialog/sheet, trap focus, close with Escape, and restore focus to its trigger.

## Evidence captured with Playwright

- Desktop and 390 px full-page captures showed a large asymmetric hero, an adjacent compact news control, repeating ruled modules, wide story rails with previous/next controls, a repeated product-detail sequence, a deployment/options section, and a multi-column footer.
- A 390 px accessibility snapshot exposed an explicit `Toggle menu` control, a contact escape hatch, product rows reordered into copy → action → facts, and disabled endpoint states on rail controls.
- The desktop accessibility snapshot exposed grouped navigation, primary/secondary actions, multiple explicit previous/next controls, anchor-like product index links, social links, and a language combobox.

Use these as behavioral evidence only. Do not reproduce the source labels, assets, or DOM structure.
