---
name: Better T Stack
description: A dark, grid-led system for choosing and generating explicit TypeScript architectures.
colors:
  midnight-canvas: "oklch(0.125 0.014 286)"
  cold-ink: "oklch(0.958 0.01 286)"
  technical-muted: "oklch(0.7 0.02 286)"
  structural-rule: "oklch(0.3 0.022 286)"
  recessed-surface: "oklch(0.17 0.018 286)"
  raised-surface: "oklch(0.205 0.022 286)"
  builder-violet: "oklch(0.75 0.19 308)"
  signal-cyan: "oklch(0.8 0.13 200)"
  signal-lime: "oklch(0.84 0.16 132)"
  signal-amber: "oklch(0.82 0.15 76)"
  destructive-red: "oklch(0.69 0.2 22)"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(3.4rem, 8.5vw, 8.9rem)"
    fontWeight: 650
    lineHeight: 0.84
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "-0.012em"
  label:
    fontFamily: "Azeret Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.12em"
rounded:
  structural: "0px"
  control: "4px"
  compact: "2px"
spacing:
  rule: "1px"
  control-sm: "8px"
  control-md: "12px"
  cell: "20px"
  frame-max: "1728px"
  frame-gutter-min: "16px"
  frame-inline-pad: "clamp(1rem, 2.5vw, 2.5rem)"
  frame-rail: "1px solid var(--rule)"
  page-gutter: "deprecated — use frame-max + optional frame-gutter-min; see docs/spec-page-frame-and-aligned-rails.md"
  section: "clamp(3.5rem, 8vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.builder-violet}"
    textColor: "{colors.midnight-canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.raised-surface}"
    textColor: "{colors.cold-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  metadata-chip:
    backgroundColor: "{colors.recessed-surface}"
    textColor: "{colors.technical-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  framed-panel:
    backgroundColor: "{colors.midnight-canvas}"
    textColor: "{colors.cold-ink}"
    rounded: "{rounded.structural}"
    padding: "20px"
---

# Design System: Better T Stack

## Overview

**Creative North Star: "The System Manual"**

Better T Stack should feel like a well-made infrastructure manual brought to life: exact, independent, and kinetic. A visible grid, explicit states, and compact technical metadata make complex architecture choices feel inspectable. The interface is dark-only because it lives beside editors and terminals in a developer's working environment, not because developer tools are expected to look neon or theatrical.

The design is architectural, not card-driven. Sections, navigation, controls, diagrams, and footers meet at shared 1 px rules. Product behavior carries the visual story through stack diagrams, commands, compatibility states, and real usage data. It explicitly rejects generic purple gradients, glowing glass cards, decorative terminal chrome, excessive shadows, rounded-card grids, and copied Mistral identity.

**Key Characteristics:**

- Dark-only, tinted neutral canvas
- Contiguous grid cells separated by a shared 1 px rule
- Large, compressed Archivo statements paired with compact Azeret Mono metadata
- Violet as the primary action color, with cyan, lime, and amber isolated by module
- Product UI and CSS diagrams instead of stock imagery or decorative gradients
- Mobile layouts recomposed into a single reading order with 44 px targets

## Colors

The palette uses cold violet-tinted neutrals with one dominant action color and three isolated signal families.

### Primary

- **Builder Violet** (`oklch(0.75 0.19 308)`): primary actions, focused states, active selections, and the brand mark. Use it as a decisive state, never as a page-wide gradient.

### Secondary

- **Signal Cyan** (`oklch(0.8 0.13 200)`): interactive product explorer modules.
- **Signal Lime** (`oklch(0.84 0.16 132)`): compatibility, success, and inspectable adoption.
- **Signal Amber** (`oklch(0.82 0.15 76)`): cautions and a single contrasting architecture layer.

### Tertiary

- **Destructive Red** (`oklch(0.69 0.2 22)`): destructive controls and validation failures only.

### Neutral

- **Midnight Canvas** (`oklch(0.125 0.014 286)`): page and primary panel background.
- **Cold Ink** (`oklch(0.958 0.01 286)`): primary text.
- **Technical Muted** (`oklch(0.7 0.02 286)`): supporting copy and metadata.
- **Structural Rule** (`oklch(0.3 0.022 286)`): every divider, frame, and default control border.
- **Recessed Surface** (`oklch(0.17 0.018 286)`): grouped controls and quiet regions.
- **Raised Surface** (`oklch(0.205 0.022 286)`): menus, secondary controls, and selected neutral states.

