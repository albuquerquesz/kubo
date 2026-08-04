# Probe notes — Claude Security square promo (mechanics only)

## Status URL

`https://x.com/claudeai/status/2079990597973057691`

## Reliable path (preferred)

X headless playback is flaky (login wall / lazy media). Use public video CDN:

1. **fxtwitter:** `https://api.fxtwitter.com/claudeai/status/2079990597973057691`
2. **syndication:** `https://cdn.syndication.twimg.com/tweet-result?id=2079990597973057691&token=x`
3. Highest quality MP4 (observed):

```text
https://video.twimg.com/amplify_video/2079986661207732224/vid/avc1/1080x1080/Oxh4e0y8TtKXCOI4.mp4
```

Variants always square: `320x320`, `540x540`, `720x720`, `1080x1080`.  
Syndication reports `duration_millis: 6000`, `aspect_ratio: [1,1]`, `original_info: 1080×1080`.

## Local decode

```bash
ffprobe -v quiet -print_format json -show_format -show_streams "$MP4"
# expect width=1080 height=1080 duration=6.000000 r_frame_rate=30/1 nb_frames=180

ffmpeg -ss 0 -i "$MP4" -frames:v 1 t0.png
# also 0.5,1,1.5,2,2.5,3,4,5,5.9
```

## Playwright

Load MP4 via **data URL** (or local static server) into `<video>`; read:

```js
{
  (videoWidth, videoHeight, duration);
} // → 1080, 1080, 6
```

Seek + `video.screenshot()` for start / mid / end. Do not rely solely on `x.com` DOM video nodes in headless.

## Measured summary (2026-08-04)

| Field    | Value   |
| -------- | ------- |
| width    | 1080    |
| height   | 1080    |
| aspect   | 1:1     |
| duration | 6.000 s |
| fps      | 30      |
| frames   | 180     |

See `canonical-meta.json`, `ffprobe-summary.json`, `playwright-analysis.json`, `layout-bbox.json`.
