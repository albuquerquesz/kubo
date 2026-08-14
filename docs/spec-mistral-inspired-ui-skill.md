# Spec: Mistral-Inspired UI Skill

## Status

Implemented and verified

## Date

July 19, 2026

## Context

The plugin needs a reusable design skill for creating technically confident AI-product marketing interfaces. The intended visual direction is informed by the structural and interaction patterns observed on `mistral.ai`, but it must never reproduce Mistral's brand identity, copy, navigation labels, product names, logo, or copyrighted artwork.

The skill is distributed with the Better T Stack plugin and must be concise enough to guide an agent during implementation while retaining the rules that materially affect the result: page composition, responsive behavior, accessible interaction, and brand-safe visual translation.

## Research evidence

The specification is grounded in a Playwright inspection of `https://mistral.ai/` on July 19, 2026 at 1440 px and 390 px. The inspection captured full-page desktop and mobile renders plus accessibility snapshots after dismissing the cookie dialog. It found an asymmetric text-first hero, compact news controls, logo proof procession, explicit-control story rails, a product mosaic followed by repeating deep dives, a deployment comparison, grouped desktop navigation, an explicit mobile menu trigger, endpoint-disabled rail buttons, footer link matrices, social links, and a language control.

Those observations establish the required _interaction and structural_ patterns only. The resulting skill must convert them to original design tokens, components, content, artwork, icons, and layouts.

## Goals

- Provide a clear invocation contract for AI landing pages, product showcases, enterprise SaaS sites, navigation systems, and responsive design systems.
- Encode an editorial, grid-led dark UI grammar: fine rules, black canvas, dark-yellow accents, sharp type, modular cells, and isolated product visuals.
- Require original brand expression and product-specific imagery rather than generic gradients or copied source-site artifacts.
- Make mobile a recomposed layout, not a scaled-down desktop layout.
- Establish minimum accessibility and interaction requirements for menus, carousels, controls, anchors, and motion.
- Give agents a repeatable delivery and verification checklist.

## Non-Goals

- Reproducing the reference website or its visual assets.
- Providing framework-specific components, starter code, or a dependency on a UI library.
- Acting as a universal marketing-copy skill; copy remains specific to the user's supplied brand and conversion goal.
- Requiring generated images for every implementation. A UI mockup, diagram, or CSS-built product visual is acceptable when it better explains the product.

## Deliverables

The implementation consists of the following plugin files:

| File                                                                  | Responsibility                                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `plugin/skills/mistral-inspired-ui/SKILL.md`                          | Invocation metadata, operating method, design/interaction rules, implementation constraints, and delivery checklist. |
| `plugin/skills/mistral-inspired-ui/references/mistral-ui-patterns.md` | Detailed pattern reference, page map, component anatomy, responsive comparison, and original starter tokens.         |
| `plugin/skills/mistral-inspired-ui/agents/openai.yaml`                | Codex-facing display name, short description, and default prompt.                                                    |

No external runtime, MCP server, npm dependency, or asset bundle is required.

## Invocation Contract

### Trigger conditions

The skill must apply when a user requests an AI-product marketing interface characterized by one or more of the following:

- editorial or grid-led landing page design;
- product showcase or product explorer;
- enterprise SaaS marketing page;
- fixed navigation with mega-menu or mobile menu sheet;
- an interface with bold display type, structural rules, modular panels, technical metadata, and restrained interaction.

The skill description must explicitly exclude requests to copy Mistral branding or proprietary design assets.

### Required discovery

Before implementation, the agent should identify:

1. Brand and available design tokens.
2. Audience and primary conversion action.
3. Product narrative and proof points.
4. Target framework and existing component constraints.

If the brief lacks these details, the agent uses a generic B2B product narrative, the project's black-and-dark-yellow palette, and the default page wireframe defined below. It must state any meaningful assumptions in its handoff.

## Design System Contract

### Structural principles

- Default to a black canvas and dark surfaces, warm off-white text, muted supporting text, dark-yellow accents, and shared 1 px divider tokens. Preserve existing project tokens when available; do not introduce a light theme unless explicitly requested.
- Do not introduce a theme toggle merely because a theme system exists; select the brief's intended theme deliberately.
- Build macro-layouts with CSS Grid and short control rows with Flexbox.
- Treat header, sections, cards, and footer as adjoining cells in one frame. Use whitespace and rules for hierarchy instead of elevated shadows.
- Keep corners square by default. Small radii are limited to controls and intentionally floating/inset surfaces.
- Pair a sharp sans-serif display/body face with a compact monospace face for metadata, filters, chips, and labels.
- Use one vivid accent family per visual module. Neighboring reading surfaces remain neutral.

### Information hierarchy

Each viewport should have one dominant message. A section should have a single primary role:

- orient;
- explain;
- prove;
- explore; or
- convert.

The default no-brief wireframe is:

`header → hero + product visual → trust strip → problem/outcome grid → product explorer → governance/proof → customer rail → paired CTA → footer`

### Imagery

Visuals must explain a product behavior, capability, system, or outcome. Prefer one of these forms:

- original abstract system graphic;
- product UI mockup;
- data or diagram collage;
- CSS-built tiled visual field.

Avoid unrelated stock photography and generic, full-page gradient treatments. Source visuals must remain original and must not imitate the reference site's arrangement, colors, pixel-art mark, or artwork.

### Starter tokens

