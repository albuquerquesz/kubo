---
name: Better T Stack
description: A dark, grid-led editorial system for choosing and generating explicit TypeScript stacks (Kubo / create-kubojs).
colors:
  warm-canvas: "#11110d"
  cream-ink: "#f2ede0"
  parchment-muted: "#b0a78d"
  soft-rule: "color-mix(in srgb, white 6%, #11110d)"
  frame-rule: "color-mix(in srgb, white 28%, #11110d)"
  recessed-surface: "#222118"
  raised-surface: "#211f16"
  card-surface: "#181814"
  popover-surface: "#1c1b15"
  signal-gold: "#c49314"
  signal-gold-bright: "#d6a72b"
  focus-ring: "#e0b43e"
  gold-on-canvas: "#11110d"
  destructive-coral: "#e86f5d"
  chart-gold-1: "#d6a72b"
  chart-gold-2: "#b78012"
  chart-gold-3: "#e1c56d"
  chart-gold-4: "#8f741f"
  chart-cream: "#f2ede0"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 5.8rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.065em"
  display-hero:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 8vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.065em"
  display-hero-lg:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "-0.01em"
  mission:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  structural: "0px"
  control: "0px"
  install-shell: "12px"
  install-inner: "8px"
spacing:
  rule: "1px"
  header-height: "3rem"
  page-gutter: "clamp(1rem, 4vw, 3rem)"
  frame-max: "1600px"
  cell: "20px"
  section-pad: "clamp(1.25rem, 3vw, 2.5rem)"
  control-sm: "8px"
  control-md: "12px"
  transition-ui: "150ms"
components:
  button-primary:
    backgroundColor: "{colors.signal-gold}"
    textColor: "{colors.gold-on-canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-gold-bright}"
    textColor: "{colors.gold-on-canvas}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    rounded: "{rounded.control}"
    height: "48px"
  metadata-kicker:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  framed-panel:
    backgroundColor: "{colors.warm-canvas}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.structural}"
    padding: "20px"
  card-panel:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.structural}"
    padding: "24px"
  install-script-shell:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.install-shell}"
    padding: "10px 12px"
  site-header:
    backgroundColor: "{colors.warm-canvas}"
    textColor: "{colors.parchment-muted}"
    height: "48px"
---

# Design System: Better T Stack

## Overview

**Creative North Star: "The System Manual"**

Better T Stack (product face: **Kubo**) should feel like a well-made infrastructure manual brought to life: exact, independent, and kinetic. A visible soft-rule grid, explicit states, and compact technical metadata make architecture choices feel inspectable. The shell is dark-first because it lives beside editors and terminals, not because developer tools must look neon or theatrical.

The design is architectural, not card-driven. Sections, navigation, controls, diagrams, and footers meet at shared 1 px soft rules. Product behavior carries the visual story through stack diagrams, create commands, compatibility states, and real usage data. Gold is a **signal**, not wallpaper: primary conversion surfaces, selected states, and structural emphasis only. Display titles stay cream ink; accent color is not used to colorize every second line of a headline.

It explicitly rejects Mistral's identity and assets, generic purple gradients, glowing glass cards, decorative terminal chrome, excessive shadows, rounded-card grids as default layout, and a split light/dark dual identity.

**Key Characteristics:**

- Dark, warm-olive canvas (`#11110d`) with cream ink (`#f2ede0`)
- Soft structural rules (`white` mixed 6% into canvas), not loud brown rails
- Contiguous grid cells; gutters reserved for content rhythm, not card decoration
- Archivo display + IBM Plex Mono kickers/commands
- Signal gold (`#c49314`) for primary actions and chart emphasis; cream titles
- Flat elevation: no decorative shadows on the marketing shell
- Mobile recomposes reading order; fixed header is 48 px (`3rem`)
- Authored marketing motion uses GSAP (hero title, scroll-reveal icons); UI state uses short 150 ms color transitions

## Colors

Warm olive-black neutrals with a single gold signal family. Canonical values live in `apps/web/src/app/global.css` on `:root, .dark` (the live marketing shell).

