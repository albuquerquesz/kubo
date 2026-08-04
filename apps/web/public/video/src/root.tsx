import "./index.css";
import { Composition, getStaticFiles } from "remotion";

import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { KuboLaunch } from "./compositions/kubo-launch/KuboLaunch";
import { defaultKuboLaunchProps, kuboLaunchSchema } from "./compositions/kubo-launch/lib/schema";
import {
  LAUNCH_DURATION_FRAMES,
  LAUNCH_FPS,
  LAUNCH_HEIGHT,
  LAUNCH_WIDTH,
} from "./compositions/kubo-launch/lib/timing";
import { FPS, INTRO_DURATION } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();
  const timelines = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      <Composition
        id="kubo-launch"
        component={KuboLaunch}
        fps={LAUNCH_FPS}
        width={LAUNCH_WIDTH}
        height={LAUNCH_HEIGHT}
        durationInFrames={LAUNCH_DURATION_FRAMES}
        schema={kuboLaunchSchema}
        defaultProps={defaultKuboLaunchProps}
      />

      {timelines.map((storyName) => (
        <Composition
          key={storyName}
          id={storyName}
          component={AIVideo}
          fps={FPS}
          width={1080}
          height={1920}
          schema={aiVideoSchema}
          defaultProps={{
            timeline: null,
          }}
          calculateMetadata={async ({ props }) => {
            const { lengthFrames, timeline } = await loadTimelineFromFile(
              getTimelinePath(storyName),
            );

            return {
              durationInFrames: lengthFrames + INTRO_DURATION,
              props: {
                ...props,
                timeline,
              },
            };
          }}
        />
      ))}
    </>
  );
};
