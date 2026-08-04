# Kubo launch video (`kubo-launch`)

6s · **1080×1080** (1:1) · 30fps · PT-BR · music-only · brand mark animated (frame-driven).

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

## Audio

### Typing SFX (enabled by default)

Typewriter windows play Mixkit beds from:

`public/audio/sfx/fast-keyboard-typing.mp3`

- Command type: frames `0` → `CLI_PHASES.commandTypeEnd` (36)
- Project name type: frames `nameTypeStart` → `nameTypeEnd`

Other free clips in the same folder (`typing-laptop`, `hard-single-key`, …).  
**Studio:** press **Play** (space) — scrubbing the timeline does not always play audio; unmute the Studio speaker control.

### Music bed (optional)

Place a licensed bed at `public/audio/launch-bed.mp3`, then set prop:

- `musicFile` → `audio/launch-bed.mp3`
- `musicVolume` → `0.45`

Default `musicFile` is `null` (no bed until you set it).

## Render

```bash
cd apps/video
bun run render
# or: bunx remotion render kubo-launch out/kubo-launch.mp4
```

## Iterate

Edit scenes under `src/compositions/kubo-launch/` or tweak copy/timing via Studio props and `lib/timing.ts` / `lib/schema.ts`.
