"use client";

import { useRef } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import MiniPreview from "./MiniPreview";
import type { PreviewKind } from "./data";
import { KIND_LABEL, addChartEntrance } from "./chartAnim";

type Props = { name: string; icon: LucideIcon; color: string; preview: PreviewKind; onOpen: (tile: HTMLElement) => void };

/**
 * Dock app tile. Calm by default (icon, name, what's inside); on hover, keyboard focus or tap it
 * morphs: the header glides up and the mini chart plays its own entrance (bars grow, lines draw,
 * heat cells ripple, donut sweeps, gauge needle swings). Leaving plays it in reverse.
 * A cursor-following glow in the app's colour sits underneath.
 */
export default function DockTile({ name, icon: Icon, color, preview, onOpen }: Props) {
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
      addChartEntrance(t, q, 0.2);

      tl.current = t;
      return () => t.kill();
    },
    { scope: root },
  );

  const open = () => {
    const t = tl.current;
    if (!t) return;
    if (prefersReducedMotion()) t.progress(1).pause();
    else t.timeScale(1).play();
  };
  const close = () => {
    const t = tl.current;
    if (!t) return;
    if (prefersReducedMotion()) t.progress(0).pause();
    else t.timeScale(1.8).reverse();
  };
  // click / tap / Enter / Space opens the full preview panel
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(e.currentTarget);
    }
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
      aria-label={`Open ${name} preview (${KIND_LABEL[preview].toLowerCase()})`}
      onPointerEnter={(e) => e.pointerType === "mouse" && open()}
      onPointerLeave={(e) => e.pointerType === "mouse" && close()}
      onPointerMove={onMove}
      onFocus={open}
      onBlur={close}
      onClick={(e) => onOpen(e.currentTarget)}
      onKeyDown={onKeyDown}
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
