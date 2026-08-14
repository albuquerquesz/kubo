# Spec: Home Product Mosaic

## Status

Ready for implementation

## Date

July 19, 2026

## Goal

Add an original, navigable product mosaic to the Better T Stack home page. It should give visitors a compact overview of the primary product paths through an intentionally asymmetric grid, inspired by the _structural interaction pattern_ validated on `mistral.ai` and by the supplied reference image.

This is not a Mistral recreation. It must use Better T Stack’s dark "System Manual" visual system, its own copy, its existing routes, and no Mistral marks, colors, names, artwork, or layout measurements.

## Research evidence

Playwright inspection of `https://mistral.ai/` on July 19, 2026 found the following durable behaviors in its “Do it all” section:

- A text heading introduces an asymmetric visual overview before deeper content.
- Every product tile is a real link whose full surface is interactive; the accessibility tree exposes the destination and its title/description together.
- The overview has one large featured destination, supporting tiles with varied spans, neutral supporting surfaces, and one vivid active/featured surface.
- Desktop hover changes the featured tile’s surface color without moving the grid. At 1440 px, the inspected featured tile was a 400 × 200 px link with no transform applied.
- At 390 px, all product links remain in the accessibility tree. The page uses an explicit menu trigger rather than hover-only navigation.

The supplied image establishes the desired visual intent for this feature: a generous heading above a connected, editorial grid with a few offset/decorative cells. It does not supply reusable visual assets or content.

## Scope

### In scope

- A new reusable home-page section at `apps/web/src/app/(home)/_components/product-mosaic-section.tsx`.
- Rendering the section in `apps/web/src/app/(home)/page.tsx` after `CommandSection` and before `CapabilitySection`.
- CSS/Tailwind implementation using existing semantic tokens and the current `ui-frame`, `ui-rule-grid`, `ui-kicker`, and `ui-scroll-target` conventions.
- Full-card link interactions, keyboard focus, responsive recomposition, and reduced-motion-safe feedback.

### Out of scope

- Changing page routes, adding a CMS/data source, new dependencies, or reproducing the reference site’s navigation.
- Replacing the existing `CapabilitySection`; the mosaic is an overview/navigation layer and the capability section remains the deeper explanation.
- Decorative pixel art, Mistral-style marks, copied orange/blue color assignments, source copy, or proprietary imagery.

## Content model

Keep the item configuration local to the component as a typed readonly array. Each item has `id`, `href`, `eyebrow`, `title`, `description`, `tone`, and `gridArea` (or an equivalent layout variant).

| Item                | Route        | Role                 | Content direction                              |
| ------------------- | ------------ | -------------------- | ---------------------------------------------- |
| Start a project     | `/new`       | Featured conversion  | Build a typed stack in the browser.            |
| Stack builder       | `/new`       | Product path         | Choose technologies and inspect compatibility. |
| Documentation       | `/docs`      | Learn                | Read the architecture and CLI guides.          |
| Stack catalog       | `/stack`     | Explore              | Browse available integrations and choices.     |
| Analytics           | `/analytics` | Proof                | Inspect ecosystem and adoption signals.        |
| Community projects  | `/showcase`  | Social proof         | See projects made with the stack.              |
| Sponsor the project | `/sponsors`  | Secondary conversion | Support maintenance and open source work.      |

The exact customer-facing wording may be refined during implementation, but each route and purpose above must remain represented.

## Information architecture

```text
section#explore
├── section heading: “One stack. Your way.” (final copy may vary)
├── short supporting sentence
└── product mosaic (landmark list)
    ├── featured: Start a project
    ├── Stack builder
    ├── Documentation
    ├── Stack catalog
    ├── Analytics
    ├── Community projects
    └── Sponsor the project
```

Use a semantic `section` with an `h2`; use an `ul`/`li` only if it makes the repeated navigation semantics clearer. Each tile must contain one `next/link` that covers the complete visual cell. Do not place a button inside a link.

## Desktop composition

At `lg` and above, place the content in a 12-column CSS Grid inside the existing ruled page frame. The composition should feel intentionally assembled, not like a uniform card gallery.

- Place the featured “Start a project” tile high and near the visual center; span 5–6 columns and at least two grid rows.
- Use 2–3 compact supporting tiles around it, each spanning 3–4 columns.
- Place one wide, low-priority item along the base of the grid and one tall item at a side edge.
- Reserve 1–2 empty or non-interactive grid cells as quiet structural space. They may use the existing `ui-rule-grid` pattern and a single small index marker; they must be `aria-hidden` and must not look like broken or missing cards.
- Join adjacent cells with shared 1 px `border-rule` edges. Avoid card gaps, rounded containers, drop shadows, gradients, or floating panels.
- Titles sit toward the bottom of a cell. Labels/markers sit at the top. Descriptions stay concise and are hidden only when the title still communicates the route.
- Use the normal background/card/recessed surfaces for most tiles. The featured tile owns the existing `primary` token; no module should introduce a second vivid accent family.

