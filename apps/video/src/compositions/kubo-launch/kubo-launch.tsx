import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";

import type { KuboLaunchProps } from "./lib/schema";
import { SCENES } from "./lib/timing";
import { SolutionScene } from "./scenes/solution-scene";

/**
 * 6s square launch cut for X / LinkedIn (1080×1080). Music-only; mark is frame-driven.
 */
export const KuboLaunch: React.FC<KuboLaunchProps> = ({ command, musicFile, musicVolume }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Sequence from={SCENES.solution.from} durationInFrames={SCENES.solution.duration}>
        <SolutionScene command={command} />
      </Sequence>

      {musicFile ? <Audio src={staticFile(musicFile)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
