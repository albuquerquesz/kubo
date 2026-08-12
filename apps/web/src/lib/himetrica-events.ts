"use client";

import { useTrackEvent } from "@himetrica/tracker-js/react";
import { useCallback, useMemo } from "react";

type HimetricaEventProperties = {
  builder_started: Record<string, never>;
  stack_option_selected: { category: string; value: string };
  command_copied: { source: "builder" };
  stack_randomized: Record<string, never>;
  stack_saved: Record<string, never>;
  stack_reset: Record<string, never>;
  preset_applied: { preset: string };
};

export type KuboHimetricaEvent = keyof HimetricaEventProperties;

export function useKuboHimetrica() {
  const track = useTrackEvent();

  const trackKuboEvent = useCallback(
    <EventName extends KuboHimetricaEvent>(
      eventName: EventName,
      properties: HimetricaEventProperties[EventName],
    ) => {
      track(eventName, properties);
    },
    [track],
  );

  return useMemo(() => ({ track: trackKuboEvent }), [trackKuboEvent]);
}
