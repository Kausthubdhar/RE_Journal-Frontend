import type { PreviewKind } from "./data";

/**
 * Tiny illustrative chart for a dock app tile. Values come from a PRNG seeded by the app name, so a
 * tile always draws the same shape (stable across visits and identical on server and client).
 * Elements carry data-prev-* hooks so the hero can animate them when the category changes.
 */

const W = 120;
const H = 40;

function seeded(name: string) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const r2 = (n: number) => Math.round(n * 100) / 100;

/** rising random walk, stretched to fill [0.18, 0.92] so every chart uses its full height */
function walk(rand: () => number, n: number) {
  const raw: number[] = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.36) * 1;
    raw.push(v);
  }
  const lo = Math.min(...raw);
  const span = Math.max(...raw) - lo || 1;
  return raw.map((x) => 0.18 + ((x - lo) / span) * 0.74);
}
const tint = (c: string, pct: number) => `color-mix(in oklab, ${c} ${pct}%, white)`;

export default function MiniPreview({ kind, name, color }: { kind: PreviewKind; name: string; color: string }) {
  const rand = seeded(name);
  const common = { className: "h-full w-full overflow-visible", "aria-hidden": true } as const;

  if (kind === "bars" || kind === "stack") {
    const n = 9;
    const vals = walk(rand, n);
    const bw = W / n - 3;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" {...common}>
        {vals.map((v, i) => {
          const h = r2(v * H);
          const x = r2(i * (W / n) + 1.5);
          const last = i === n - 1;
          if (kind === "stack") {
            const split = r2(h * (0.45 + rand() * 0.3));
            return (
              <g key={i} data-prev-bar>
                <rect x={x} y={r2(H - h)} width={r2(bw)} height={r2(h - split)} rx="1.5" fill={tint(color, last ? 55 : 30)} />
                <rect x={x} y={r2(H - split)} width={r2(bw)} height={split} rx="1.5" fill={last ? color : tint(color, 60)} />
              </g>
            );
          }
          return <rect key={i} data-prev-bar x={x} y={r2(H - h)} width={r2(bw)} height={h} rx="1.5" fill={last ? color : tint(color, 35 + i * 5)} />;
        })}
      </svg>
    );
  }

  if (kind === "line" || kind === "forecast") {
    const n = kind === "forecast" ? 12 : 10;
    const vals = walk(rand, n);
    const pts = vals.map((v, i) => [r2((i / (n - 1)) * W), r2(H - v * (H - 4) - 2)] as const);
    const path = (ps: readonly (readonly [number, number])[]) => ps.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    if (kind === "line") {
      const area = `${path(pts)} L${W},${H} L0,${H} Z`;
      const [lx, ly] = pts[pts.length - 1];
      return (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" data-prev-draw {...common}>
          <path d={area} fill={tint(color, 18)} data-prev-fade />
          <path d={path(pts)} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" data-prev-line />
          <circle cx={lx} cy={ly} r="2.4" fill="white" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" data-prev-fade />
        </svg>
      );
    }
    // forecast: history in the app colour, then a dashed blue projection inside a widening band
    const cut = 7;
    const hist = pts.slice(0, cut + 1);
    const fc = pts.slice(cut);
    const up = fc.map(([x, y], i) => `${x},${r2(y - i * 2.2)}`);
    const dn = fc.map(([x, y], i) => `${x},${r2(y + i * 2.2)}`).reverse();
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" data-prev-draw {...common}>
        <path d={`M${up.join(" L")} L${dn.join(" L")} Z`} fill="#2448ff" fillOpacity="0.14" data-prev-fade />
        <line x1={hist[cut][0]} x2={hist[cut][0]} y1="0" y2={H} stroke={color} strokeOpacity="0.2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <path d={path(hist)} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" data-prev-line />
        <path d={path(fc)} fill="none" stroke="#2448ff" strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" vectorEffect="non-scaling-stroke" data-prev-fade />
      </svg>
    );
  }

  if (kind === "heat") {
    const cols = 12;
    const rows = 4;
    const cw = W / cols;
    const ch = H / rows;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" {...common}>
        {Array.from({ length: rows * cols }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const v = 0.12 + ((Math.sin(c * 0.8 + r * 1.3 + rand() * 2) + 1) / 2) * 0.8;
          return <rect key={i} data-prev-cell x={r2(c * cw + 0.8)} y={r2(r * ch + 0.8)} width={r2(cw - 1.6)} height={r2(ch - 1.6)} rx="1.2" fill={color} fillOpacity={r2(v)} />;
        })}
      </svg>
    );
  }

  if (kind === "donut") {
    const parts = [0.4 + rand() * 0.15, 0.2 + rand() * 0.1, 0.12 + rand() * 0.08];
    const rest = Math.max(0.08, 1 - parts.reduce((a, b) => a + b, 0));
    const all = [...parts, rest];
    const shades = [color, tint(color, 60), tint(color, 35), "#e7e6e1"];
    let acc = 0;
    return (
      <svg viewBox="0 0 120 40" {...common}>
        <g transform="translate(20 20) rotate(-90)">
          {all.map((p, i) => {
            const seg = (
              <circle key={i} data-prev-ring r="15" fill="none" stroke={shades[i]} strokeWidth="7" pathLength={100} strokeDasharray={`${r2(p * 100 - 1.5)} 100`} strokeDashoffset={r2(-acc * 100)} />
            );
            acc += p;
            return seg;
          })}
        </g>
        {all.slice(0, 3).map((p, i) => (
          <g key={i} transform={`translate(48 ${8 + i * 12})`} data-prev-fade>
            <rect width="7" height="7" rx="2" fill={shades[i]} />
            <rect x="12" y="1.5" width={r2(20 + p * 90)} height="4" rx="2" fill="#0e0f10" fillOpacity="0.1" />
          </g>
        ))}
      </svg>
    );
  }

  // gauge
  const v = 0.35 + rand() * 0.5;
  const arc = "M8,36 A28,28 0 0 1 64,36";
  const ang = Math.PI * (1 - v);
  return (
    <svg viewBox="0 0 120 40" {...common}>
      <path d={arc} fill="none" stroke="#e7e6e1" strokeWidth="6" strokeLinecap="round" />
      <path d={arc} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" pathLength={100} strokeDasharray={`${r2(v * 100)} 100`} data-prev-gauge />
      <line x1="36" y1="36" x2={r2(36 + Math.cos(ang) * 20)} y2={r2(36 - Math.sin(ang) * 20)} stroke="#0e0f10" strokeWidth="2" strokeLinecap="round" data-prev-needle />
      <circle cx="36" cy="36" r="3" fill="#0e0f10" />
      <g transform="translate(76 12)" data-prev-fade>
        <rect width="36" height="5" rx="2.5" fill="#0e0f10" fillOpacity="0.12" />
        <rect y="11" width="26" height="5" rx="2.5" fill={tint(color, 50)} />
        <rect y="22" width="31" height="5" rx="2.5" fill="#0e0f10" fillOpacity="0.08" />
      </g>
    </svg>
  );
}
