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
      reveal("[data-founder]", "[data-founder]", { y: 60, duration: 1.2 });
      gsap.to("[data-portrait]", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: "[data-founder]", start: "top bottom", end: "bottom top", scrub: true },
      });
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

        <div data-founder className="mt-24 grid overflow-hidden rounded-4xl border border-line bg-white lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-105 overflow-hidden bg-[#5d5d63] sm:min-h-120">
            {/* 116% tall so the scroll parallax never reveals an edge */}
            <div data-portrait className="absolute inset-x-0 top-0 h-[116%]">
              <Image
                src={portrait}
                alt="Dr. Subash Bhola, founder of RE Journal"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover object-[50%_18%]"
              />
            </div>
            <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium">
              Founder, RE Journal
            </div>
          </div>
          <div className="p-8 sm:p-12">
            <span className="eyebrow">Meet the founder</span>
            <h3 className="mt-4 text-[clamp(2rem,3.4vw,2.8rem)] font-semibold tracking-[-0.035em]">Dr. Subash Bhola</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              A pioneer in Indian real estate research since the 2000s, with 20+ years in research and advisory and a PhD in
              economics. He specialises in quantitative forecasting for commercial real estate.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              For about 15 years he led the Research &amp; REIS platform for India at JLL. Earlier, he worked with Colliers
              consulting, Roulac India&apos;s investment advisory team, and on research projects for the RBI, UNDP and UGC.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ["20+", "years in research"],
                ["~15", "years at JLL"],
                ["PhD", "Economics"],
              ].map(([k, l]) => (
                <div key={l}>
                  <div className="text-[28px] font-semibold tracking-[-0.03em]">{k}</div>
                  <div className="text-[13px] text-muted">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