**The Isolated Signal Rule.** A module owns one vivid family. Adjacent reading surfaces remain neutral so color continues to communicate state and category.

## Typography

**Display Font:** Archivo (sans-serif fallback)
**Body Font:** Archivo (sans-serif fallback)
**Label/Mono Font:** Azeret Mono (monospace fallback)

**Character:** Archivo makes the interface feel direct and engineered without becoming terminal cosplay. Azeret Mono is reserved for configuration, commands, indexes, filters, and short metadata.

### Hierarchy

- **Display** (650, `clamp(3.4rem, 8.5vw, 8.9rem)`, 0.84): one short dominant statement per major viewport.
- **Headline** (600, `clamp(2.25rem, 5vw, 3rem)`, 1): section orientation and conversion statements.
- **Title** (600, 1.25rem to 1.5rem, 1.15): product modules and workflow steps.
- **Body** (400, 1rem, 1.75): explanations capped near 70 characters where layout allows.
- **Label** (500, 0.6875rem, 0.12em, uppercase): technical metadata, indexes, and capability summaries.

**The One Statement Rule.** Display type is for a single declarative message. Feature detail moves into body copy and metadata instead of competing in the same scale.

## Elevation

The system uses no shadows. Depth comes from tonal surface changes, occlusion, fixed navigation, adjoining borders, and one inset grid field for product visuals. Menus and dialogs use a raised neutral surface over an opaque overlay, without decorative blur.

**The Structural Depth Rule.** If a surface needs hierarchy, change its position, rule, or tone. Do not add a shadow to compensate for weak structure.

## Components

### Buttons

- **Shape:** compact control radius (4 px), with square structural edges around surrounding cells.
- **Primary:** Builder Violet with Midnight Canvas text, 48 px high for conversion actions.
- **Hover / Focus:** a short tonal change and a visible 2 px violet focus ring. Icons shift only when they indicate direction.
- **Secondary / Ghost:** Raised Surface or transparent canvas with a Structural Rule border.

### Chips

- **Style:** quiet neutral background, Technical Muted text, 11 px uppercase Azeret Mono, 4 px radius.
- **State:** selected chips use a restrained violet tint and remain summaries rather than primary navigation.

### Cards / Containers

- **Corner Style:** square (0 px) for structural panels.
- **Background:** Midnight Canvas, Recessed Surface, or a single signal color used by a visual module.
- **Shadow Strategy:** none.
- **Border:** one shared Structural Rule at 1 px.
- **Internal Padding:** 20 px on compact cells, fluid page gutter on major panels.

### Inputs / Fields

- **Style:** Raised Surface or Midnight Canvas with a 1 px Structural Rule and 4 px radius.
- **Focus:** border changes to Builder Violet with a visible focus outline.
- **Error / Disabled:** Destructive Red for invalid borders and text; disabled states retain legibility at reduced opacity.

### Navigation

Desktop navigation is fixed at 64 px and divided into bordered cells. Direct destinations remain visible; grouped destinations open through a keyboard-operable menu. Narrow navigation preserves the brand mark, GitHub escape hatch, and a 64 px menu trigger. The mobile dialog traps focus, closes with Escape, restores trigger focus, and exposes every destination without hover.

### Product Diagram

Stack architecture is represented as contiguous numbered nodes with one accent per layer, followed by the exact generated command. The diagram explains product behavior and remains readable without motion.

## Do's and Don'ts

### Do:

- **Do** use the 1 px Structural Rule to join sections, controls, diagrams, and footer groups into one frame.
- **Do** use semantic tokens from `apps/web/src/app/global.css` instead of raw Tailwind palette colors.
- **Do** keep primary narrow-layout targets at least 44 px high.
- **Do** place explanatory copy before product visuals when the layout collapses.
- **Do** preserve visible focus, semantic headings, reduced-motion behavior, and keyboard access.
- **Do** use commands, configuration, diagrams, and real output to explain the product.

### Don't:

- **Don't** copy Mistral's identity, logo, navigation, copy, color arrangement, pixel artwork, or proprietary imagery.
- **Don't** use generic purple gradients, glowing glass cards, decorative terminal chrome, excessive shadows, or rounded-card grids as shorthand for developer tooling.
- **Don't** split the product into unrelated light and dark visual systems or add a theme toggle.
- **Don't** hide essential navigation or product information behind hover-only interaction.
- **Don't** use gradient text or colored side-stripe borders greater than 1 px.
- **Don't** wrap every section in an isolated card when a shared rule and clear spatial rhythm communicate the hierarchy.