The reference document may provide deliberately original tokens for canvas, text, muted text, rules, controls, spacing, and display scale. In this implementation, the tokens resolve to the project's black-and-dark-yellow interface by default. Preserve existing project tokens where they exist.

## Component and Interaction Requirements

### Header and navigation

Desktop navigation is shallow and fixed, with bordered navigation cells, a flexible spacer, an account/product chooser, and a high-contrast primary CTA. Grouped navigation appears in a full-width mega-menu.

Mobile navigation preserves the brand mark, one contact/sales escape hatch, and a menu trigger. The menu must be an accessible dialog or sheet with:

- a visible close control;
- Escape dismissal;
- focus containment while open;
- focus restored to the triggering control after close; and
- no content available only through hover or nested hover menus.

Anchored content must set an appropriate `scroll-margin-top` so a fixed header cannot obscure a target or its focus state.

### Hero and conversion controls

The hero is a tall, framed, text-first statement with one clear primary action. Supporting promotional/news content may use a small carousel or static featured item.

Carousels must have visible next/previous controls. Manual progression is preferred. If autoplay is explicitly required, it must use a 6–8 second interval, pause on hover, focus, and user interaction, expose a pause control, and politely announce user-initiated slide changes.

Use two CTA weights:

- neutral secondary control for low-commitment exploration;
- high-contrast dark or vivid primary control for high-commitment conversion.

Arrows or chevrons are directional affordances, not decorative ornaments.

### Content modules

- **Trust strip:** equal-weight monochrome customer marks in an edge-to-edge clipped or looping row; all marks remain discoverable without motion.
- **Story rail:** large linked customer or product panels in a snap-scrolling row with explicit previous/next controls.
- **Product explorer:** concise mosaic for overview followed by deeper panels with title/action row, supporting copy, explanatory visual, and monospace capability chips. A desktop dot/rail index is optional; reading order remains complete without it.
- **Feature chips:** quiet, uppercase monospace summaries; not primary navigation.
- **Footer:** dense ruled link matrix with social/app links, legal information, language selection when needed, and an original abstract sign-off.

## Responsive and Accessibility Requirements

The implementation must be verified at 1440 px, 768 px, and 390 px widths.

| Desktop behavior                    | Narrow behavior                                                |
| ----------------------------------- | -------------------------------------------------------------- |
| Horizontal navigation and mega-menu | Dialog/sheet navigation activated by an explicit menu control  |
| Multi-column mosaics and overlays   | Single-column reading order with visual after explanatory copy |
| Product index and rails             | Stacked sections or touch-friendly scroll-snap lists           |
| Wide framed hero                    | Compact vertical hero retaining the primary action             |
| Footer link matrix                  | Collapsed or stacked groups while preserving utility links     |

All implementations must:

- use semantic landmarks and real heading hierarchy;
- provide descriptive image alt text;
- keep interactive targets at least 44 px in the narrow layout;
- support keyboard operation and visible focus indicators;
- respect `prefers-reduced-motion` and retain all information without animation;
- preserve sufficient text/control contrast against every accent visual;
- avoid hover-only access to navigation or essential content.

## Implementation Workflow

1. Read `references/mistral-ui-patterns.md` before composing or coding.
2. Extract the brief or establish the documented default assumptions.
3. Define original type, black-and-dark-yellow or project-aligned tokens, divider token, CTA treatment, and breakpoints.
4. Lay out the page frame and primary content architecture with semantic HTML and CSS Grid.
5. Build interaction states for navigation, carousel/rail controls, and anchors before visual polish.
6. Add product-explanatory visual modules and compact metadata/chips.
7. Recompose at tablet and mobile breakpoints; do not simply scale desktop columns.
8. Run the delivery checklist and report the supplied system to the user.

## Validation Plan

### Structural validation

Run the skill validator after changes:

```sh
python3 /home/albqvxc/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugin/skills/mistral-inspired-ui
```

The validator must pass with a valid frontmatter block and required skill structure.

### Content review

Confirm that `SKILL.md` includes:

- a precise trigger description and brand-copy exclusion;
- a working method;
- design and component rules;
- responsive, accessibility, and reduced-motion constraints;
- a delivery checklist; and
- a link to the reference file.

Confirm that the reference file separates observed patterns from reusable interpretations and labels its starter tokens as original approximations.

### Forward test

Give the skill a representative request such as: “Design a landing page for an AI observability platform.” The resulting plan or implementation must include:

- an original product/brand narrative;
- the default page architecture or an intentional alternative;
- a palette and type rationale;
- desktop and 390 px behavior;
- keyboard-accessible mobile navigation and any carousel controls; and
- no copied Mistral content or brand assets.

## Acceptance Criteria

- The plugin exposes `Mistral-Inspired UI` with a concise default prompt.
- The skill consistently produces original editorial AI-product interfaces rather than a site clone.
- The resulting interface uses the project's black-and-dark-yellow system by default, unless the supplied brand explicitly requires another deliberate theme.
- An agent can identify the expected page architecture, visual hierarchy, interaction behavior, and breakpoints without consulting the live reference site.
- The skill directs agents to validate 1440 px, 768 px, and 390 px states.
- All mandatory interactive patterns have non-hover, keyboard-operable equivalents.
- `quick_validate.py` reports the skill as valid.

## Maintenance

Update the pattern reference when the design guidance needs to evolve, and update `SKILL.md` only when the invocation contract or mandatory implementation behavior changes. Keep the reference focused on durable UI principles; do not add copied brand assets, text, or exact source-site color/composition recipes.
