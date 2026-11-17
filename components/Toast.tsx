"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion, scrollToId } from "@/lib/gsap";

/** Change the id when a new report is announced so people who dismissed the old one see it. */
const REPORT_ID = "india-office-q3-2026";
const STORAGE_KEY = "rej-toast-dismissed";

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === REPORT_ID;
  } catch {
    return false;
  }
}

export default function Toast() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  // Only appear once the hero (prompt box, tabs, dock) has scrolled away, and hide again if the
  // reader scrolls back up, so the popup never sits on top of the hero controls.
  useEffect(() => {
    const el = ref.current;
    const hero = document.getElementById("top");
    if (!el || !hero || wasDismissed()) return;
    const quick = prefersReducedMotion();
    gsap.set(el, { y: 30 });
    const io = new IntersectionObserver(([e]) => {
      gsap.killTweensOf(el);
      if (e.isIntersecting) gsap.to(el, { y: 30, autoAlpha: 0, duration: quick ? 0 : 0.3, ease: "power3.in" });
      else gsap.to(el, { y: 0, autoAlpha: 1, duration: quick ? 0 : 0.9, ease: "expo.out", delay: quick ? 0 : 0.4 });
    });
    io.observe(hero);
    return () => {
      io.disconnect();
      gsap.killTweensOf(el);
    };
  }, []);

  /** remember=false ("Later") hides it for this visit only. */
  const close = (remember = true) => {
    if (remember)
      try {
        localStorage.setItem(STORAGE_KEY, REPORT_ID);
      } catch {}
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { y: 30, autoAlpha: 0, duration: 0.4, ease: "power3.in", onComplete: () => setGone(true) });
  };

  if (gone) return null;
  return (
    <div
      ref={ref}
      role="region"
      aria-label="New report"
      className="invisible fixed bottom-4 left-4 z-50 hidden w-75 rounded-2xl border border-surface/70 bg-surface/95 p-4 opacity-0 shadow-float sm:block"
    >
      <button onClick={() => close()} aria-label="Dismiss" className="absolute right-2.5 top-2.5 cursor-pointer rounded-full p-1 text-muted hover:bg-ink/5">
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent">New report</div>
      <p className="mt-1 pr-4 text-[14px] leading-snug text-ink">India Office Update: Q3 2026 is out now.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => close(false)} className="cursor-pointer rounded-lg bg-ink/5 px-3 py-1.5 text-[12.5px] font-medium hover:bg-ink/10">
          Later
        </button>
        <button
          onClick={() => {
            scrollToId("insights");
            close();
          }}
          className="cursor-pointer rounded-lg bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface"
        >
          Read it
        </button>
      </div>
    </div>
  );
}
