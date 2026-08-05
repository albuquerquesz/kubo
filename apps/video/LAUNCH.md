# Kubo launch video (`kubo-launch`)

7s · **1080×1080** (1:1) · 30fps · PT-BR · music-only · brand mark animated (frame-driven).

**Grammar:** square CLI-perch — title stacked above a dark `create-kubojs` select panel; Kubo mark perched on the panel top-right with a walk loop.

See [docs/spec-kubo-launch-square-cli-perch.md](../../docs/spec-kubo-launch-square-cli-perch.md) and skill `kubo-square-cli-perch`.

## Preview

```bash
# from monorepo root
bun install
bun run dev:video

# or
cd apps/video && bun run dev
```

Open composition **`kubo-launch`** in Remotion Studio.

## Props (Studio)

| Prop          | Default                            |
| ------------- | ---------------------------------- |
| `command`     | `bun create kubojs`                |
| `musicFile`   | `audio/launch-bed.mp3` (or `null`) |
| `musicVolume` | 0.45                               |

## Music

Place a licensed bed track at:

`public/audio/launch-bed.mp3`

If the file is missing, Studio may warn on the Audio node — set `musicFile` to `null` in props until you have a track.

Default `musicFile` is `null` (no bed until you set it). No typing SFX.

## Render

```bash
cd apps/video
bun run render
# or: bunx remotion render kubo-launch out/kubo-launch.mp4
```

## Iterate

Edit scenes under `src/compositions/kubo-launch/` or tweak copy/timing via Studio props and `lib/timing.ts` / `lib/schema.ts`.
