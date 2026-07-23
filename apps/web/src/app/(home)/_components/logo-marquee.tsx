"use client";

import { useEffect, useRef, useState } from "react";

import {
  LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC,
  LOGO_MARQUEE_CELL_COUNT,
  LOGO_MARQUEE_CLICK_SLOP_PX,
  logoMarqueeMetrics,
  normalizeMarqueeOffset,
} from "@/lib/logo-marquee";
import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { cn } from "@/lib/utils";

type LogoItem = {
  name: string;
  href: string;
  src: string;
};

/**
 * Brazilian integrations shipped as first-class stack options.
 * Icons live in `public/integrations/` (replace anytime — paths are stable).
 */
const LOGOS: LogoItem[] = [
  {
    name: "AbacatePay",
    href: "https://www.abacatepay.com",
    src: "/integrations/abacatepay.svg",
  },
  {
    name: "Guara Cloud",
    href: "https://guaracloud.com",
    src: "/integrations/guaracloud.png",
  },
  {
    name: "GetMonitor",
    href: "https://getmonitor.io",
    src: "/integrations/getmonitor.svg",
  },
];

if (LOGOS.length !== LOGO_MARQUEE_CELL_COUNT) {
  throw new Error(
    `Logo marquee requires exactly ${LOGO_MARQUEE_CELL_COUNT} logos, got ${LOGOS.length}`,
  );
}

const TRACK_COPIES = 3;

type DragState = {
  pointerId: number;
  startX: number;
  originOffset: number;
  totalDelta: number;
};

function LogoMark({ logo }: { logo: LogoItem }) {
  return (
    <img
      src={logo.src}
      alt=""
      // Fixed slot (80×40 / 112×56) so wordmarks and square marks share painted size.
      // Do not rely on max-* alone — small SVG intrinsics would stay tiny.
      className="logo-marquee__logo h-10 w-20 object-contain object-center md:h-14 md:w-28"
      draggable={false}
    />
  );
}

function Track({
  logos,
  copyIndex,
  interactive,
}: {
  logos: LogoItem[];
  copyIndex: number;
  /** First copy is in the a11y tree; duplicates stay aria-hidden but keep real hrefs for click. */
  interactive: boolean;
}) {
  const hidden = !interactive;

  return (
    <ol
      className="logo-marquee__track"
      aria-hidden={hidden ? true : undefined}
      data-marquee-track={copyIndex}
    >
      {logos.map((logo) => (
        <li key={`${copyIndex}-${logo.name}`} className="logo-marquee__cell">
          <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="logo-marquee__link"
            aria-label={logo.name}
            title={logo.name}
            draggable={false}
            data-marquee-link
            tabIndex={hidden ? -1 : undefined}
          >
            <LogoMark logo={logo} />
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Full-bleed BR integrations marquee — continuous drift + infinite drag.
 * Geometry: docs/spec-mistral-home-logo-marquee.md (cell/step/hover/drag).
 */
export default function LogoMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const sequenceWidthRef = useRef(logoMarqueeMetrics(1024).sequenceWidth);
  const dragRef = useRef<DragState | null>(null);
  const hoveringRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const tracks = () => [...viewport.querySelectorAll<HTMLElement>("[data-marquee-track]")];

    const paint = () => {
      const offset = offsetRef.current;
      const width = sequenceWidthRef.current;
      for (const track of tracks()) {
        const copyIndex = Number(track.dataset.marqueeTrack ?? 0);
        track.style.transform = `translate3d(${offset + copyIndex * width}px, 0, 0)`;
      }
    };

    const setOffset = (next: number) => {
      offsetRef.current = normalizeMarqueeOffset(next, sequenceWidthRef.current);
      paint();
    };

    const syncMetrics = () => {
      const fallback = logoMarqueeMetrics(window.innerWidth).sequenceWidth;
      const track = viewport.querySelector<HTMLElement>('[data-marquee-track="0"]');
      const measured = track?.offsetWidth ?? 0;
      sequenceWidthRef.current = measured > 0 ? measured : fallback;
      setOffset(offsetRef.current);
    };

    reducedMotionRef.current = prefersReducedMotion();
    syncMetrics();
    paint();

    const ro = new ResizeObserver(syncMetrics);
    ro.observe(viewport);
    const firstTrack = viewport.querySelector<HTMLElement>('[data-marquee-track="0"]');
    if (firstTrack) ro.observe(firstTrack);

    const unsubReduced = onReducedMotionChange((reduced) => {
      reducedMotionRef.current = reduced;
      lastTsRef.current = null;
    });

    const onVisibility = () => {
      lastTsRef.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick);

      if (document.visibilityState === "hidden") {
        lastTsRef.current = null;
        return;
      }

      if (reducedMotionRef.current || dragRef.current || hoveringRef.current) {
        lastTsRef.current = null;
        return;
      }

      const last = lastTsRef.current;
      lastTsRef.current = ts;
      if (last == null) return;

      const dt = Math.min((ts - last) / 1000, 0.064);
      setOffset(offsetRef.current - LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC * dt);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        originOffset: offsetRef.current,
        totalDelta: 0,
      };
      lastTsRef.current = null;
      setGrabbing(true);
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const delta = event.clientX - drag.startX;
      drag.totalDelta = Math.abs(delta);
      setOffset(drag.originOffset + delta);
    };

    const endDrag = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const wasDrag = drag.totalDelta > LOGO_MARQUEE_CLICK_SLOP_PX;
      dragRef.current = null;
      lastTsRef.current = null;
      setGrabbing(false);

      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      if (wasDrag) {
        const target = event.target;
        if (target instanceof Element) {
          const link = target.closest<HTMLAnchorElement>("[data-marquee-link]");
          if (link) {
            const block = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              link.removeEventListener("click", block, true);
            };
            link.addEventListener("click", block, true);
          }
        }
      }
    };

    const onPointerEnter = () => {
      hoveringRef.current = true;
      lastTsRef.current = null;
    };
    const onPointerLeave = () => {
      hoveringRef.current = false;
      lastTsRef.current = null;
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerenter", onPointerEnter);
    viewport.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", syncMetrics);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      unsubReduced();
      document.removeEventListener("visibilitychange", onVisibility);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("pointerenter", onPointerEnter);
      viewport.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", syncMetrics);
    };
  }, []);

  return (
    <section className="logo-marquee" aria-label="Integrações brasileiras" data-logo-marquee>
      <div
        ref={viewportRef}
        className={cn("logo-marquee__viewport", grabbing && "is-grabbing")}
        data-logo-marquee-viewport
      >
        {Array.from({ length: TRACK_COPIES }, (_, copyIndex) => (
          <Track
            key={copyIndex}
            logos={LOGOS}
            copyIndex={copyIndex}
            interactive={copyIndex === 0}
          />
        ))}
      </div>
    </section>
  );
}
