import type { MatchEvent } from "@breakbot/game-core";
import { beforeEach, expect, it } from "vitest";
import { createRecordingSink, installSink, resetTelemetry } from "#/shared/telemetry";
import { publishMatchEvents, subscribeMatchEvents } from "./match-events";

beforeEach(() => resetTelemetry());

it("um ouvinte que lança não impede os seguintes e é reportado", () => {
	const recording = createRecordingSink();
	installSink(recording.sink);
	const received = new Array<MatchEvent["type"]>();
	const stopFailing = subscribeMatchEvents(() => {
		throw new Error("ouvinte quebrado");
	});
	const stopHealthy = subscribeMatchEvents((event) => received.push(event.type));
	publishMatchEvents([{ type: "towerHit", x: 0 }]);
	stopFailing();
	stopHealthy();
	expect(received).toEqual(["towerHit"]);
	expect(recording.exceptions).toEqual([
		expect.objectContaining({ kind: "match_listener_failed", context: { signal: "towerHit" } }),
	]);
});
