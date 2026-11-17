"use client";

import { useRef } from "react";
import Image from "next/image";
import portrait from "@/assets/subash-bhola.png";
import { gsap, reveal, SplitText, useGSAP } from "@/lib/gsap";

const CULTURE = [
  "Collaborative, flat-hierarchy environment",
  "Continuous learning with regular research reviews",
  "Pan-India footprint covering diverse real estate sectors",
];

const CAREER = [
  {
    when: "Before JLL",
    title: "Consulting & public-sector research",
    tags: ["Colliers consulting", "Roulac India · investment advisory", "RBI", "UNDP", "UGC"],
  },
  { when: "~15 years", title: "JLL", body: "Led the Research & REIS platform for India." },
  { when: "Today", title: "Founder, RE Journal", body: "Quantitative forecasting for India's commercial and residential markets." },
];

/**
 * Founder profile card. The portrait is shown small and circular on purpose: the source photo is
 * low-resolution, and at ~240px it stays crisp even on retina screens.
 */
function FounderSpotlight() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // portrait pops in, the dashed orbit turns slowly, the blue arc sweeps with scroll
        gsap.from("[data-avatar]", {
          scale: 0.8,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-avatar]", start: "top 85%" },
        });
        gsap.to("[data-orbit-ring]", { rotate: 360, duration: 50, repeat: -1, ease: "none" });
        const sweep = { trigger: "[data-profile]", start: "top 85%", end: "bottom 30%", scrub: true };
        gsap.fromTo("[data-arc-wrap]", { rotate: -90 }, { rotate: 150, ease: "none", scrollTrigger: sweep });
        gsap.fromTo("[data-arc]", { strokeDashoffset: 100 }, { strokeDashoffset: 62, ease: "none", scrollTrigger: sweep });
        reveal("[data-profile-text] > *", "[data-profile]", { y: 24, stagger: 0.08, duration: 1 }, "top 75%");
        reveal("[data-story] > *", "[data-story]", { y: 30, stagger: 0.07, duration: 1 }, "top 80%");
        // timeline: the accent line draws with scroll, each step lights up as it is reached
        gsap.fromTo(
          "[data-tl-line]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-tl]", start: "top 75%", end: "bottom 55%", scrub: true } },
        );
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
          gsap.from(el, { x: -16, autoAlpha: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 78%" } });
          gsap.fromTo(
            el.querySelector("[data-dot]"),
            { scale: 0.4, backgroundColor: "#ffffff" },
            { scale: 1, backgroundColor: "#2448ff", duration: 0.4, ease: "back.out(3)", scrollTrigger: { trigger: el, start: "top 62%", toggleActions: "play none none reverse" } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-24 overflow-hidden rounded-4xl border border-line bg-surface">
      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* profile */}
        <div data-profile className="relative flex flex-col items-center border-b border-line bg-[radial-gradient(120%_70%_at_50%_0%,var(--accent-soft),transparent_70%)] px-8 pb-10 pt-14 text-center sm:px-12 lg:border-b-0 lg:border-r lg:pt-16">
          <div data-avatar className="relative h-50 w-50 sm:h-60 sm:w-60">
            {/* dashed orbit + scroll-swept accent arc */}
            <div data-orbit-ring className="absolute -inset-6 rounded-full border border-dashed border-ink/15">
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_var(--accent-soft)]" />
            </div>
            <svg data-arc-wrap viewBox="0 0 100 100" className="absolute -left-3 -top-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible" aria-hidden>
              <circle data-arc cx="50" cy="50" r="49" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="62" />
            </svg>
            <div className="relative h-full w-full overflow-hidden rounded-full bg-[#5d5d63] shadow-[0_24px_60px_-20px_rgba(14,15,16,0.45)] ring-4 ring-surface">
              <Image
                src={portrait}
                alt="Dr. Subash Bhola, founder of RE Journal"
                fill
                placeholder="blur"
                sizes="240px"
                className="object-cover object-[50%_12%]"
              />
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium shadow-sm">
              PhD · Economics
            </span>
          </div>

          <div data-profile-text className="mt-10 flex flex-col items-center">
            <span className="eyebrow">Meet the founder</span>
            <h3 className="mt-3 text-[clamp(2rem,3.2vw,2.6rem)] font-semibold leading-none tracking-[-0.04em]">Dr. Subash Bhola</h3>
            <span className="serif mt-2 text-[1.35rem] italic text-ink-2">Founder, RE Journal</span>
            <div className="mt-8 grid w-full max-w-90 grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-bg/60">
              {[
                ["20+", "years in research"],
                ["~15", "years at JLL"],
                ["PhD", "Economics"],
              ].map(([k, l]) => (
                <div key={l} className="px-2 py-3.5">
                  <div className="text-[24px] font-semibold tracking-[-0.03em]">{k}</div>
                  <div className="text-[12px] leading-tight text-muted">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* story */}
        <div data-story className="flex flex-col p-8 sm:p-12">
          <span className="eyebrow">Two decades of research</span>
          <h3 className="mt-5 text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            Pioneering Indian real estate research <span className="serif font-normal italic">since the 2000s.</span>
          </h3>
          <p className="mt-5 max-w-130 text-[16px] leading-relaxed text-muted">
            With 20+ years in research and advisory and a PhD in economics, Dr. Bhola specialises in quantitative forecasting
            for commercial real estate.
          </p>

          <div data-tl className="relative mt-10">
            <div className="absolute bottom-3 left-1.75 top-3 w-px bg-line" />
            <div data-tl-line className="absolute bottom-3 left-1.75 top-3 w-px origin-top bg-accent" />
            <ol className="flex flex-col gap-7">
              {CAREER.map((c) => (
                <li key={c.when} data-step className="relative pl-9">
                  <span data-dot className="absolute left-0 top-1 h-3.75 w-3.75 rounded-full border-2 border-accent bg-accent" />
                  <div className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">{c.when}</div>
                  <div className="mt-1 text-[18px] font-semibold tracking-tight">{c.title}</div>
                  {c.body && <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{c.body}</p>}
                  {c.tags && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span key={t} className="rounded-full border border-line bg-bg px-2.5 py-1 text-[12px] font-medium text-ink-2">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Founder() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create("[data-quote]", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: { trigger: "[data-quote]", start: "top 80%", end: "bottom 50%", scrub: true },
        },
      );
      reveal("[data-culture]", "[data-culture-list]", { x: -20, stagger: 0.1, duration: 0.9, y: 0 });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="culture" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-310 px-5 sm:px-8">
        <span className="eyebrow">Our culture</span>
        <h2 className="mt-5 text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          Research-first,
          <br />
          <span className="serif font-normal italic">people-always.</span>
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <p data-quote className="text-[clamp(1.3rem,2.4vw,2rem)] font-medium leading-[1.3] tracking-[-0.02em]">
            Our team of economists, data scientists and management professionals is dedicated to delivering cutting-edge
            research and analytics, so every stakeholder in Indian real estate can make decisions grounded in evidence.
          </p>
          <ul data-culture-list className="flex flex-col justify-end gap-0 border-t border-line">
            {CULTURE.map((c, i) => (
              <li key={c} data-culture className="flex items-center gap-4 border-b border-line py-5">
                <span className="font-mono text-[12px] text-muted">0{i + 1}</span>
                <span className="text-[17px] font-medium tracking-tight">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <FounderSpotlight />
      </div>
    </section>
  );
}
