"use client";

/**
 * Client-only GSAP entry. Import only from "use client" modules.
 * Plugins register once here so timelines share a single setup.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
