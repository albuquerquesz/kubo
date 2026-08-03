"use client";

import { forwardRef, useId, useImperativeHandle, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { playKuboMarkCelebrate } from "@/lib/motion/timelines/kubo-mark-celebrate";
import { playKuboMarkIdle, type KuboMarkIdleHandle } from "@/lib/motion/timelines/kubo-mark-idle";
import {
  KUBO_MARK_BODY_PATH,
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
  /** Start the quiet idle walk loop (default true). Off under reduced motion. */
  idle?: boolean;
};

/**
 * Hero-only animated mark: Mode A multipartite walk idle + celebrate punch.
 * Header / static brand should keep `KuboMark` (no loops).
 */
export const KuboMarkMotion = forwardRef<KuboMarkMotionHandle, KuboMarkMotionProps>(
  function KuboMarkMotion({ className, idle = true }, ref) {
    const reactId = useId();
    const groundClipId = `kubo-mark-ground-${reactId.replace(/:/g, "")}`;

    const idleRootRef = useRef<SVGGElement>(null);
    const punchLayerRef = useRef<SVGGElement>(null);
    const bodyRef = useRef<SVGGElement>(null);
    const legLeftRef = useRef<SVGGElement>(null);
    const legRightRef = useRef<SVGGElement>(null);
    const idleHandleRef = useRef<KuboMarkIdleHandle | null>(null);

    useGsapContext(
      () => {
        if (!idle || prefersReducedMotion()) return;
        if (!bodyRef.current || !legLeftRef.current || !legRightRef.current) return;

        idleHandleRef.current = playKuboMarkIdle({
          root: idleRootRef.current,
          body: bodyRef.current,
          legLeft: legLeftRef.current,
          legRight: legRightRef.current,
        });
        return () => {
          idleHandleRef.current?.kill();
          idleHandleRef.current = null;
        };
      },
      { dependencies: [idle] },
    );

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
        <g ref={idleRootRef}>
          <g ref={punchLayerRef}>
            <g ref={bodyRef}>
              <path fill={KUBO_MARK_FILL} fillRule="evenodd" d={KUBO_MARK_BODY_PATH} />
            </g>
            <g clipPath={`url(#${groundClipId})`}>
              <g ref={legLeftRef}>
                <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_LEFT_PATH} />
              </g>
              <g ref={legRightRef}>
                <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_RIGHT_PATH} />
              </g>
            </g>
          </g>
        </g>
      </svg>
    );
  },
);
