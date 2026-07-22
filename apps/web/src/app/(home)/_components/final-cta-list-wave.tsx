import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

type ListTone = "gold" | "bright" | "pale" | "ochre";

type ListItem = {
  width: number;
  height: number;
  tone: ListTone;
  /** full = capsule; sm = short rule */
  shape: "capsule" | "rule";
  gap: number;
};

type TrackConfig = {
  id: string;
  /** Vertical anchor as % of card height (22–82). */
  top: string;
  direction: "left" | "right";
  duration: number;
  /** Negative delay so tracks start mid-cycle. */
  delay: string;
  /** Discrete vertical drift in px (8–20). */
  drift: number;
  opacity: number;
  items: ListItem[];
};

/**
 * Four independent decorative tracks. Item sizes and gaps vary so the field
 * never reads as a single synchronized sine wave.
 */
const TRACKS: readonly TrackConfig[] = [
  {
    id: "t0",
    top: "22%",
    direction: "left",
    duration: 14,
    delay: "-4s",
    drift: 10,
    opacity: 0.55,
    items: [
      { width: 72, height: 8, tone: "gold", shape: "capsule", gap: 18 },
      { width: 36, height: 6, tone: "ochre", shape: "rule", gap: 22 },
      { width: 96, height: 10, tone: "bright", shape: "capsule", gap: 14 },
      { width: 28, height: 5, tone: "pale", shape: "rule", gap: 28 },
      { width: 54, height: 7, tone: "gold", shape: "capsule", gap: 16 },
      { width: 112, height: 9, tone: "bright", shape: "capsule", gap: 20 },
      { width: 40, height: 6, tone: "ochre", shape: "rule", gap: 24 },
      { width: 64, height: 8, tone: "pale", shape: "capsule", gap: 18 },
      { width: 48, height: 5, tone: "gold", shape: "rule", gap: 26 },
    ],
  },
  {
    id: "t1",
    top: "42%",
    direction: "right",
    duration: 17,
    delay: "-9s",
    drift: 14,
    opacity: 0.72,
    items: [
      { width: 88, height: 11, tone: "bright", shape: "capsule", gap: 12 },
      { width: 32, height: 4, tone: "ochre", shape: "rule", gap: 20 },
      { width: 60, height: 8, tone: "gold", shape: "capsule", gap: 16 },
      { width: 104, height: 12, tone: "pale", shape: "capsule", gap: 14 },
      { width: 24, height: 5, tone: "gold", shape: "rule", gap: 30 },
      { width: 76, height: 9, tone: "bright", shape: "capsule", gap: 18 },
      { width: 44, height: 6, tone: "ochre", shape: "rule", gap: 22 },
      { width: 68, height: 10, tone: "gold", shape: "capsule", gap: 15 },
      { width: 52, height: 7, tone: "pale", shape: "capsule", gap: 24 },
      { width: 38, height: 5, tone: "bright", shape: "rule", gap: 19 },
    ],
  },
  {
    id: "t2",
    top: "62%",
    direction: "left",
    duration: 22,
    delay: "-2s",
    drift: 8,
    opacity: 0.48,
    items: [
      { width: 48, height: 6, tone: "ochre", shape: "rule", gap: 26 },
      { width: 100, height: 9, tone: "gold", shape: "capsule", gap: 14 },
      { width: 30, height: 4, tone: "pale", shape: "rule", gap: 32 },
      { width: 70, height: 8, tone: "bright", shape: "capsule", gap: 18 },
      { width: 56, height: 7, tone: "gold", shape: "capsule", gap: 20 },
      { width: 42, height: 5, tone: "ochre", shape: "rule", gap: 22 },
      { width: 84, height: 10, tone: "pale", shape: "capsule", gap: 16 },
      { width: 26, height: 4, tone: "bright", shape: "rule", gap: 28 },
    ],
  },
  {
    id: "t3",
    top: "78%",
    direction: "right",
    duration: 26,
    delay: "-13s",
    drift: 18,
    opacity: 0.64,
    items: [
      { width: 64, height: 9, tone: "bright", shape: "capsule", gap: 15 },
      { width: 34, height: 5, tone: "gold", shape: "rule", gap: 24 },
      { width: 92, height: 11, tone: "pale", shape: "capsule", gap: 12 },
      { width: 50, height: 7, tone: "ochre", shape: "capsule", gap: 20 },
      { width: 108, height: 8, tone: "gold", shape: "capsule", gap: 17 },
      { width: 28, height: 4, tone: "bright", shape: "rule", gap: 30 },
      { width: 76, height: 10, tone: "pale", shape: "capsule", gap: 14 },
      { width: 40, height: 6, tone: "ochre", shape: "rule", gap: 22 },
      { width: 58, height: 8, tone: "gold", shape: "capsule", gap: 18 },
      { width: 46, height: 5, tone: "bright", shape: "rule", gap: 26 },
      { width: 80, height: 12, tone: "pale", shape: "capsule", gap: 16 },
    ],
  },
] as const;

function Sequence({ items }: { items: readonly ListItem[] }) {
  return (
    <div className="final-cta-list-wave__sequence">
      {items.map((item, index) => (
        <span
          key={index}
          className={`final-cta-list-wave__item final-cta-list-wave__item--${item.tone} final-cta-list-wave__item--${item.shape}`}
          style={{
            width: item.width,
            height: item.height,
            marginRight: item.gap,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-bleed final CTA with an original yellow list-wave backdrop.
 * Decorative tracks are aria-hidden; only title, link, and command are in the a11y tree.
 */
export default function FinalCtaListWave() {
  return (
    <section aria-labelledby="final-cta-title" className="final-cta-list-wave border-rule border-b">
      <div className="final-cta-list-wave__backdrop" aria-hidden="true">
        <div className="final-cta-list-wave__mask" />
        {TRACKS.map((track) => (
          <div
            key={track.id}
            className={`final-cta-list-wave__track final-cta-list-wave__track--${track.direction}`}
            style={
              {
                top: track.top,
                "--final-cta-track-opacity": String(track.opacity),
                "--final-cta-duration": `${track.duration}s`,
                "--final-cta-delay": track.delay,
                "--final-cta-drift": `${track.drift}px`,
              } as CSSProperties
            }
          >
            {/* Two equal sequences for a seamless infinite wrap. */}
            <Sequence items={track.items} />
            <Sequence items={track.items} />
          </div>
        ))}
      </div>

      <div className="final-cta-list-wave__content">
        <h2 id="final-cta-title" className="final-cta-list-wave__title ui-display">
          Stop assembling.
          <br />
          Start shipping.
        </h2>

        <div className="final-cta-list-wave__actions">
          <Link
            href="/new"
            className="final-cta-list-wave__cta group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          >
            Build your stack
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </Link>
          <code className="final-cta-list-wave__command">bun create kubojs@latest</code>
        </div>
      </div>
    </section>
  );
}
