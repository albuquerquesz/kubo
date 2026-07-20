export { gsap } from "./gsap-client";
export { ease, duration, stagger } from "./eases";
export { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";
export { useGsapContext } from "./use-gsap-context";
export { splitDisplayText, isDescenderChar } from "./split-display-text";
export type { SplitDisplayTextResult, SplitDisplayTextOptions } from "./split-display-text";
export {
  createHeroDisplayIntro,
  playHeroDisplayIntroWhenVisible,
} from "./timelines/hero-display-intro";
export type {
  HeroDisplayIntroOptions,
  HeroDisplayIntroHandle,
} from "./timelines/hero-display-intro";
