# Motion + layout timeline (reference promo)

**Source:** `https://x.com/claudeai/status/2079990597973057691` video/1  
**Canvas:** 1080×1080 @ 30fps, 180 frames, **6.000s**  
**Samples:** ffmpeg frames `t0`, `t0.5`, `t1`, `t1.5`, `t2`, `t2.5`, `t3`, `t4`, `t5`, `t5.9` (+ Playwright seeks 0 / 3 / 5.9)

Times are approximate (±1–2 frames). Outcomes only — no guessed cubic-bezier.

## Global

| Layer                        | Entire clip                       |
| ---------------------------- | --------------------------------- |
| Cream plate                  | Held                              |
| Title + beta chip            | Held (no entrance cut in samples) |
| Dark CLI panel + option list | Held; option **1** stays selected |
| Camera / crop                | Static 1:1                        |

## Time-ordered beats

| t (s)       | frames (≈) | Mascot                                 | Prop (reference only)                  | Notes                                   |
| ----------- | ---------- | -------------------------------------- | -------------------------------------- | --------------------------------------- |
| **0.0**     | 0          | Rest / start of walk; feet on panel TR | Absent                                 | Opening rest pose                       |
| **0.5**     | 15         | Walk cycle in progress                 | Shield **partial, left/behind** mascot | Prop enter                              |
| **1.0**     | 30         | Walk continues                         | Shield **left** of mascot, more opaque |                                         |
| **1.5–2.5** | 45–75      | Walk / bob                             | Shield mid-pass near body              | Slight bbox width change from prop+body |
| **3.0**     | 90         | Walk                                   | Shield still adjacent (left/mid)       | Mid-clip                                |
| **4.0**     | 120        | Walk                                   | Shield **right** of mascot             | Prop completed pass                     |
| **5.0**     | 150        | Walk settling                          | Shield fading / gone                   |                                         |
| **5.9**     | 177        | Near rest on perch                     | **Gone**                               | End frame ≈ start layout                |

## Portable interpretation

1. **Layout is a still composition** — motion budget is almost entirely the **character loop**.
2. **Prop orbit is optional product storytelling** — Kubo should **not** ship the shield; keep walk-only personality.
3. **No option-highlight animation** in this cut — selection is static “recommended” state.
4. If adding Kubo entrance polish, keep it **&lt;0.5s** so the 6s read is still mostly the held product shot.

## Layout constants (for Remotion mapping)

From [layout-bbox.json](./layout-bbox.json) on 1080²:

| Token               | Value                   |
| ------------------- | ----------------------- |
| `panelTopY`         | **340** (31.5%)         |
| `panelHeight`       | **~739** (68.4%)        |
| `panelLeft`         | **64** (~6%)            |
| `mascotWidth`       | **~111–133** (~10–12%)  |
| `mascotRightInset`  | **~85–113**             |
| `mascotFeetOnPanel` | `y1 ≈ panelTop` (flush) |
