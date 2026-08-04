import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";

import type { KuboLaunchProps } from "./lib/schema";
import { CLI_PHASES, SCENES } from "./lib/timing";
import { SolutionScene } from "./scenes/solution-scene";

/** Mixkit typing bed under typewriter windows (public/audio/sfx/). */
const TYPING_SFX = "audio/sfx/fast-keyboard-typing.mp3";
const TYPING_VOLUME = 0.7;

/**
 * 6s square launch cut for X / LinkedIn (1080×1080). Typing SFX + optional music bed.
 */
export const KuboLaunch: React.FC<KuboLaunchProps> = ({ command, musicFile, musicVolume }) => {
  const nameTypeDuration = CLI_PHASES.nameTypeEnd - CLI_PHASES.nameTypeStart;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Sequence from={SCENES.solution.from} durationInFrames={SCENES.solution.duration}>
        <SolutionScene command={command} />
      </Sequence>

      {/* Shell command typewriter (frames 0 → commandTypeEnd) */}
      <Sequence from={0} durationInFrames={CLI_PHASES.commandTypeEnd} premountFor={15}>
        <Audio src={staticFile(TYPING_SFX)} volume={TYPING_VOLUME} />
      </Sequence>

      {/* Project name typewriter */}
      <Sequence
        from={CLI_PHASES.nameTypeStart}
        durationInFrames={nameTypeDuration}
        premountFor={15}
      >
        <Audio src={staticFile(TYPING_SFX)} volume={TYPING_VOLUME} />
      </Sequence>

      {musicFile ? <Audio src={staticFile(musicFile)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
