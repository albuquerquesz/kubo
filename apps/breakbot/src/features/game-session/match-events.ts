import type { MatchEvent } from "@breakbot/game-core";
import { useEffect, useRef } from "react";
import { createChannel } from "#/shared/channel";
import { reportSilentError } from "#/shared/telemetry";

type MatchEventListener = (event: MatchEvent) => void;

const matchEvents = createChannel<MatchEvent>((error, event) =>
	reportSilentError("match_listener_failed", error, { signal: event.type }),
);

export const publishMatchEvents = (events: MatchEvent[]) => {
	for (const event of events) matchEvents.publish(event);
};

export const subscribeMatchEvents = matchEvents.subscribe;

export const useMatchEvents = (listener: MatchEventListener) => {
	const latest = useRef(listener);
	latest.current = listener;
	useEffect(() => subscribeMatchEvents((event) => latest.current(event)), []);
};
