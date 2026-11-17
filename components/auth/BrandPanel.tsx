"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import IsoScene from "../IsoScene";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const COPY = {
  login: {
    eyebrow: "Welcome back",
    title: "Your markets,",
    accent: "right where you left them.",
    points: [] as string[],
  },
  signup: {
    eyebrow: "Get started",
    title: "Forecast India's real estate",
    accent: "with evidence.",
    points: [
      "Office, retail, warehousing and residential coverage",
      "Econometric Y1 → Y5 forecasts for key indicators",
      "Project-level records across 20+ cities",
    ],
  },
};

/** Dark brand panel beside the auth forms: isometric city, floating stat cards, short pitch. */
export default function BrandPanel({ variant }: { variant: "login" | "signup" }) {
  const root = useRef<HTMLDivElement>(null);
  const c = COPY[variant];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-copy] > *", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.1)
        .from("[data-sky]", { scaleY: 0, transformOrigin: "50% 100%", duration: 1.3, stagger: 0.07 }, 0.2)
        .from("[data-stat]", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.7);
      // gentle float on the stat cards once they have landed
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 8 : -8, duration: 3.2 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.8 });
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative flex h-full min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[28px] bg-deep p-10 text-white xl:p-14"
    >
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-120 w-120 rounded-full bg-accent/35 blur-[120px]" />

      <div data-copy className="relative max-w-120">
        <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {c.eyebrow}
        </span>
        <h2 className="mt-5 text-[clamp(2.2rem,3.2vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
          {c.title} <span className="serif font-normal italic text-white/85">{c.accent}</span>
        </h2>
        {c.points.length > 0 && (
          <ul className="mt-7 flex flex-col gap-3">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-white/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* city + floating stats */}
      <div className="relative mt-auto flex min-h-80 flex-1 items-end justify-center pt-10">
        <div className="relative h-[min(46vh,420px)] w-full max-w-130">
          <IsoScene kind={variant === "login" ? "office" : "residential"} ink="#2448ff" />
        </div>

        <div data-stat className="absolute left-0 top-[18%] rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/55">Cities covered</div>
          <div className="mt-1 text-[24px] font-semibold tracking-tight">20+</div>
        </div>
        <div data-stat className="absolute right-0 top-[8%] rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/55">Commercial projects</div>
          <div className="mt-1 text-[24px] font-semibold tracking-tight">5,000+</div>
        </div>
        <div data-stat className="absolute bottom-[14%] right-[4%] rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/55">Forecast horizon</div>
          <div className="mt-1 text-[24px] font-semibold tracking-tight">Y1 → Y5</div>
        </div>
      </div>
    </div>
  );
}
