"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { playKuboMarkCelebrate } from "@/lib/motion/timelines/kubo-mark-celebrate";
import {
  KUBO_MARK_EYE_FILL,
  KUBO_MARK_EYE_LEFT,
  KUBO_MARK_EYE_RIGHT,
  KUBO_MARK_FILL,
  KUBO_MARK_FULL_PATH,
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
 * Single full silhouette (no multipartite legs) — walk idle is gone.
 * Header / static brand should keep `KuboMark` (no loops).
 */
export const KuboMarkMotion = forwardRef<KuboMarkMotionHandle, KuboMarkMotionProps>(
  function KuboMarkMotion({ className }, ref) {
    const punchLayerRef = useRef<SVGGElement>(null);
    const eyeMaskLeftRef = useRef<SVGRectElement>(null);
    const eyeMaskRightRef = useRef<SVGRectElement>(null);
    const eyeLeftRef = useRef<SVGRectElement>(null);
    const eyeRightRef = useRef<SVGRectElement>(null);
    const blinkLeftRef = useRef<SVGPathElement>(null);
    const blinkRightRef = useRef<SVGPathElement>(null);

    useGsapContext(() => {
      if (
        prefersReducedMotion() ||
        !eyeMaskLeftRef.current ||
        !eyeMaskRightRef.current ||
        !eyeLeftRef.current ||
        !eyeRightRef.current ||
        !blinkLeftRef.current ||
        !blinkRightRef.current
      )
        return;

      // Pixel-stepped eyelids match the closed-eye expression from the launch artwork.
      const eyeMasks = [eyeMaskLeftRef.current, eyeMaskRightRef.current];
      const eyeTargets = [eyeLeftRef.current, eyeRightRef.current];
      const blinkTargets = [blinkLeftRef.current, blinkRightRef.current];
      const blink = gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1.5 });
      blink
        .to(eyeTargets, { attr: { height: 0, y: 331 }, duration: 0.05 })
        .to(eyeMasks, { opacity: 0, duration: 0.01 }, "<")
        .to(blinkTargets, { opacity: 1, duration: 0.01 }, "<")
        .to({}, { duration: 0.08 })
        .set(blinkTargets, { opacity: 0 })
        .set(eyeMasks, { opacity: 1 })
        .set(eyeTargets, { attr: { height: 86, y: 292 } });

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
        <g ref={punchLayerRef}>
          <path fill={KUBO_MARK_FILL} fillRule="evenodd" d={KUBO_MARK_FULL_PATH} />
          <rect ref={eyeMaskLeftRef} {...KUBO_MARK_EYE_LEFT} fill={KUBO_MARK_FILL} />
          <rect ref={eyeMaskRightRef} {...KUBO_MARK_EYE_RIGHT} fill={KUBO_MARK_FILL} />
          <rect ref={eyeLeftRef} {...KUBO_MARK_EYE_LEFT} fill={KUBO_MARK_EYE_FILL} />
          <rect ref={eyeRightRef} {...KUBO_MARK_EYE_RIGHT} fill={KUBO_MARK_EYE_FILL} />
          <path
            ref={blinkLeftRef}
            d="M213 331H229V339H281V331H298V339H289V347H221V339H213Z"
            fill={KUBO_MARK_EYE_FILL}
            opacity={0}
            shapeRendering="crispEdges"
          />
          <path
            ref={blinkRightRef}
            d="M468 331H484V339H536V331H553V339H544V347H476V339H468Z"
            fill={KUBO_MARK_EYE_FILL}
            opacity={0}
            shapeRendering="crispEdges"
          />
        </g>
      </svg>
    );
  },
);
