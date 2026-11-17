"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChartColumn, SlidersHorizontal, FlaskConical, BadgeCheck, Radio, Database, Headset, ChevronDown, LayoutGrid, Search } from "lucide-react";
import { gsap, prefersReducedMotion, reveal, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  {
    icon: ChartColumn,
    title: "Interactive charts",
    short: "Charts",
    body: "Visualise complex market data with dynamic bar charts, line graphs and heat maps for at-a-glance trend analysis.",
  },
  {
    icon: SlidersHorizontal,
    title: "Advanced filters",
    short: "Filters",
    body: "Drill down to neighbourhood level and filter by property type, timeframe, price point and key economic indicators.",
  },
  {
    icon: FlaskConical,
    title: "Scientific forecasting",
    short: "Forecasts",
    body: "Econometric models built on historical data project market movements, rental yields and property appreciation.",
  },
];

const BADGES = [
  { icon: BadgeCheck, k: "Authentic data", l: "Verified at source" },
  { icon: Radio, k: "Live", l: "Continuously updated" },
  { icon: Database, k: "Robust research", l: "Research-grade models" },
  { icon: Headset, k: "Dedicated support", l: "End-to-end" },
];

// illustrative series
const HIST = [112, 108, 101, 106, 114, 121, 128];
const FCST = [134, 139, 145, 150, 156];
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const BARS = [3.1, 3.6, 2.9, 4.2, 4.6, 3.9, 5.1, 5.6];
const SUBS = ["BKC", "Lower Parel", "Andheri", "Powai", "Thane", "Navi Mumbai"];

const W = 560, H = 200, PAD = 24;
const minV = 90, maxV = 170;
const X = (i: number) => PAD + (i / (YEARS.length - 1)) * (W - PAD * 2);
const Y = (v: number) => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);

