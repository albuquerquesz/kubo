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
  webgl_context_lost: { surface: WebGLSurface; route: string; status_message: string };
  webgl_context_restored: { surface: WebGLSurface; route: string };
  webgl_context_creation_error: { surface: WebGLSurface; route: string; status_message: string };
  webgl_shader_error: {
    surface: WebGLSurface;
    route: string;
    message: string;
    source: "window_error";
  };
};

export type WebGLSurface = "hero_dithering" | "cta_dot_matrix";

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
