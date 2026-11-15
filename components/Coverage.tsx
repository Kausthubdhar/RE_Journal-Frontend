"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, reveal, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";

// Simplified outline of India (lon, lat), only used to place a soft dot matrix.
const OUTLINE: [number, number][] = [
  [68.2, 23.6], [69.1, 22.4], [70.4, 20.9], [72.6, 21.2], [72.8, 19.0], [73.4, 16.6], [74.1, 14.8],
  [74.8, 12.9], [75.7, 11.3], [76.3, 9.6], [77.5, 8.1], [78.2, 8.9], [79.3, 10.3], [79.8, 11.6],
  [80.3, 13.1], [80.1, 15.4], [81.3, 16.4], [82.3, 16.7], [83.3, 17.7], [84.8, 19.3], [86.5, 20.3],
  [87.0, 21.5], [88.2, 21.6], [89.0, 21.9], [88.8, 23.0], [88.2, 24.5], [88.4, 25.5], [88.2, 26.2],
  [89.8, 25.9], [90.2, 25.2], [92.0, 25.0], [92.3, 23.4], [92.7, 21.9], [93.4, 22.0], [94.2, 23.9],
  [94.7, 25.4], [95.4, 26.6], [96.8, 27.3], [97.3, 28.2], [96.0, 29.3], [94.0, 28.9], [92.0, 27.8],
  [89.8, 26.8], [88.8, 27.2], [88.1, 27.9], [88.0, 26.5], [85.9, 26.6], [84.0, 27.4], [83.3, 27.3],
  [81.1, 28.5], [80.1, 28.9], [80.6, 30.1], [79.0, 31.1], [78.7, 32.4], [79.5, 33.2], [79.6, 34.6],
  [78.0, 35.4], [76.0, 35.6], [74.6, 34.8], [74.0, 33.7], [74.6, 32.5], [75.3, 32.2], [74.6, 31.0],
  [73.9, 30.0], [73.3, 29.0], [72.3, 28.0], [70.7, 27.8], [69.6, 26.6], [70.1, 25.4], [71.0, 24.4],
  [69.6, 24.3], [68.8, 24.2],
];

const MARKETS = [
  { name: "Mumbai", lon: 72.88, lat: 19.08, hq: true },
  { name: "Pune", lon: 73.86, lat: 18.52 },
  { name: "Bengaluru", lon: 77.59, lat: 12.97 },
  { name: "Chennai", lon: 80.27, lat: 13.08 },
  { name: "Hyderabad", lon: 78.49, lat: 17.39 },
  { name: "Delhi NCR", lon: 77.1, lat: 28.6 },
  { name: "Kolkata", lon: 88.36, lat: 22.57 },
];

const K = 10;
const px = (lon: number) => (lon - 67.5) * K;
const py = (lat: number) => (37 - lat) * K * 1.06;

