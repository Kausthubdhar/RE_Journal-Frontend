import { gsap } from "@/lib/gsap";
import type { PreviewKind } from "./data";

export const KIND_LABEL: Record<PreviewKind, string> = {
  bars: "Bar chart",
  stack: "Stacked bars",
  line: "Trend line",
  heat: "Heatmap",
  donut: "Share mix",
  gauge: "Score gauge",
  forecast: "Forecast",
};

/**
 * Adds a MiniPreview's own entrance to a timeline: bars grow, lines draw, heat cells ripple from the
 * centre, donut segments sweep, the gauge fills and its needle swings, extras fade in.
 * `q` is a gsap selector scoped to the element that contains the chart.
 */
export function addChartEntrance(t: gsap.core.Timeline, q: (s: string) => Element[], at: number) {
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
  return t;
}