The section heading remains outside the grid, uses `ui-display`, and gets generous vertical spacing. It must not borrow the reference heading or phrase.

## Interaction and state contract

### Link behavior

- Every tile navigates with standard `next/link` behavior to its configured internal route.
- Pointer cursor appears over the complete tile.
- Keyboard users reach each tile once, in the same reading order as the mobile layout, and activate it with Enter.
- The feature must not depend on drag, hover, scroll position, or JavaScript state to reveal a destination.

### Visual feedback

- Default: 1 px rule, stable background, and visible directional icon on every tile.
- Hover (fine pointer): a quick `background-color`, rule, and icon translation change only. Do not alter grid position, tile dimensions, or surrounding layout.
- Focus-visible: use the existing ring token with a 2 px visible outline and negative/appropriate offset so the whole tile boundary is recognizable.
- Active: preserve the focus treatment and apply a subtle tonal change.
- Respect `prefers-reduced-motion`: remove icon translation and keep color/border feedback immediate.

Use `group` only for a visual child effect; it must not hide the link intent or duplicate the destination in accessible text.

## Responsive behavior

| Width   | Layout requirement                                                                                                                                                                        |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1440 px | Asymmetric 12-column mosaic with explicit empty structural cells and the featured conversion tile visually dominant.                                                                      |
| 768 px  | Simplify to a 6-column ordered grid; retain one featured tile spanning the full row, then use two-column supporting tiles. Remove decorative empty cells before reducing content density. |
| 390 px  | One-column reading order. Every tile has a minimum 44 px interactive target, preferably a 160–200 px readable cell; the featured tile comes first and all descriptions are visible.       |

At tablet and mobile breakpoints, recompose rather than scale the desktop artwork. Do not use absolute positioning for any functional content. Decorative cells disappear below `lg`; they must never create blank, confusing space in the reading flow.

## Accessibility requirements

- The section has a unique `id` such as `explore` and uses `ui-scroll-target` so fixed navigation cannot obscure it.
- Maintain an `h2` after the preceding section’s heading order; do not skip heading levels for tile titles. Use non-heading text inside links unless those titles provide real document outline value.
- Include text labels for all destinations; an arrow icon is `aria-hidden`.
- Text and rules meet WCAG 2.2 AA contrast against each chosen token, including the `primary` featured tile.
- All routes remain available without hover, motion, a mouse, or JavaScript-enhanced animation.
- At narrow widths, touch targets are at least 44 × 44 px and adjacent target boundaries remain clear.

## Implementation outline

1. Create `product-mosaic-section.tsx` with the typed data array and a small presentational `MosaicTile` helper in the same module.
2. Use `Link` from `next/link` and `ArrowUpRight` from `lucide-react`; do not add an icon package.
3. Build the desktop placement using named variants/classes rather than inline pixel offsets. Let content determine row height with sensible `min-h-*` values.
4. Add the section to `page.tsx` between `CommandSection` and `CapabilitySection`.
5. Reuse token classes (`bg-background`, `bg-card`, `bg-muted`, `bg-primary`, `text-primary-foreground`, `border-rule`, `focus-visible:outline-ring`) rather than raw color values.
6. Add any small reusable reduced-motion rule only if existing utilities cannot express it; do not change global theme tokens for this section.

## Acceptance criteria

- The home page includes an original Better T Stack product mosaic after the command section.
- All seven configured destinations are complete full-surface links with correct internal hrefs.
- The desktop layout is visibly asymmetric and contiguous, with one featured conversion tile and no rounded-card gallery appearance.
- The tile reading/tab order matches the configuration order and the mobile visual order.
- Hover gives feedback without layout shift; focus-visible is clearly visible; reduced-motion eliminates nonessential movement.
- At 1440 px, 768 px, and 390 px, no content overlaps, clips, becomes unreachable, or depends on decoration for meaning.
- Existing `CapabilitySection` content continues to render after the mosaic.
- `bun run check` passes.

## Verification plan

1. Run `bun run check` from the repository root.
2. Start the web app with `bun dev` and inspect `/` using Playwright at 1440 × 1000, 768 × 1024, and 390 × 844.
3. At 1440 px, hover the featured tile and one neutral tile; verify only a color/rule/icon state changes and neighboring tiles do not move.
4. At 390 px, use Tab and Enter on the first and last mosaic links; verify their destinations and visible focus indication.
5. Emulate `prefers-reduced-motion: reduce` in browser devtools/Playwright and confirm no directional icon transition remains necessary to understand or operate the section.