function inside(lon: number, lat: number) {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Dot matrix pre-built as 3 SVG paths (one per tone) instead of ~1,000 <circle> nodes. */
const DOT_LAYERS = (() => {
  const layers = { near: "", mid: "", far: "" };
  const dot = (x: number, y: number, r: number) => `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
  const step = 0.62;
  for (let lat = 37; lat > 6; lat -= step)
    for (let lon = 67.8; lon < 98; lon += step) {
      if (!inside(lon, lat)) continue;
      const d = Math.min(...MARKETS.map((m) => Math.hypot(m.lon - lon, m.lat - lat)));
      if (d < 1.6) layers.near += dot(px(lon), py(lat), 1.9);
      else if (d < 3.5) layers.mid += dot(px(lon), py(lat), 1.45);
      else layers.far += dot(px(lon), py(lat), 1.45);
    }
  return layers;
})();

export default function Coverage() {
  const root = useRef<HTMLElement>(null);
  const [hot, setHot] = useState<string | null>(null);

  const hq = MARKETS[0];

  useGSAP(
    () => {
      gsap.fromTo("[data-reveal]", { attr: { r: 0 } }, {
        attr: { r: 260 },
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-map]", start: "top 75%" },
      });
      gsap.utils.toArray<SVGPathElement>("[data-arc]").forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: 0.6 + i * 0.12, scrollTrigger: { trigger: "[data-map]", start: "top 70%" } },
        );
      });
      gsap.from("[data-node]", {
        scale: 0,
        transformOrigin: "center",
        duration: 0.8,
        ease: "back.out(3)",
        stagger: 0.1,
        delay: 1,
        scrollTrigger: { trigger: "[data-map]", start: "top 70%" },
      });
      reveal("[data-market]", "[data-markets]", { x: -30, y: 0, duration: 0.9, stagger: 0.07 }, "top 80%");
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative py-28 sm:py-40">
      <div className="mx-auto grid max-w-310 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading eyebrow="Strategic market coverage" title="In-depth analysis of" accent="key markets">
            Our analysts cover India&apos;s most dynamic real estate markets, from established business districts to emerging hotspots, across commercial, residential and industrial real estate.
          </SectionHeading>

          <ul data-markets className="mt-10 border-t border-line">
            {MARKETS.map((m) => (
              <li
                key={m.name}
                data-market
                onPointerEnter={() => setHot(m.name)}
                onPointerLeave={() => setHot(null)}
                onFocus={() => setHot(m.name)}
                onBlur={() => setHot(null)}
                tabIndex={0}
                aria-label={`${m.name}${m.hq ? " (headquarters)" : ""}, highlight on map`}
                className={`group flex cursor-default items-center justify-between border-b border-line py-3.5 transition-colors ${hot === m.name ? "text-ink" : "text-ink-2"}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full transition-all ${hot === m.name ? "scale-150 bg-accent" : "bg-black/25"}`} />
                  <span className="text-[18px] font-medium tracking-tight">{m.name}</span>
                  {m.hq && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">HQ</span>}
                </span>
                <span className="font-mono text-[12px] text-muted">
                  {m.lat.toFixed(2)}° N · {m.lon.toFixed(2)}° E
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-muted">…and 20+ cities across the country.</p>
        </div>

        <div data-map className="relative">
          <div className="absolute -inset-6 rounded-[40px] bg-linear-to-b from-white to-transparent" />
          <svg viewBox="0 0 310 340" className="relative w-full" role="img" aria-label="Map of India showing RE Journal's key markets, connected to the Mumbai headquarters">
            <defs>
              <radialGradient id="glow">
                <stop offset="0" stopColor="#2448ff" stopOpacity="0.25" />
                <stop offset="1" stopColor="#2448ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <mask id="map-reveal">
              <circle data-reveal cx="130" cy="190" r="260" fill="#fff" />
            </mask>
            <g mask="url(#map-reveal)">
              <path d={DOT_LAYERS.far} fill="#0e0f10" opacity="0.12" />
              <path d={DOT_LAYERS.mid} fill="#0e0f10" opacity="0.22" />
              <path d={DOT_LAYERS.near} fill="#2448ff" opacity="0.55" />
            </g>
            {MARKETS.slice(1).map((m) => {
              const x1 = px(hq.lon), y1 = py(hq.lat), x2 = px(m.lon), y2 = py(m.lat);
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.28;
              return (
                <path
                  key={m.name}
                  data-arc
                  d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                  fill="none"
                  stroke={hot === m.name ? "#2448ff" : "#0e0f10"}
                  strokeOpacity={hot === m.name ? 0.9 : 0.25}
                  strokeWidth={hot === m.name ? 1.3 : 0.8}
                  className="transition-all duration-300"
                />
              );
            })}
            {MARKETS.map((m) => {
              const x = px(m.lon), y = py(m.lat);
              const on = hot === m.name;
              return (
                <g key={m.name} data-node onPointerEnter={() => setHot(m.name)} onPointerLeave={() => setHot(null)} className="cursor-pointer">
                  <circle cx={x} cy={y} r="14" fill="url(#glow)" />
                  <circle cx={x} cy={y} r="3.2" fill="#2448ff" className="ping-soft" />
                  <circle cx={x} cy={y} r={on ? 4.6 : 3.4} fill="#fff" stroke="#2448ff" strokeWidth="2" className="transition-all" />
                  <g className={`transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}>
                    <rect x={x + 8} y={y - 11} width={m.name.length * 5.6 + 14} height="20" rx="6" fill="#0e0f10" />
                    <text x={x + 15} y={y + 3} fontSize="9.5" fill="#fff" fontWeight="500">{m.name}</text>
                  </g>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-2 right-0 flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-accent" /> Pan-India coverage
            <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
