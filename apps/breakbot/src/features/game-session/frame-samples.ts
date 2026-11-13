import type { MatchSnapshot } from "@breakbot/game-core";
import { createChannel } from "#/shared/channel";
import { reportSilentError } from "#/shared/telemetry";

export type FrameSample = {
	deltaSeconds: number;
	droppedSeconds: number;
	snapshot: MatchSnapshot;
};

const frames = createChannel<FrameSample>((error) =>
	reportSilentError("match_listener_failed", error, { signal: "frame" }),
);

export const publishFrame = frames.publish;
export const subscribeFrames = frames.subscribe;
