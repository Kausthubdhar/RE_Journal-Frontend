"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Plus } from "lucide-react";
import { CATEGORIES } from "./data";
import PromptBox from "./PromptBox";
import DockTile from "./DockTile";
import DockDetail, { type DetailApp } from "./DockDetail";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

const CityScene = dynamic(() => import("./CityScene"), { ssr: false });

const SLOTS = [
  "left-[3%] top-[30%]",
  "right-[3%] top-[20%]",
  "right-[9%] top-[54%]",
];

const TAB_DURATION = 7;
const TITLE = ["Real", "estate", "data,", "powered", "by"];
const TITLE_ACCENT = ["scientific", "research"];

/** CSS custom props for the .hero-in / .hero-word intro: delay and starting offset. */
const intro = (d: number, from?: number) =>
  ({ "--d": `${d}s`, ...(from ? { "--from": `${from}px` } : {}) }) as CSSProperties;

/** Skip WebGL on devices that would struggle or asked to save data; the poster stays instead. */
function canRun3D() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return false;
  if ((navigator.hardwareConcurrency ?? 4) <= 2) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** Lightweight skyline painted with the HTML, shown before (or instead of) the 3D scene. */
function ScenePoster({ hidden }: { hidden: boolean }) {
  const blocks = [
    [-150, 34, 70],
    [-95, 26, 120],
    [-40, 30, 170],
    [20, 28, 135],
    [75, 32, 95],
    [130, 24, 60],
  ];
  return (
    <svg
      viewBox="-320 -230 640 330"
      preserveAspectRatio="xMidYMid meet"
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${hidden ? "opacity-0" : "opacity-100"}`}
      aria-hidden
    >
      <defs>
        <radialGradient id="poster-pad">
          <stop offset="0" stopColor="var(--surface-2)" />
          <stop offset="1" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="poster-face" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e4e7ee" />
          <stop offset="1" stopColor="#ccd2dc" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="34" rx="300" ry="64" fill="url(#poster-pad)" />
      {blocks.map(([x, w, h]) => (
        <g key={x}>
          <rect x={x} y={30 - h} width={w} height={h} rx="2" fill="url(#poster-face)" />
          <rect x={x + w} y={36 - h} width={w * 0.45} height={h - 6} fill="#bfc5d0" />
        </g>
      ))}
    </svg>
  );
}

/** Progress ring on the active tab; calls onDone when full. Driven by GSAP so it never stalls. */
function TabProgress({ playing, onDone }: { playing: boolean; onDone: () => void }) {
  const arc = useRef<SVGCircleElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useGSAP(() => {
    // reduced motion: no auto-advance, ring shows as a static full circle
    if (prefersReducedMotion()) {
      gsap.set(arc.current, { strokeDashoffset: 0 });
      return;
    }
    tween.current = gsap.fromTo(
      arc.current,
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: TAB_DURATION, ease: "none", paused: !playing, onComplete: () => done.current() },
    );
  });

  useEffect(() => {
    tween.current?.paused(!playing);
  }, [playing]);

  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 -rotate-90" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <circle
        ref={arc}
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
      />
    </svg>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const cat = CATEGORIES[idx];

  // The intro reveal is pure CSS (.hero-in / .hero-word), so the hero paints before JS loads.
  // GSAP only adds the scroll scrub.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-hero-stage]", {
        scale: 0.94,
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-dock]", {
        y: -60,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  // phones: dock row scroll progress (written straight to the DOM, no re-render per scroll)
  const row = useRef<HTMLDivElement>(null);
  const rowThumb = useRef<HTMLDivElement>(null);
  const onRowScroll = () => {
    const r = row.current;
    const t = rowThumb.current;
    if (!r || !t) return;
    const frac = Math.min(1, r.clientWidth / r.scrollWidth);
    const max = r.scrollWidth - r.clientWidth;
    const p = max > 0 ? r.scrollLeft / max : 0;
    t.style.width = `${frac * 100}%`;
    t.style.transform = `translateX(${p * (1 / frac - 1) * 100}%)`;
  };

  // per-category transitions (dock apps are already visible from the server render on first mount)
  const shownIdx = useRef(idx);
  useGSAP(
    () => {
      gsap.fromTo(
        "[data-callout]",
        { y: 18, autoAlpha: 0, scale: 0.96 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, ease: "expo.out", stagger: 0.12, delay: 0.9 },
      );
      if (shownIdx.current === idx) return;
      shownIdx.current = idx;
      // tiles glide in from the right one after another, then each colour bar draws itself
      row.current?.scrollTo({ left: 0 });
      onRowScroll();
      gsap.fromTo(
        "[data-app]",
        { x: 48, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.1 },
      );
      gsap.fromTo("[data-bar]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.45 });
      gsap.fromTo("[data-workspace]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.5 });
    },
    { scope: root, dependencies: [idx] },
  );

  useEffect(() => ScrollTrigger.refresh(), []);

  const next = () => setIdx((i) => (i + 1) % CATEGORIES.length);

  // auto-advance only while on screen and the browser tab is visible; it pauses while the mouse is
  // over the tabs/dock, keyboard focus is inside the tabs, or a dock tile is open (tap or keyboard)
  const [hovered, setHovered] = useState(false);
  const [tabFocus, setTabFocus] = useState(false);
  // a dock tile opened by tap or keyboard also holds the rotation (phones have no hover to pause it)
  const [tileFocus, setTileFocus] = useState(false);
  // the full preview panel opened from a dock tile (holds the rotation while open)
  const [detail, setDetail] = useState<{ app: DetailApp; from: HTMLElement } | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const auto = onScreen && !hovered && !tabFocus && !tileFocus && !detail;

  useEffect(() => {
    let inView = true;
    const update = () => setOnScreen(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(root.current!);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // roving tabindex + arrow keys (WAI-ARIA tabs pattern)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (e: KeyboardEvent) => {
    const n = CATEGORIES.length;
    const to = ({ ArrowRight: idx + 1, ArrowLeft: idx - 1 + n, Home: 0, End: n - 1 } as Record<string, number>)[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const i = to % n;
    setDetail(null);
    setIdx(i);
    tabRefs.current[i]?.focus();
  };

  // 3D loads once the browser is idle after first paint; weak devices keep the poster
  const [use3D, setUse3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    if (!canRun3D()) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setUse3D(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setUse3D(true), 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <section ref={root} id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* copy */}
      <div className="relative z-20 mx-auto max-w-225 px-5 text-center">
        <h1 className="text-[clamp(2.4rem,6.2vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">
          {TITLE.map((w, i) => (
            <span key={w}>
              <span className="hero-word">
                <span style={intro(0.1 + i * 0.06)}>{w}</span>
              </span>{" "}
            </span>
          ))}
          <span className="font-mono text-[0.8em] font-medium tracking-tighter">
            {TITLE_ACCENT.map((w, i) => (
              <span key={w}>
                <span className="hero-word">
                  <span style={intro(0.1 + (TITLE.length + i) * 0.06)}>{w}</span>
                </span>
                {i < TITLE_ACCENT.length - 1 && " "}
              </span>
            ))}
          </span>
        </h1>
        <p style={intro(0.45, 20)} className="hero-in mx-auto mt-5 max-w-155 text-[15px] leading-relaxed text-muted sm:text-[17px]">
          RE Journal dives deep into India&apos;s office, retail, warehousing and residential markets with an
          econometric forecasting approach, giving you realistic insight for every decision.
        </p>
      </div>

      <div style={intro(0.55, 30)} className="hero-in relative z-30">
        <PromptBox />
      </div>

      {/* stage */}
      <div style={intro(0.35, 60)} className="hero-in relative z-10">
        <div
          data-hero-stage
          id="hero-panel"
          role="tabpanel"
          aria-labelledby={`hero-tab-${cat.key}`}
          className="relative mx-auto -mt-16 h-[clamp(420px,54vw,720px)] max-w-370 origin-top"
        >
          {/* the scene fades in at the top with a mask, so the page's own background shows through (no painted band) */}
          <div className="absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_6rem)]">
            <ScenePoster hidden={sceneReady} />
            {use3D && <CityScene active={cat.key} onReady={() => setSceneReady(true)} />}
          </div>

          {/* callouts */}
          <div key={cat.key} className="pointer-events-none absolute inset-0 hidden md:block">
            {cat.callouts.map((c, i) => (
              <div
                key={c.k}
                data-callout
                className={`absolute ${SLOTS[i]} invisible rounded-xl border border-surface/70 bg-surface/95 px-3.5 py-2.5 shadow-float`}
              >
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {cat.label}
                </div>
                <div className="mt-1 text-[17px] font-semibold tracking-tight">{c.k}</div>
                <div className="text-[12px] text-muted">{c.l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* dock: a closed card with the asset-class tabs set into its top edge */}
      <div style={intro(0.8, 80)} className="hero-in relative z-20 pb-6 sm:pb-12">
        <div
          data-hero-dock
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={(e) => setTileFocus(!!e.target.closest("[data-app]"))}
          onBlur={() => setTileFocus(false)}
          className="relative mx-auto -mt-27.5 w-[min(960px,calc(100%-24px))] sm:-mt-31"
        >
          <div
            data-open={detail ? "true" : undefined}
            className="relative rounded-[26px] border border-surface/80 bg-surface/95 px-4 pb-4 pt-9 shadow-float transition-[min-height] duration-500 ease-out data-open:min-h-84 sm:px-6 sm:pb-6 sm:pt-10 sm:data-open:min-h-62"
          >
            <div className="flex items-center justify-between gap-3">
              <span data-workspace className="flex items-center gap-2 rounded-full border border-line bg-bg/70 py-1 pl-1.5 pr-2.5 text-[12.5px] font-medium text-ink-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${cat.apps[0].color} 16%, white)` }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: cat.apps[0].color }} />
                </span>
                {cat.workspace}
                <ChevronDown className="h-3 w-3 text-muted" />
              </span>
              <div className="flex items-center gap-2.5">
                <div className="hidden -space-x-1.5 sm:flex" aria-hidden>
                  {["#2448ff", "#d0613a", "#3c7a5a", "#c4892b"].map((c, i) => (
                    <span key={c} className="h-6 w-6 rounded-full border-2 border-surface text-center text-[9px] leading-5 font-semibold text-white" style={{ background: c }}>
                      {["A", "R", "S", "M"][i]}
                    </span>
                  ))}
                </div>
                <span className="rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-surface">Share</span>
              </div>
            </div>

            {/* one row: swipe on phones (snap + peeking next tile), six across on desktop */}
            <div
              ref={row}
              onScroll={onRowScroll}
              className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-5 sm:snap-none sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {cat.apps.map((a) => (
                <DockTile
                  key={cat.key + a.name}
                  name={a.name}
                  icon={a.icon}
                  color={a.color}
                  preview={a.preview}
                  onOpen={(from) => setDetail({ app: a, from })}
                />
              ))}
              {cat.apps.length < 6 && (
                <div data-app className="group h-28 w-36 min-w-0 shrink-0 snap-start cursor-pointer rounded-2xl border border-dashed border-ink/15 text-muted transition-colors hover:border-ink/30 hover:text-ink sm:w-auto sm:flex-1">
                  {/* padding lives inside so this tile sizes exactly like the others in the flex row */}
                  <div className="flex h-full flex-col justify-between p-3.5">
                  <span className="flex flex-col items-start gap-2">
                    <Plus className="h-5.5 w-5.5" strokeWidth={1.6} />
                    <span data-bar className="h-0.75 w-5 rounded-full bg-ink/15 transition-[width] duration-500 ease-out group-hover:w-10" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium leading-tight">New view</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em]">Build your own</div>
                  </div>
                  </div>
                </div>
              )}
            </div>
            {/* phones: how far along the row you are */}
            <div className="mx-auto mt-3 h-1 w-16 overflow-hidden rounded-full bg-ink/8 sm:hidden" aria-hidden>
              <div ref={rowThumb} className="h-full rounded-full bg-ink/55" style={{ width: "40%" }} />
            </div>

            {detail && (
              <DockDetail key={detail.app.name} app={detail.app} origin={detail.from} category={cat.label} onClose={() => setDetail(null)} />
            )}
          </div>

          {/* tabs sit on the card's top edge, so they always move with it */}
          <div style={intro(0.9, 20)} className="hero-in absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center px-3">
            <div
              role="tablist"
              aria-label="Asset classes"
              onKeyDown={onTabKey}
              onFocus={(e) => setTabFocus(e.target.matches(":focus-visible"))}
              onBlur={() => setTabFocus(false)}
              className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface-2 p-1 shadow-[0_8px_20px_-10px_rgba(14,15,16,0.3)]"
            >
              {CATEGORIES.map((c, i) => {
                const on = i === idx;
                return (
                  <button
                    key={c.key}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`hero-tab-${c.key}`}
                    role="tab"
                    aria-selected={on}
                    aria-controls="hero-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => {
                      setDetail(null);
                      setIdx(i);
                    }}
                    className={`relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] transition-all duration-300 ${
                      on ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {on && <TabProgress key={idx} playing={auto} onDone={next} />}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