### Primary

- **Signal Gold** (`#c49314` / `--primary`, `--signal`): primary CTA fills (Build a stack), selected package-manager chips, gold chart series, optional kicker emphasis. Use as a decisive surface or marker, never as a full-page wash.
- **Signal Gold Bright** (`#d6a72b` / `--accent`): hover/selected gold lift and chart-1.
- **Focus Ring** (`#e0b43e` / `--ring`): keyboard focus rings and high-visibility outline only.

### Secondary

- Omit multi-hue explorer signals as system defaults. Module-local color (if any) must not compete with Signal Gold on the same band.

### Tertiary

- **Destructive Coral** (`#e86f5d` / `--destructive`): destructive controls and validation failures only.

### Neutral

- **Warm Canvas** (`#11110d` / `--background`): page canvas and primary shell.
- **Cream Ink** (`#f2ede0` / `--foreground`): primary text and display titles.
- **Parchment Muted** (`#b0a78d` / `--muted-foreground`): supporting copy, nav labels, metadata.
- **Soft Rule** (`color-mix(in srgb, white 6%, var(--background))` / `--rule`, also `--border`): default 1 px seams, frame divisions, control borders.
- **Frame Rule** (`color-mix(in srgb, white 28%, var(--background))` / `--rule-frame`): stronger lateral frame on tablet/mobile `ui-frame` only.
- **Card Surface** (`#181814` / `--card`): quiet media-adjacent or featured cells.
- **Recessed Surface** (`#222118` / `--muted`): hover wells and recessed groups.
- **Raised Surface** (`#211f16` / `--secondary`): secondary fills and recessed actions.
- **Popover Surface** (`#1c1b15` / `--popover`): menus and floating chrome.

**The Soft-Rule Rule.** Structural borders default to the soft white mix, not a high-contrast brown rail. Soft rules define bands; they never replace text contrast or focus rings.

**The Gold Rarity Rule.** Signal Gold is for actions, selected state, and intentional markers. Display headlines stay Cream Ink. Do not paint every alternating title line gold by default.

## Typography

**Display Font:** Archivo (via `--font-archivo`, next/font)
**Body Font:** Archivo
**Label/Mono Font:** IBM Plex Mono (via `--font-ibm-plex-mono`; CSS class `.ui-kicker`)

**Character:** Archivo is direct and engineered without terminal cosplay. IBM Plex Mono is reserved for kickers, indexes, package managers, commands, and short metadata.

### Hierarchy

- **Display** (600, section clamps such as `clamp(2.7rem, 5.5vw, 5.8rem)`, lh ~0.92, tracking −0.065em via `.ui-display`): one short dominant statement per major home section.
- **Display hero** (600, mobile `clamp(2rem, 8vw, 2.75rem)` / desktop `clamp(2.5rem, 4.5vw, 4.5rem)`): dual-title hero (SEO `h1.sr-only` + decorative animated line).
- **Headline** (600, ~1.75–3rem): subsection orientation.
- **Title** (600, ~1.25–1.5rem): module titles inside rails and cards.
- **Mission** (500, ~1.65–1.75rem, lh 1.3): right-rail positioning statement (max three editorial lines on home).
- **Body** (400, 1rem, 1.75): explanations capped near 65–75ch where layout allows.
- **Label / kicker** (500, 0.6875rem, 0.12em, uppercase): `.ui-kicker` technical metadata and section indexes.

**The One Statement Rule.** Display type carries a single declarative message. Feature detail moves into body copy and metadata instead of competing at the same scale.

## Elevation

The marketing shell uses **no shadows** (`--shadow-*: none` on dark). Depth comes from tonal steps (canvas → card → muted), soft rules, fixed header occlusion, and optional rule-grid fields (`.ui-rule-grid`). Menus use popover surface over an opaque backdrop without decorative blur.

**The Structural Depth Rule.** If hierarchy is weak, change tone, rule, or position. Do not add a drop shadow to compensate.

## Components

### Buttons

