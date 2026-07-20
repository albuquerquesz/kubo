"use client";

/**
 * Client-only GSAP entry. Import only from "use client" modules.
 * ScrollTrigger is registered once here so timelines share a single plugin setup.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
