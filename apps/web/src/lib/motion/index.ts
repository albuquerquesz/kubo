export { gsap, ScrollTrigger } from "./gsap-client";
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
export {
  playHeroStickyScale,
  heroIconScrollRange,
  pinTravelPx,
  hostEaseProgress,
  hostTransformAtPinProgress,
  lineTranslateXAtPinProgress,
  HERO_STICKY_SCALE_FROM,
  HERO_STICKY_SCALE_TO,
  HERO_STICKY_SCROLL,
  HERO_STICKY_MQ,
  HERO_HOST_EASE,
  HERO_HOST_X_END_RATIO,
  HERO_HOST_Y_END_RATIO,
  HERO_LINE_X_END_RATIOS,
} from "./timelines/hero-sticky-scale";
export type { HeroStickyScaleOptions, HeroStickyScaleHandle } from "./timelines/hero-sticky-scale";
export {
  playScrollRevealIcons,
  playHeroScrollRevealIcons,
  SCROLL_REVEAL_ICONS_DEFAULTS,
  SCROLL_REVEAL_ICONS_HERO,
} from "./timelines/scroll-reveal-icons";
export type {
  ScrollRevealIconsOptions,
  ScrollRevealIconsHandle,
} from "./timelines/scroll-reveal-icons";