- **Shape:** square structural controls (`rounded-none` / `--radius: 0` on dark shell). Install script shell is the rare exception (`12px` explicit radius).
- **Primary:** Signal Gold fill, gold-on-canvas text; header CTA fills the 48 px bar (`h-12` / `--site-header-height: 3rem`).
- **Hover / Focus:** short tonal change (150 ms); `focus-visible` ring using Focus Ring gold.
- **Secondary / Ghost:** transparent or muted well with Soft Rule border; mono labels for utility actions.

### Chips / kickers

- **Style:** `.ui-kicker` uppercase mono; often text-only without pill fill.
- **Selected PM / segment:** gold fill on selected control; unselected stays muted text on canvas.

### Cards / Containers

- **Corner Style:** square (0 px) for structural panels and mosaic tiles.
- **Background:** Warm Canvas, Card Surface, or full Signal Gold for a single featured tile.
- **Shadow Strategy:** none.
- **Border:** Soft Rule 1 px; joined rails use `gap-px` + `bg-rule` so seams share one line.
- **Internal Padding:** ~20–40 px by band; outer frame max width 1600 px (`.ui-frame`).

### Inputs / Fields

- **Style:** canvas or card with Soft Rule border; install command row is mono.
- **Focus:** Focus Ring outline; do not rely on border color alone for keyboard users.
- **Error / Disabled:** Destructive Coral for invalid; disabled at reduced opacity with retained legibility.

### Navigation

Fixed site header is **48 px** (`h-12`, `--site-header-height: 3rem`). Brand mark, Product/System links, GitHub, and Build a stack share one row of soft-rule cells. Nav labels are mono `text-sm` without forced uppercase on primary tabs. Mobile menu exposes all destinations without hover-only discovery; Escape closes and restores focus.

### Install script shell (signature)

Hero lower rail: eyebrow **Initialize with** + borderless PM select **outside** the script box; rounded shell (`12px`) holds `$ command` + Copy only. Command strings come from the shared create-command map (default bun).

### Scroll-reveal icons (signature)

Desktop-only row of masked icons above mission copy. GSAP scrub: `yPercent` 100→0 inside `overflow-hidden` squares, staggered. Decorative only (`aria-hidden`). See `.agents/skills/scroll-reveal-icons/SKILL.md`.

### Product mosaic

Asymmetric 12-column route map with contiguous tiles, soft seams, one gold featured tile max. Hover is tonal + small arrow offset (150–200 ms), no layout reflow.

## Do's and Don'ts

### Do:

- **Do** use the Soft Rule (`--rule` / `border-rule`) to join sections, controls, diagrams, and footer groups into one frame.
- **Do** keep display titles in Cream Ink; reserve Signal Gold for actions and intentional markers.
- **Do** use semantic tokens from `apps/web/src/app/global.css` instead of raw Tailwind palette colors.
- **Do** keep primary narrow-layout targets at least 44 px high.
- **Do** recompose mobile reading order; do not merely shrink the desktop grid.
- **Do** preserve visible focus, semantic headings, reduced-motion behavior, and keyboard access.
- **Do** use commands, configuration, diagrams, and real output to explain the product.
- **Do** keep header height and hero `100svh` offset in sync (`3rem`).

### Don't:

- **Don't** copy Mistral's identity, logo, navigation, copy, color arrangement, pixel artwork, or proprietary imagery.
- **Don't** use generic purple gradients, glowing glass cards, decorative terminal chrome, excessive shadows, or rounded-card grids as shorthand for developer tooling.
- **Don't** split the product into unrelated light and dark visual systems or treat violet explorer palettes as the marketing primary.
- **Don't** hide essential navigation or product information behind hover-only interaction.
- **Don't** use gradient text or colored side-stripe borders greater than 1 px.
- **Don't** wrap every section in an isolated floating card when a shared rule and clear spatial rhythm communicate hierarchy.
- **Don't** reintroduce high-contrast brown rails for routine seams (soft-rule is the default).
- **Don't** animate layout properties; prefer transform/opacity and GSAP for authored marketing motion.
