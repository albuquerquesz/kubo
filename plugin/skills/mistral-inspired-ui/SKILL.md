---
name: mistral-inspired-ui
description: Design original editorial, grid-led AI product marketing interfaces informed by the durable UI patterns observed on mistral.ai. Use for AI landing pages, enterprise SaaS product showcases, technical navigation systems, proof-heavy marketing pages, and responsive black interfaces with dark-yellow accents, bold type, ruled modular panels, product-explanatory visuals, and restrained motion. Do not use to copy Mistral's brand, logo, names, copy, navigation labels, artwork, icons, colors, or identifiable page composition.
---

# Original editorial AI UI

Read [references/mistral-ui-patterns.md](references/mistral-ui-patterns.md) before planning or coding.

## Workflow

1. Establish the product, audience, primary conversion, existing brand tokens, and framework. If the brief is incomplete, state the assumptions and use an original B2B AI narrative.
2. Choose an original type pair, neutral palette, divider, spacing scale, and one accent family per visual module. Never extract or reuse the reference site's assets, copy, logos, exact colors, or layout geometry.
3. Compose one page frame with CSS Grid: header, dominant hero, proof, product explorer, conversion, and dense footer. Use Flexbox only for short control rows.
4. Build semantic and keyboard-operable interactions before decorative polish: navigation, menus, carousels, rail controls, anchors, and CTAs.
5. Recompose at 768 px and 390 px. Preserve reading order and the primary action; do not merely shrink desktop columns.
6. Verify the delivery checklist below and report the original system, assumptions, and tested breakpoints.

## Rules

- Use the project's dark editorial system by default: black canvas and surfaces, warm off-white text, muted supporting text, dark-yellow accents, restrained 1 px rules, and flat or minimally rounded surfaces. Preserve existing project tokens when they are available; do not introduce a light theme unless explicitly requested.
- Make product visuals explain a capability. Prefer an original mockup, diagram, data field, or CSS-built abstraction over stock imagery or generic page-wide gradients.
- Give each section one job: orient, explain, prove, explore, or convert. Keep the hero text-first with one unmistakable primary CTA.
- Use compact labels/chips for metadata, not as the main navigation or sole explanation.
- Keep arrows, chevrons, menu marks, close marks, and pagination controls functional, labelled affordances. Use an established icon library or original simple SVG; never trace or reuse source icons.
- Let divider lines and spacing create hierarchy instead of card shadows. Use vibrant color only inside a purposeful visual module.

## Responsive interaction contract

- On desktop, use a shallow header and, when needed, a full-width grouped navigation panel. Do not hide critical options behind hover alone.
- On mobile, replace grouped navigation with a dialog or sheet: visible close control, Escape dismissal, focus containment, focus restoration, and touch targets of at least 44 px.
- Make rails discoverable with visible previous/next controls. Prefer manual slide progression. If autoplay is necessary, provide pause, pause on hover/focus/interaction, and respect reduced motion.
- Give fixed-header targets `scroll-margin-top`. Preserve visible focus states and useful `:focus-visible` contrast.
- Use `prefers-reduced-motion` to disable decorative reveals, marquee loops, and transforms while retaining all information and controls.

## Delivery checklist

- [ ] Original brand, copy, icons, artwork, palette, and composition; no Mistral identifiers or source assets.
- [ ] Semantic landmarks, heading hierarchy, descriptive image alternatives, and visible keyboard focus.
- [ ] Accessible menu/dialog and explicit rail/carousel controls where those patterns are used.
- [ ] A tested 1440 px desktop, 768 px tablet, and 390 px mobile composition.
- [ ] Original black-and-dark-yellow or project-aligned tokens, sufficient text/control contrast, and reduced-motion behavior.
- [ ] One dominant message and primary CTA per viewport.
