"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, X, type LucideIcon } from "lucide-react";
import { gsap, prefersReducedMotion, scrollToId, useGSAP } from "@/lib/gsap";
import MiniPreview, { seeded } from "./MiniPreview";
import { KIND_LABEL, addChartEntrance } from "./chartAnim";
import type { PreviewKind } from "./data";

export type DetailApp = { name: string; icon: LucideIcon; color: string; preview: PreviewKind };

type Kpi = { l: string; v: string; d?: string };
const f1 = (n: number) => n.toFixed(1);

/** Three illustrative figures per chart type, seeded by app name so they never change between visits. */
function kpis(kind: PreviewKind, name: string): Kpi[] {
  const r = seeded(name + "#kpi");
  switch (kind) {
    case "bars":
      return [
        { l: "Latest quarter", v: `${f1(0.8 + r() * 2.2)} Mn sq ft` },
        { l: "QoQ change", v: `+${f1(3 + r() * 12)}%`, d: "up" },
        { l: "5-yr average", v: `${f1(0.6 + r() * 1.6)} Mn sq ft` },
      ];
    case "stack":
      return [
        { l: "Under construction", v: `${f1(4 + r() * 12)} Mn sq ft` },
        { l: "Completed YTD", v: `${f1(1 + r() * 5)} Mn sq ft` },
        { l: "Pre-committed", v: `${Math.round(30 + r() * 40)}%` },
      ];
    case "line":
      return [
        { l: "Current index", v: f1(100 + r() * 60) },
        { l: "Year on year", v: `+${f1(2 + r() * 9)}%`, d: "up" },
        { l: "5-yr CAGR", v: `${f1(3 + r() * 6)}%` },
      ];
    case "forecast":
      return [
        { l: "Y1 outlook", v: `+${f1(2 + r() * 4)}%`, d: "up" },
        { l: "Y3 outlook", v: `+${f1(7 + r() * 8)}%`, d: "up" },
        { l: "Y5 outlook", v: `+${f1(14 + r() * 12)}%`, d: "up" },
      ];
    case "heat":
      return [
        { l: "Hotspots", v: `${Math.round(3 + r() * 6)} submarkets` },
        { l: "Tightest", v: `${f1(4 + r() * 6)}% vacancy` },
        { l: "Spread", v: `${f1(8 + r() * 14)} pp` },
      ];
    case "donut": {
      const a = Math.round(40 + r() * 15);
      const b = Math.round(18 + r() * 10);
      return [
        { l: "Top segment", v: `${a}%` },
        { l: "Second", v: `${b}%` },
        { l: "Everything else", v: `${100 - a - b}%` },
      ];
    }
    case "gauge":
      return [
        { l: "Score", v: `${Math.round(55 + r() * 35)} / 100` },
        { l: "Percentile", v: `${Math.round(60 + r() * 35)}th` },
        { l: "Trend", v: r() > 0.4 ? "Improving" : "Stable", d: "up" },
      ];
  }
}

/**
 * Larger preview of one dock app. It grows out of the tile that opened it (clip-path from the tile's
 * box to the whole grid), plays the chart entrance, and shrinks back into the tile on close (× or Esc).
 */
export default function DockDetail({
  app,
  origin,
  category,
  onClose,
}: {
  app: DetailApp;
  origin: HTMLElement;
  category: string;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const Icon = app.icon;

  /** clip-path that frames exactly the origin tile inside this panel's box */
  const tileInset = () => {
    const p = root.current!.getBoundingClientRect();
    const o = origin.getBoundingClientRect();
    const px = (n: number) => `${Math.max(0, Math.round(n))}px`;
    return `inset(${px(o.top - p.top)} ${px(p.right - o.right)} ${px(p.bottom - o.bottom)} ${px(o.left - p.left)} round 16px)`;
  };

  useGSAP(
    () => {
      const focusClose = () => closeBtn.current?.focus({ preventScroll: true });
      if (prefersReducedMotion()) return focusClose();
      const q = gsap.utils.selector(root);
      const t = gsap.timeline({ defaults: { ease: "expo.out" } });
      t.fromTo(root.current, { clipPath: tileInset() }, { clipPath: "inset(0px 0px 0px 0px round 26px)", duration: 0.7, ease: "expo.inOut" }, 0)
        .from(q("[data-in]"), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.05 }, 0.3);
      addChartEntrance(t, q, 0.4);
      // focus only once the header is visible: hidden (autoAlpha 0) elements drop focus
      t.call(focusClose, [], 0.75);
    },
    { scope: root },
  );

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const done = () => {
      onClose();
      origin.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return done();
    const q = gsap.utils.selector(root);
    gsap
      .timeline({ onComplete: done })
      .to(q("[data-in]"), { autoAlpha: 0, duration: 0.18 }, 0)
      .to(root.current, { clipPath: tileInset(), duration: 0.5, ease: "expo.inOut" }, 0.05);
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={root}
      role="dialog"
      aria-label={`${app.name} preview`}
      className="absolute inset-0 z-10 flex flex-col rounded-[26px] border border-line bg-surface px-4 pb-4 pt-9 sm:px-6 sm:pb-5 sm:pt-10"
      style={{ ["--tile" as string]: app.color }}
    >
      <div data-in className="flex items-center gap-3">
        <span className="flex shrink-0 flex-col items-center gap-1.5">
          <Icon className="h-6 w-6 text-ink" strokeWidth={1.6} />
          <span className="h-0.75 w-6 rounded-full" style={{ background: app.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-semibold tracking-tight sm:text-[17px]">{app.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
            <span className="whitespace-nowrap">
              {category} · {KIND_LABEL[app.preview]}
            </span>
            <span className="whitespace-nowrap rounded bg-amber-100 px-1.5 py-px font-sans text-[10px] font-medium normal-case tracking-normal text-amber-800">Illustrative data</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            close();
            scrollToId("platform");
          }}
          className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12.5px] font-medium text-surface transition-colors hover:bg-ink/80 sm:flex"
        >
          Open in dashboard <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          ref={closeBtn}
          type="button"
          onClick={close}
          aria-label="Close preview"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] sm:gap-4">
        <div data-in className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:content-between sm:gap-0">
          {kpis(app.preview, app.name).map((k) => (
            <div key={k.l} className="rounded-xl border border-line px-2.5 py-2 sm:rounded-none sm:border-0 sm:border-b sm:px-0 sm:py-1 sm:last:border-b-0">
              <div className="truncate text-[10.5px] text-muted sm:text-[11px]">{k.l}</div>
              <div className={`truncate text-[14px] font-semibold tracking-tight sm:text-[16px] ${k.d === "up" ? "text-emerald-600" : ""}`}>{k.v}</div>
            </div>
          ))}
        </div>
        <div
          data-in
          className="min-h-30 rounded-2xl p-3 sm:min-h-0"
          style={{ background: `color-mix(in oklab, ${app.color} 6%, white)` }}
        >
          <MiniPreview kind={app.preview} name={app.name} color={app.color} />
        </div>
      </div>
    </div>
  );
}