function LineChart({ horizon }: { horizon: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const hist = HIST.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  const fc = [HIST[HIST.length - 1], ...FCST.slice(0, horizon)];
  const off = HIST.length - 1;
  const fcPath = fc.map((v, i) => `${i ? "L" : "M"}${X(off + i)},${Y(v)}`).join(" ");
  const up = fc.map((v, i) => `${X(off + i)},${Y(v + i * 3.2)}`);
  const dn = fc.map((v, i) => `${X(off + i)},${Y(v - i * 3.2)}`).reverse();
  const band = `M${up.join(" L")} L${dn.join(" L")} Z`;

  useEffect(() => {
    const p = ref.current?.querySelector<SVGPathElement>("[data-fc]");
    if (!p) return;
    const len = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: `${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", onComplete: () => {
        gsap.set(p, { strokeDasharray: "5 5" });
      } });
    gsap.fromTo(ref.current!.querySelector("[data-band]"), { opacity: 0 }, { opacity: 1, duration: 0.8 });
  }, [horizon]);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      {[100, 120, 140, 160].map((v) => (
        <g key={v}>
          <line x1={PAD} x2={W - PAD} y1={Y(v)} y2={Y(v)} stroke="var(--ink)" strokeOpacity="0.06" />
          <text x={W - PAD + 4} y={Y(v) + 3} fontSize="9" fill="var(--muted)">{v}</text>
        </g>
      ))}
      <line x1={X(off)} x2={X(off)} y1={PAD - 6} y2={H - PAD} stroke="var(--ink)" strokeOpacity="0.2" strokeDasharray="2 3" />
      <text x={X(off) + 5} y={PAD} fontSize="9" fill="var(--muted)">Forecast →</text>
      <path data-band d={band} fill="#2448ff" fillOpacity="0.12" />
      <path data-hist d={hist} fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <path data-fc d={fcPath} fill="none" stroke="#2448ff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {fc.slice(1).map((v, i) => (
        <circle key={i} cx={X(off + i + 1)} cy={Y(v)} r="3" fill="#fff" stroke="#2448ff" strokeWidth="1.8" />
      ))}
      {YEARS.map((y, i) => (
        <text key={y} x={X(i)} y={H - 6} fontSize="9" textAnchor="middle" fill={i > off && i - off > horizon ? "var(--line)" : "var(--muted)"}>
          {String(y).slice(2)}
        </text>
      ))}
    </svg>
  );
}

const TOUR_STEP = 5; // seconds per feature in the mobile tour

/**
 * Phones: the mockup can't stay pinned beside the feature list, so a compact tab bar above it walks
 * through the features (auto-advancing while the mockup is on screen) and the mockup highlights each.
 */
function MobileTour({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  });

  // auto-advance only while the tour + mockup are on screen
  useEffect(() => {
    const el = root.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!bar.current || prefersReducedMotion()) return;
      gsap.fromTo(caption.current, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" });
      const t = gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, duration: TOUR_STEP, ease: "none", paused: !inView, onComplete: () => select.current((active + 1) % FEATURES.length) },
      );
      return () => t.kill();
    },
    { dependencies: [active, inView], revertOnUpdate: true },
  );

  const f = FEATURES[active];
  return (
    <div ref={root} className="mb-5 lg:hidden">
      <div role="tablist" aria-label="Dashboard features" className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
        {FEATURES.map((x, i) => {
          const Icon = x.icon;
          const on = i === active;
          return (
            <button
              key={x.title}
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(i)}
              className={`relative flex cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl px-2 py-2.5 text-[13px] font-medium transition-colors duration-300 ${
                on ? "bg-white text-[#0e0f10]" : "text-white/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {x.short}
              {on && <span ref={bar} className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-accent" aria-hidden />}
            </button>
          );
        })}
      </div>
      <p ref={caption} aria-live="polite" className="mt-3 min-h-[4.5em] text-[14.5px] leading-relaxed text-white/65">
        <span className="font-medium text-white">{f.title}.</span> {f.body}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [horizon, setHorizon] = useState(5);
  const heat = useMemo(() => SUBS.map((_, r) => Array.from({ length: 8 }, (_, c) => Math.round((0.15 + ((Math.sin(r * 1.7 + c * 0.9) + 1) / 2) * 0.75) * 100) / 100)), []);

  useGSAP(
    () => {
      // desktop: the pinned mockup follows the feature being read; phones use MobileTour instead
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-feature]").forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (s) => s.isActive && setActive(i),
          });
        });
      });
      reveal("[data-mock]", "[data-mock]", { y: 80, rotateX: 12, duration: 1.4 });
      gsap.from("[data-bar]", {
        scaleY: 0,
        transformOrigin: "bottom",
        stagger: 0.06,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-mock]", start: "top 70%" },
      });
      gsap.from("[data-heat]", {
        opacity: 0,
        scale: 0.4,
        stagger: { each: 0.012, from: "random" },
        duration: 0.6,
        scrollTrigger: { trigger: "[data-mock]", start: "top 65%" },
      });
      reveal("[data-badge]", "[data-badges]", { y: 30, stagger: 0.08, duration: 0.9 }, "top 88%");
    },
    { scope: root },
  );

  // auto-step the forecast horizon when the forecasting feature is active
  useEffect(() => {
    if (active !== 2) return;
    let h = 0;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      h += 1;
      setHorizon(h);
      if (h < 5) id = setTimeout(tick, 700);
    };
    id = setTimeout(tick, 0);
    return () => clearTimeout(id);
  }, [active]);

  const ring = (i: number) =>
    `transition-all duration-500 ${active === i ? "ring-2 ring-accent/70 ring-offset-2 ring-offset-white" : "opacity-60"}`;

  return (
    <section ref={root} id="platform" className="relative bg-deep py-28 text-white sm:py-40">
      <div className="mx-auto max-w-310 px-5 sm:px-8">
        <div className="max-w-190">
          <SectionHeading eyebrow="Custom dashboard features" title="Answers in a few clicks," accent="not a few weeks" dark bodyWidth="max-w-140">
            Our interactive portal turns granular market data into real-time insight and forecasts, with intuitive charts and filters for every asset class.
          </SectionHeading>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* mock (min-w-0 lets the swipeable filter row scroll instead of widening the grid) */}
          <div className="min-w-0">
          <MobileTour active={active} onSelect={setActive} />
          <div className="lg:sticky lg:top-27.5 lg:h-fit lg:[@media(max-height:920px)]:top-23" style={{ perspective: 1200 }}>
            <div data-mock className="overflow-hidden rounded-[22px] bg-surface text-ink shadow-[0_40px_120px_-30px_rgba(36,72,255,0.45)] dark:ring-1 dark:ring-white/10">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex min-w-0 flex-1 items-center gap-2 rounded-md bg-ink/4 px-2.5 py-1 text-[11px] text-muted">
                  <Search className="h-3 w-3 shrink-0" /> <span className="truncate">app.rejournal.in / office / mumbai</span>
                </div>
                <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">Illustrative data</span>
              </div>
              <div className="flex">
                <aside className="hidden w-13 flex-col items-center gap-3 border-r border-line py-4 sm:flex">
                  {[LayoutGrid, ChartColumn, SlidersHorizontal, FlaskConical].map((I, i) => (
                    <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === active + 1 ? "bg-ink text-white" : "text-muted"}`}>
                      <I className="h-4 w-4" />
                    </span>
                  ))}
                </aside>
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className={`no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl p-1 sm:flex-wrap ${ring(1)}`}>
                    {["City: Mumbai", "Asset: Office", "Grade A", "Submarket: BKC", "2019 – 2030"].map((f) => (
                      <span key={f} className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium">
                        {f} <ChevronDown className="h-3 w-3 text-muted" />
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ["Rent (₹/sq ft/mo)", "128", "+5.8%"],
                      ["Vacancy", "11.4%", "−0.9 pp"],
                      ["Net absorption", "1.2 Mn", "+14%"],
                    ].map(([k, v, d]) => (
                      <div key={k} className="rounded-xl border border-line p-3">
                        <div className="truncate text-[10.5px] text-muted">{k}</div>
                        <div className="mt-1 text-[18px] font-semibold tracking-tight">{v}</div>
                        <div className="text-[10.5px] font-medium text-emerald-600">{d}</div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 rounded-xl border border-line p-3 ${ring(2)}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-medium">Rent outlook · Grade A office</div>
                      <div className="flex gap-0.5 rounded-lg bg-ink/4 p-0.5">
                        {[1, 2, 3, 4, 5].map((y) => (
                          <button
                            key={y}
                            onClick={() => setHorizon(y)}
                            className={`cursor-pointer rounded-md px-2 py-0.5 text-[10.5px] font-medium transition ${horizon === y ? "bg-surface shadow-sm" : "text-muted"}`}
                          >
                            Y{y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 h-28 sm:h-42.5 [@media(max-height:920px)]:h-30">
                      <LineChart horizon={horizon} />
                    </div>
                  </div>

                  <div className={`mt-4 grid grid-cols-2 gap-3 rounded-xl ${ring(0)}`}>
                    <div className="rounded-xl border border-line p-3">
                      <div className="text-[12px] font-medium">Quarterly leasing</div>
                      <div className="mt-3 flex h-21 items-end gap-1.5">
                        {BARS.map((b, i) => (
                          <div key={i} data-bar className="flex-1 rounded-t-sm" style={{ height: `${(b / 6) * 100}%`, background: i === BARS.length - 1 ? "#2448ff" : "var(--ink)", opacity: i === BARS.length - 1 ? 1 : 0.15 + i * 0.08 }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-line p-3">
                      <div className="text-[12px] font-medium">Vacancy heatmap</div>
                      <div className="mt-3 grid grid-cols-8 gap-0.75">
                        {heat.flat().map((v, i) => (
                          <span key={i} data-heat className="aspect-square rounded-[3px] [@media(max-height:920px)]:aspect-auto [@media(max-height:920px)]:h-2.75" style={{ background: `rgba(36,72,255,${v})` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* features (desktop; phones get the MobileTour above the mockup) */}
          <div className="hidden flex-col lg:flex">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const on = active === i;
              return (
                <div key={f.title} data-feature className="flex min-h-[46vh] flex-col justify-center border-t border-white/10 py-10 first:border-t-0 lg:first:pt-0">
                  <div className={`transition-all duration-500 ${on ? "opacity-100" : "opacity-35"}`}>
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-500 ${on ? "bg-accent text-white" : "bg-white/10 text-white/70"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-[28px] font-semibold tracking-tight">{f.title}</h3>
                    <p className="mt-3 max-w-100 text-[16px] leading-relaxed text-white/60">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div data-badges className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.k} data-badge className="flex items-center gap-3 bg-deep p-5">
                <Icon className="h-5 w-5 shrink-0 text-accent" />
                <div>
                  <div className="text-[14px] font-medium">{b.k}</div>
                  <div className="text-[12.5px] text-white/50">{b.l}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
