/**
 * Radii already used on the home page and /new.
 * control: button.tsx, 0.375rem
 * tile: stack builder tiles, 0.5rem
 * panel: /new panels, rounded-2xl (1rem)
 * stage: home stack flow, rounded-3xl (1.5rem)
 * shell: install card, 12px
 */
export const kuboRadius = {
  control: "0.375rem",
  tile: "0.5rem",
  panel: "1rem",
  stage: "1.5rem",
  shell: "12px",
} as const;

export const kuboSurface = {
  panel: "overflow-hidden rounded-2xl border border-border bg-card",
  tile: "rounded-[0.5rem] border border-border bg-background",
  code: "overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950",
  control:
    "inline-flex items-center gap-2 rounded-[0.375rem] border border-border px-3 py-2 text-sm text-foreground hover:bg-muted",
} as const;
