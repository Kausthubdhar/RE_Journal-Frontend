"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    k: "Project-level records",
    body: "Lease records, completions and construction progress, tracked project by project across every covered city.",
    chips: ["Leases", "Completions", "Construction"],
  },
  {
    k: "Derived indicators",
    body: "Absorption, vacancy, rents, capital values and yields, estimated bottom-up for every submarket and city.",
    chips: ["Absorption", "Vacancy", "Rents", "Capital values", "Yields"],
  },
  {
    k: "Econometric forecasts",
    body: "Quantitative five-year projections for office, retail, warehousing and residential markets.",
    chips: ["Office", "Retail", "Warehousing", "Residential"],
  },
];

export default function Method() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 65%", end: "bottom 65%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%" } });
        tl.from(el.querySelector("[data-num]"), { scale: 0.4, opacity: 0, duration: 0.8, ease: "back.out(2.5)" })
          .from(el.querySelector("[data-body]"), { x: 40, opacity: 0, duration: 1, ease: "expo.out" }, 0.1)
          .from(el.querySelectorAll("[data-chip]"), { y: 14, opacity: 0, stagger: 0.05, duration: 0.6, ease: "expo.out" }, 0.3);
      });
      gsap.to("[data-orbit]", { rotate: 360, duration: 60, repeat: -1, ease: "none" });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden py-28 sm:py-40">
      <div data-orbit className="pointer-events-none absolute right-[-20vw] top-10 h-[60vw] w-[60vw] rounded-full border border-dashed border-black/10" />
      <div className="pointer-events-none absolute right-[-12vw] top-[18%] h-[44vw] w-[44vw] rounded-full border border-black/6" />

      <div className="relative mx-auto grid max-w-310 gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <SectionHeading eyebrow="Methodology" title="How our numbers" accent="are built" bodyWidth="max-w-110">
            Bottom-up, from the ground floor. RE Journal is the first platform to quantitatively forecast both commercial and residential real estate markets.
          </SectionHeading>
          <div className="mt-10 flex items-end gap-4">
            <span className="text-[88px] font-semibold leading-none tracking-tighter">4</span>
            <span className="pb-3 text-[14px] leading-snug text-muted">
              asset classes forecast at
              <br />
              submarket and city level
            </span>
          </div>
        </div>

        <div data-steps className="relative">
          <div className="absolute bottom-8 left-6.75 top-8 w-px bg-black/10" />
          <div data-line className="absolute bottom-8 left-6.75 top-8 w-px origin-top bg-ink" />
          {STEPS.map((s, i) => (
            <div key={s.k} data-step className="relative grid grid-cols-[56px_1fr] gap-6 pb-16 last:pb-0">
              <span data-num className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white font-mono text-[15px] shadow-float">
                0{i + 1}
              </span>
              <div data-body className="rounded-3xl border border-line bg-white p-7">
                <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{s.k}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{s.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.chips.map((c) => (
                    <span key={c} data-chip className="rounded-full bg-bg px-3 py-1 text-[12.5px] font-medium text-ink-2">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
