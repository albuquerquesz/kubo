"use client";

import { forwardRef, useId, useImperativeHandle, useRef } from "react";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { playKuboMarkCelebrate } from "@/lib/motion/timelines/kubo-mark-celebrate";
import {
  KUBO_MARK_BODY_PATH,
  KUBO_MARK_EYE_FILL,
  KUBO_MARK_EYE_LEFT,
  KUBO_MARK_EYE_RIGHT,
  KUBO_MARK_FILL,
  KUBO_MARK_LEG_LEFT_PATH,
  KUBO_MARK_LEG_RIGHT_PATH,
} from "@/lib/motion/timelines/kubo-mark-paths";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { cn } from "@/lib/utils";

export type KuboMarkMotionHandle = {
  celebrate: () => void;
};

type KuboMarkMotionProps = {
  className?: string;
};

/**
 * Hero-only animated mark: launch-video blink + celebrate punch.
 * Header / static brand should keep `KuboMark` (no loops).
 */
export const KuboMarkMotion = forwardRef<KuboMarkMotionHandle, KuboMarkMotionProps>(
  function KuboMarkMotion({ className }, ref) {
    const reactId = useId();
    const groundClipId = `kubo-mark-ground-${reactId.replace(/:/g, "")}`;

    const punchLayerRef = useRef<SVGGElement>(null);
    const eyeLeftRef = useRef<SVGRectElement>(null);
    const eyeRightRef = useRef<SVGRectElement>(null);

    useGsapContext(() => {
      if (prefersReducedMotion() || !eyeLeftRef.current || !eyeRightRef.current) return;

      // Match the launch-video character: a short, centered, pixel-stepped blink.
      const blinkTargets = [eyeLeftRef.current, eyeRightRef.current].filter(Boolean);
      const blink = gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1.5 });
      blink
        .to(blinkTargets, { attr: { height: 8, y: 331 }, duration: 0.05 })
        .to({}, { duration: 0.08 })
        .set(blinkTargets, { attr: { height: 86, y: 292 } });

      return () => {
        blink.kill();
      };
    }, {});

    useImperativeHandle(
      ref,
      () => ({
        celebrate: () => {
          if (punchLayerRef.current) playKuboMarkCelebrate(punchLayerRef.current);
        },
      }),
      [],
    );

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 763 678"
        fill="none"
        role="presentation"
        aria-hidden
        className={cn("h-auto w-auto", className)}
      >
        <defs>
          {/* Allowed paint region ends at ground (y=678) so scaleY legs do not punch through. */}
          <clipPath id={groundClipId}>
            <rect x={-40} y={-50} width={843} height={728} />
          </clipPath>
        </defs>
        <g ref={punchLayerRef}>
          <path fill={KUBO_MARK_FILL} fillRule="evenodd" d={KUBO_MARK_BODY_PATH} />
          {/* The launch-video character has visible eyes; restore the cutouts before blinking. */}
          <rect {...KUBO_MARK_EYE_LEFT} fill={KUBO_MARK_FILL} />
          <rect {...KUBO_MARK_EYE_RIGHT} fill={KUBO_MARK_FILL} />
          <rect ref={eyeLeftRef} {...KUBO_MARK_EYE_LEFT} fill={KUBO_MARK_EYE_FILL} />
          <rect ref={eyeRightRef} {...KUBO_MARK_EYE_RIGHT} fill={KUBO_MARK_EYE_FILL} />
          <g clipPath={`url(#${groundClipId})`}>
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_LEFT_PATH} />
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_RIGHT_PATH} />
          </g>
        </g>
      </svg>
    );
  },
);
