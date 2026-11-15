"use client";

import { useRef } from "react";
import { ArrowRight, Building2, Store, Warehouse, House, Landmark, type LucideIcon } from "lucide-react";
import { gsap, reveal, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { LINKS } from "@/lib/site";

type P = { name: string; desc: string; icon: LucideIcon; bg: string; ink: string; skyline: number[] };

const PRODUCTS: P[] = [
  { name: "Office", desc: "Commercial office spaces and business centres for companies of all sizes.", icon: Building2, bg: "#e7ebff", ink: "#2448ff", skyline: [5, 8, 12, 9, 14, 7, 10, 6] },
  { name: "Retail", desc: "Prime retail spaces and shopping centres in high-traffic locations.", icon: Store, bg: "#ffe9de", ink: "#c2532c", skyline: [3, 4, 4, 6, 6, 4, 3, 5] },
  { name: "Warehousing", desc: "Modern industrial warehouses and logistics storage facilities.", icon: Warehouse, bg: "#e5ece8", ink: "#2f6a4d", skyline: [3, 3, 3, 3, 4, 4, 3, 3] },
  { name: "Residential", desc: "Premium residential properties and luxury housing developments.", icon: House, bg: "#f4ecdd", ink: "#9a6a22", skyline: [6, 9, 7, 11, 8, 10, 6, 7] },
  { name: "Mortgage", desc: "Competitive mortgage services and flexible financing solutions.", icon: Landmark, bg: "#efe7f6", ink: "#7a46a6", skyline: [2, 3, 4, 5, 7, 9, 11, 14] },
];

function Skyline({ values, color }: { values: number[]; color: string }) {
  const max = 14;
  return (
    <svg viewBox="0 0 160 70" className="h-full w-full" preserveAspectRatio="none">
      {values.map((v, i) => {
        const h = (v / max) * 64;
        return (
          <g key={i}>
            <rect data-sky x={i * 20 + 2} y={70 - h} width="16" height={h} rx="2" fill={color} opacity={0.12 + (i % 3) * 0.08} />
            {Array.from({ length: Math.floor(h / 8) }).map((_, k) => (
              <rect key={k} x={i * 20 + 6} y={70 - h + 4 + k * 8} width="8" height="3" rx="1" fill={color} opacity="0.25" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function Solutions() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const dist = () => el.scrollWidth - window.innerWidth + 64;
        const tween = gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          gsap.from(card.querySelectorAll("[data-sky]"), {
            scaleY: 0,
            transformOrigin: "bottom",
            stagger: 0.04,
            ease: "expo.out",
            duration: 1,
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 90%" },
          });
          gsap.from(card, {
            rotate: 4,
            y: 40,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "left 55%", scrub: true },
          });
        });
        gsap.to("[data-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), scrub: true },
        });
      });
      mm.add("(max-width: 1023px)", () => {
        reveal("[data-card]", track.current, { y: 50, stagger: 0.1 }, "top 80%");
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="solutions" className="relative overflow-hidden bg-bg lg:h-screen">
      <div className="flex h-full flex-col justify-center py-24 lg:py-0">
        <div ref={track} className="flex flex-col gap-5 px-5 sm:px-8 lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:pl-[max(32px,calc((100vw-1240px)/2))]">
          <div className="flex flex-col justify-between lg:w-110 lg:shrink-0 lg:pr-8">
            <div>
              <SectionHeading eyebrow="Explore our offerings" title="Our real estate" accent="solutions" bodyWidth="max-w-95">
            A comprehensive range of products tailored to your investment needs and market requirements.
          </SectionHeading>
            </div>
            <a href={LINKS.products} className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-white">
              View all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={p.name}
                data-card
                className="group relative flex h-110 flex-col overflow-hidden rounded-[28px] p-7 sm:h-120 lg:h-[min(560px,70vh)] lg:w-100 lg:shrink-0"
                style={{ background: p.bg }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[12px]" style={{ color: p.ink }}>
                    0{i + 1} / 05
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" style={{ color: p.ink }}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-6 text-[clamp(2.4rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.04em]">{p.name}</h3>
                <p className="mt-3 max-w-75 text-[15px] leading-relaxed text-ink-2">{p.desc}</p>
                <div className="mt-auto h-32.5 w-full transition-transform duration-700 group-hover:scale-[1.04]">
                  <Skyline values={p.skyline} color={p.ink} />
                </div>
                <a href={LINKS.product(p.name)} aria-label={`View ${p.name} details`} className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: p.ink }}>
                  View details
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </article>
            );
          })}
          <div className="hidden w-[8vw] shrink-0 lg:block" />
        </div>

        <div className="mx-auto mt-10 hidden h-0.5 w-[min(1240px,calc(100%-64px))] overflow-hidden rounded-full bg-black/[0.07] lg:block">
          <div data-progress className="h-full origin-left scale-x-0 bg-ink" />
        </div>
      </div>
    </section>
  );
}
