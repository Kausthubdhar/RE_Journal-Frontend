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

/** Editorial founder feature: tall portrait with name overlay + story card with a scroll-drawn career timeline. */
function FounderSpotlight() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // portrait wipes in from the bottom, then keeps a gentle parallax
        gsap.fromTo(
          "[data-frame]",
          { clipPath: "inset(18% 0% 0% 0% round 32px)" },
          { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-frame]", start: "top 85%" } },
        );
        gsap.to("[data-portrait]", {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: "[data-frame]", start: "top bottom", end: "bottom top", scrub: true },
        });
        reveal("[data-name] > *", "[data-frame]", { y: 30, stagger: 0.08, duration: 1.1 }, "top 70%");
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
    <div ref={root} className="mt-24 grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6">
      {/* portrait */}
      <figure data-frame className="relative min-h-125 overflow-hidden rounded-4xl bg-[#5d5d63] lg:min-h-160">
        {/* 114% tall so the parallax never reveals an edge */}
        <div data-portrait className="absolute inset-x-0 top-0 h-[114%]">
          <Image
            src={portrait}
            alt="Dr. Subash Bhola, founder of RE Journal"
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover object-[50%_16%]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/90 via-ink/25 via-45% to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
          PhD · Economics
        </span>
        <figcaption data-name className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
          <span className="block text-[12px] font-medium uppercase tracking-[0.16em] text-white/70">Meet the founder</span>
          <span className="mt-3 block text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.04em]">Dr. Subash Bhola</span>
          <span className="serif mt-2 block text-[clamp(1.3rem,2vw,1.7rem)] italic text-white/85">Founder, RE Journal</span>
        </figcaption>
      </figure>

      {/* story */}
      <div data-story className="flex flex-col rounded-4xl border border-line bg-white p-8 sm:p-12">
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

        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-line pt-6 max-lg:mt-10 lg:pt-7">
          {[
            ["20+", "years in research"],
            ["~15", "years at JLL"],
            ["PhD", "Economics"],
          ].map(([k, l]) => (
            <div key={l}>
              <div className="text-[30px] font-semibold tracking-[-0.03em]">{k}</div>
              <div className="text-[13px] text-muted">{l}</div>
            </div>
          ))}
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
