"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fade/slide elements in once when `trigger` scrolls into view. */
export function reveal(targets: gsap.TweenTarget, trigger: gsap.DOMTarget, vars: gsap.TweenVars = {}, start = "top 85%") {
  return gsap.from(targets, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "expo.out",
    ...vars,
    scrollTrigger: { trigger, start },
  });
}

type LenisLike = { scrollTo: (target: string | HTMLElement | number, opts?: object) => void };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}
