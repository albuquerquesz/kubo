"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { playKuboMarkCelebrate } from "@/lib/motion/timelines/kubo-mark-celebrate";
import { playKuboMarkIdle, type KuboMarkIdleHandle } from "@/lib/motion/timelines/kubo-mark-idle";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { cn } from "@/lib/utils";

export type KuboMarkMotionHandle = {
  celebrate: () => void;
};

type KuboMarkMotionProps = {
  className?: string;
  /** Start the quiet idle loop (default true). Off under reduced motion. */
  idle?: boolean;
};

/**
 * Hero-only animated mark: Mode A idle on outer group, celebrate punch on inner.
 * Header / static brand should keep `KuboMark` (no loops).
 */
export const KuboMarkMotion = forwardRef<KuboMarkMotionHandle, KuboMarkMotionProps>(
  function KuboMarkMotion({ className, idle = true }, ref) {
    const idleLayerRef = useRef<SVGGElement>(null);
    const punchLayerRef = useRef<SVGGElement>(null);
    const idleHandleRef = useRef<KuboMarkIdleHandle | null>(null);

    useGsapContext(
      () => {
        if (!idle || !idleLayerRef.current || prefersReducedMotion()) return;

        idleHandleRef.current = playKuboMarkIdle(idleLayerRef.current);
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
        <g ref={idleLayerRef}>
          <g ref={punchLayerRef}>
            <path
              fill="#FBC80D"
              fillRule="evenodd"
              d="M100 678H665A8 8 0 0 1 673 670V328H755A8 8 0 0 1 763 320V134A8 8 0 0 1 755 126H673V8A8 8 0 0 1 665 0H561A8 8 0 0 1 553 8V126H213V8A8 8 0 0 1 205 0H100A8 8 0 0 1 92 8V126H10A8 8 0 0 1 2 134V320A8 8 0 0 1 10 328H92V670A8 8 0 0 1 100 678ZM213 292H298V378H213ZM468 292H553V378H468ZM213 547H553V678H213Z"
            />
          </g>
        </g>
      </svg>
    );
  },
);
