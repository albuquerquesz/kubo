import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";

import type { KuboLaunchProps } from "./lib/schema";
import { SCENES } from "./lib/timing";
import { CtaScene } from "./scenes/CtaScene";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";

/**
 * 15s launch cut for X / LinkedIn (16:9). Music-only; mark is frame-driven.
 */
export const KuboLaunch: React.FC<KuboLaunchProps> = ({
  headline,
  problemBullets,
  command,
  ctaUrl,
  musicFile,
  musicVolume,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration}>
        <HookScene headline={headline} />
      </Sequence>
      <Sequence from={SCENES.problem.from} durationInFrames={SCENES.problem.duration}>
        <ProblemScene bullets={problemBullets} />
      </Sequence>
      <Sequence from={SCENES.solution.from} durationInFrames={SCENES.solution.duration}>
        <SolutionScene command={command} />
      </Sequence>
      <Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.duration}>
        <CtaScene command={command} ctaUrl={ctaUrl} />
      </Sequence>

      {musicFile ? <Audio src={staticFile(musicFile)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
