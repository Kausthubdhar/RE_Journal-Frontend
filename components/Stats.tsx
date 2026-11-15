"use client";

import { useRef } from "react";
import { gsap, reveal, SplitText, useGSAP } from "@/lib/gsap";

const STATS = [
  { n: 20, suffix: "+", label: "Cities covered", note: "Pan-India footprint" },
  { n: 5000, suffix: "+", label: "Commercial projects", note: "Tracked one by one" },
  { n: 2000, suffix: " Mn+", label: "Sq. ft. of stock tracked", note: "Across all covered cities" },
  { n: 5, suffix: " yrs", label: "Forecast horizon", note: "Y1 → Y5 for key indicators" },
];

const KEY = ["Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Delhi NCR", "Kolkata"];
const CITIES = [...KEY, ...KEY];

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create("[data-lede]", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: "[data-lede]", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("en-IN");
          },
        });
      });
      reveal("[data-stat]", "[data-stats]", { stagger: 0.1 });
      gsap.from("[data-bar]", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-stats]", start: "top 80%" },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative pt-10 sm:pt-14">
      {/* marquee */}
      <div className="relative mb-20 overflow-hidden border-y border-line py-4 sm:mb-28">
        <div className="mask-[linear-gradient(to_right,transparent,black_6rem,black_calc(100%-6rem),transparent)]">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...CITIES, ...CITIES].map((c, i) => (
            <span key={i} className="flex items-center gap-10 text-[15px] text-muted">
              <span className="font-medium text-ink-2">{c}</span>
              <span className="h-1 w-1 rounded-full bg-black/25" />
            </span>
          ))}
        </div>
        </div>
      </div>

      <div className="mx-auto max-w-310 px-5 sm:px-8">
        <span className="eyebrow">About RE Journal</span>
        <p
          data-lede
          className="mt-6 max-w-262.5 text-[clamp(1.6rem,3.6vw,3rem)] font-medium leading-[1.12] tracking-tight"
        >
          We help investors, developers, occupiers, HNIs, home buyers and solution providers decide with confidence, with reliable data, granular analytics and econometric outlooks built bottom-up, project by project.
        </p>

        <div data-stats className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} data-stat className="relative flex min-h-55 flex-col justify-between bg-bg p-7">
              <span className="font-mono text-[12px] text-muted">0{i + 1}</span>
              <div>
                <div className="flex items-baseline text-[clamp(2.6rem,4.4vw,3.8rem)] font-semibold leading-none tracking-[-0.04em]">
                  <span data-count={s.n}>0</span>
                  <span className="serif ml-1 text-[0.6em] font-normal italic text-ink-2">{s.suffix.trim()}</span>
                </div>
                <div className="mt-3 text-[15px] font-medium">{s.label}</div>
                <div className="text-[13px] text-muted">{s.note}</div>
                <div className="mt-5 h-0.75 w-full overflow-hidden rounded-full bg-black/6">
                  <div data-bar className="h-full rounded-full bg-ink" style={{ width: `${40 + i * 18}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
