"use client";

import { useRef } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import MiniPreview from "./MiniPreview";
import type { PreviewKind } from "./data";

const KIND_LABEL: Record<PreviewKind, string> = {
  bars: "Bar chart",
  stack: "Stacked bars",
  line: "Trend line",
  heat: "Heatmap",
  donut: "Share mix",
  gauge: "Score gauge",
  forecast: "Forecast",
};

type Props = { name: string; icon: LucideIcon; color: string; preview: PreviewKind };

/**
 * Dock app tile. Calm by default (icon, name, what's inside); on hover, keyboard focus or tap it
 * morphs: the header glides up and the mini chart plays its own entrance (bars grow, lines draw,
 * heat cells ripple, donut sweeps, gauge needle swings). Leaving plays it in reverse.
 * A cursor-following glow in the app's colour sits underneath.
 */
export default function DockTile({ name, icon: Icon, color, preview }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const t = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });

      // 1. morph: resting face lifts away, preview face rises in
      t.to(q("[data-rest]"), { y: -14, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
        .fromTo(q("[data-peek]"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.12);

      // 2. the chart's own entrance
      const at = 0.2;
      const bars = q("[data-prev-bar]");
      if (bars.length) t.from(bars, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.035 }, at);
      const cells = q("[data-prev-cell]");
      if (cells.length) t.from(cells, { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: { each: 0.008, grid: [4, 12], from: "center" } }, at);
      const lines = q("[data-prev-draw]");
      if (lines.length) t.fromTo(lines, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" }, at);
      const rings = q("[data-prev-ring]");
      if (rings.length) t.from(rings, { attr: { "stroke-dasharray": "0 100" }, duration: 0.8, stagger: 0.08, ease: "power3.out" }, at);
      const gauge = q("[data-prev-gauge]");
      if (gauge.length) t.from(gauge, { attr: { "stroke-dasharray": "0 100" }, duration: 0.9, ease: "power3.out" }, at);
      const needle = q("[data-prev-needle]");
      if (needle.length) t.from(needle, { rotation: -150, svgOrigin: "36 36", duration: 1.1, ease: "elastic.out(1, 0.5)" }, at);
      const fades = q("[data-prev-fade]");
      if (fades.length) t.from(fades, { autoAlpha: 0, duration: 0.5, stagger: 0.05 }, at + 0.25);

      tl.current = t;
      return () => t.kill();
    },
    { scope: root },
  );

  const isOpen = useRef(false);
  const focusedAt = useRef(0);
  const open = () => {
    const t = tl.current;
    isOpen.current = true;
    if (!t) return;
    if (prefersReducedMotion()) t.progress(1).pause();
    else t.timeScale(1).play();
  };
  const close = () => {
    const t = tl.current;
    isOpen.current = false;
    if (!t) return;
    if (prefersReducedMotion()) t.progress(0).pause();
    else t.timeScale(1.8).reverse();
  };
  const onFocus = () => {
    focusedAt.current = performance.now();
    open();
  };
  // touch screens have no hover: a tap toggles the preview. A tap also focuses the tile, so the
  // tap that just focused it means "open", not "toggle closed".
  const onClick = () => {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (performance.now() - focusedAt.current < 400) return open();
    if (isOpen.current) close();
    else open();
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={root}
      data-app
      tabIndex={0}
      role="button"
      aria-label={`${name}: ${KIND_LABEL[preview].toLowerCase()} preview`}
      onPointerEnter={(e) => e.pointerType === "mouse" && open()}
      onPointerLeave={(e) => e.pointerType === "mouse" && close()}
      onPointerMove={onMove}
      onFocus={onFocus}
      onBlur={close}
      onClick={onClick}
      style={{ ["--tile" as string]: color }}
      className="group relative h-26 min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--tile)_35%,white)] hover:shadow-[0_14px_30px_-18px_color-mix(in_oklab,var(--tile)_70%,black)] focus-visible:border-[color-mix(in_oklab,var(--tile)_45%,white)] sm:h-28"
    >
      {/* cursor spotlight in the app's colour */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(180px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--tile)_14%,transparent),transparent_70%)]" />

      {/* resting face */}
      <div data-rest className="absolute inset-0 flex flex-col justify-between p-3 sm:p-3.5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${color} 13%, white)`, color }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-ink sm:text-[14px]">{name}</div>
          <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{KIND_LABEL[preview]}</div>
        </div>
      </div>

      {/* preview face */}
      <div data-peek className="invisible absolute inset-0 flex flex-col gap-2 p-3 opacity-0 sm:p-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: `color-mix(in oklab, ${color} 13%, white)`, color }}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink sm:text-[13px]">{name}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted" />
        </div>
        <div className="min-h-0 flex-1">
          <MiniPreview kind={preview} name={name} color={color} />
        </div>
      </div>
    </div>
  );
}
