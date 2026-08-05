# Reference clip analysis

Source: `https://x.com/claudeai/status/2019833113418035237/video/1`

Captured with Playwright from the X `<video>` element on 2026-08-05. The
element reported 1080×1080 and 12.053333 seconds. Samples were captured at
0.25-second intervals plus one-second checkpoints.

## Observable composition beats

| Window | Stage                                                         | Mascot read                                                            | Implementation implication                                           |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 0–2 s  | Cream plate, title, terminal and side UI establish/reposition | Character appears as a small pixel silhouette around the terminal edge | Animate stage layers separately; use discrete entrance poses         |
| 2–4 s  | Workspace continues settling; terminal is the anchor          | Character becomes readable above/behind the terminal                   | Keep a stable floor/terminal relationship; avoid whole-SVG drift     |
| 4–9 s  | Composition is largely held                                   | Raised prop/appendage is a high-contrast pose with small pixel changes | Use a held sprite peak, not smooth rotation                          |
| 9–12 s | UI remains legible while character reposes                    | Prop disappears or returns to a neutral silhouette                     | End on a deliberate rest frame and leave enough hold for recognition |

The exact source contains browser playback controls in the captured viewport;
those are not part of the visual grammar. Track the terminal top edge and title
baseline, not the controls or the outer X page.

## What to borrow for Kubo

- Cream plate → use the project's cream token, not Claude's sampled color.
- Dark terminal → use the existing CLI component and its yellow accent.
- Side-window parallax → move decorative wrappers, never the mascot feet.
- Pixel performance → authored frame swaps with longer holds at readable peaks.
- Editorial calm → limit the loop to a few meaningful beats rather than adding
  idle jitter, smooth breathing, or a spring.

## What not to borrow

Do not reproduce the orange character, checker flag, title, terminal copy,
window screenshots, exact silhouettes, or any extracted frame as an asset.
This file records motion technique only.
