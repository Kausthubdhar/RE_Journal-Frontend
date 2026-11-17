/**
 * Tiny isometric SVG renderer for the product cards: a scene is a list of boxes (x, y = footprint,
 * z = base height, w × d × h = size) drawn back-to-front with three shaded faces and window bands.
 * Each box group carries data-sky so the cards' scroll animation can grow it from its base.
 */

type Box = {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  /** window style on the side faces */
  win?: "bands" | "grid" | "doors" | "none";
  /** pitched (pyramid) roof height */
  roof?: number;
  /** tint: 0 = product colour, 1 = light neutral (plinths, roads) */
  tone?: number;
};

export type IsoKind = "office" | "retail" | "warehousing" | "residential" | "mortgage";

const SCENES: Record<IsoKind, Box[]> = {
  office: [
    { x: -0.6, y: -0.6, w: 6.4, d: 6.4, h: 0.25, tone: 1, win: "none" },
    { x: 0, y: 0, w: 2, d: 2, h: 9, win: "bands" },
    { x: 2.9, y: 0.3, w: 2.1, d: 1.9, h: 12.5, win: "bands" },
    { x: 0.2, y: 3, w: 1.9, d: 2.1, h: 6, win: "bands" },
    { x: 3.1, y: 3.1, w: 1.8, d: 1.8, h: 7.5, win: "bands" },
  ],
  retail: [
    { x: -0.6, y: -0.6, w: 8.2, d: 5.6, h: 0.25, tone: 1, win: "none" },
    { x: 0, y: 0, w: 7, d: 4.4, h: 2.4, win: "doors" },
    { x: 0, y: 0, w: 2.4, d: 4.4, h: 3.6, win: "grid" },
    { x: 3, y: 0.6, w: 3, d: 3.2, z: 2.4, h: 0.9, win: "bands" },
    { x: 5.4, y: 3.3, w: 1.6, d: 1.1, z: 2.4, h: 0.5, tone: 1, win: "none" },
  ],
  warehousing: [
    { x: -0.6, y: -0.6, w: 8.6, d: 7.4, h: 0.2, tone: 1, win: "none" },
    { x: 0, y: 0, w: 7.4, d: 2.6, h: 2, win: "doors" },
    { x: 0, y: 3.6, w: 7.4, d: 2.6, h: 2, win: "doors" },
    { x: 1, y: 6.5, w: 1.3, d: 0.7, h: 0.7, tone: 1, win: "none" },
    { x: 3.6, y: 6.5, w: 1.3, d: 0.7, h: 0.7, tone: 1, win: "none" },
  ],
  residential: [
    { x: -0.6, y: -0.6, w: 7.8, d: 6.8, h: 0.25, tone: 1, win: "none" },
    { x: 0, y: 0, w: 1.9, d: 1.9, h: 7, win: "grid" },
    { x: 2.5, y: 0, w: 1.9, d: 1.9, h: 9.5, win: "grid" },
    { x: 0, y: 2.6, w: 1.9, d: 1.9, h: 5, win: "grid" },
    { x: 4.8, y: 2.8, w: 1.6, d: 1.6, h: 1.4, roof: 1.1, win: "grid" },
    { x: 2.7, y: 3.6, w: 1.6, d: 1.6, h: 1.4, roof: 1.1, win: "grid" },
    { x: 4.9, y: 0.4, w: 1.5, d: 1.5, h: 1.3, roof: 1, win: "grid" },
  ],
  mortgage: [
    { x: -0.6, y: -0.6, w: 8.4, d: 3.2, h: 0.2, tone: 1, win: "none" },
    ...[2, 3.4, 5, 7, 9.6].flatMap((h, i) =>
      Array.from({ length: Math.round(h / 0.62) }, (_, k) => ({ x: i * 1.55, y: 0.2, z: k * 0.62, w: 1.2, d: 1.6, h: 0.5, win: "none" as const })),
    ),
  ],
};

const C30 = Math.cos(Math.PI / 6);
const S30 = 0.5;
const S = 10; // px per unit
const P = (x: number, y: number, z: number): [number, number] => [(x - y) * C30 * S, ((x + y) * S30 - z) * S];
const pts = (...p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function mix(hex: string, to: string, t: number) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

function renderBox(b: Box, ink: string, i: number) {
  const z0 = b.z ?? 0;
  const z1 = z0 + b.h;
  const { x, y, w, d } = b;
  // colours mix with the page surface, so they stay pastel in light mode and dim to dusk in dark mode
  const onSurface = (t: number) => `color-mix(in srgb, ${ink} ${Math.round((1 - t) * 100)}%, var(--surface))`;
  const base = b.tone ? "var(--iso-plinth)" : onSurface(0.55);
  const top = b.tone ? "var(--iso-plinth-top)" : onSurface(0.78);
  const left = base;
  const right = b.tone ? "var(--iso-plinth-side)" : onSurface(0.32);
  const glass = mix(ink, "#000000", 0.15);

  // side faces: left = the y+d face, right = the x+w face
  const L = (u: number, v: number) => P(x + u * w, y + d, z0 + v * b.h);
  const R = (u: number, v: number) => P(x + w, y + d - u * d, z0 + v * b.h);
  const windows: React.ReactNode[] = [];
  const win = b.win ?? "none";
  if (win !== "none" && b.h > 0.6) {
    const faces = [
      { f: L, len: w, shade: 0.5 },
      { f: R, len: d, shade: 0.7 },
    ];
    faces.forEach(({ f, len, shade }, fi) => {
      if (win === "bands") {
        const floors = Math.floor(b.h / 0.7);
        for (let k = 0; k < floors; k++) {
          const v0 = (k * 0.7 + 0.22) / b.h;
          const v1 = (k * 0.7 + 0.5) / b.h;
          windows.push(<polygon key={`${fi}b${k}`} points={pts(f(0.08, v0), f(0.92, v0), f(0.92, v1), f(0.08, v1))} fill={glass} opacity={shade * 0.55} />);
        }
      } else if (win === "grid") {
        const floors = Math.max(1, Math.floor(b.h / 0.9));
        const cols = Math.max(1, Math.round(len / 0.6));
        for (let k = 0; k < floors; k++)
          for (let c = 0; c < cols; c++) {
            const u0 = (c + 0.3) / cols;
            const u1 = (c + 0.7) / cols;
            const v0 = (k * 0.9 + 0.3) / b.h;
            const v1 = (k * 0.9 + 0.65) / b.h;
            windows.push(<polygon key={`${fi}g${k}-${c}`} points={pts(f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1))} fill={glass} opacity={shade * 0.5} />);
          }
      } else if (win === "doors") {
        const n = Math.max(1, Math.round(len / 0.9));
        for (let c = 0; c < n; c++) {
          const u0 = (c + 0.2) / n;
          const u1 = (c + 0.8) / n;
          windows.push(<polygon key={`${fi}d${c}`} points={pts(f(u0, 0), f(u1, 0), f(u1, 0.55), f(u0, 0.55))} fill={glass} opacity={shade * 0.45} />);
        }
      }
    });
  }

  const roof =
    b.roof &&
    (() => {
      const apex = P(x + w / 2, y + d / 2, z1 + b.roof);
      return (
        <>
          <polygon points={pts(P(x, y + d, z1), P(x + w, y + d, z1), apex)} fill={mix(ink, "#000000", 0.05)} />
          <polygon points={pts(P(x + w, y + d, z1), P(x + w, y, z1), apex)} fill={mix(ink, "#000000", 0.25)} />
        </>
      );
    })();

  return (
    <g key={i} data-sky>
      <polygon points={pts(P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, z1), P(x, y + d, z1))} fill={left} />
      <polygon points={pts(P(x + w, y + d, z0), P(x + w, y, z0), P(x + w, y, z1), P(x + w, y + d, z1))} fill={right} />
      {!b.roof && <polygon points={pts(P(x, y, z1), P(x + w, y, z1), P(x + w, y + d, z1), P(x, y + d, z1))} fill={top} />}
      {windows}
      {roof}
    </g>
  );
}

export default function IsoScene({ kind, ink }: { kind: IsoKind; ink: string }) {
  // back-to-front: further boxes (smaller x + y) first, lower ones first
  const boxes = [...SCENES[kind]].sort((a, b) => a.x + a.y - (b.x + b.y) || (a.z ?? 0) - (b.z ?? 0));

  // frame the scene: bounding box of every projected corner
  const xs: number[] = [];
  const ys: number[] = [];
  for (const b of boxes) {
    const z1 = (b.z ?? 0) + b.h + (b.roof ?? 0);
    for (const [px, py] of [P(b.x, b.y, z1), P(b.x + b.w, b.y, b.z ?? 0), P(b.x, b.y + b.d, b.z ?? 0), P(b.x + b.w, b.y + b.d, b.z ?? 0)]) {
      xs.push(px);
      ys.push(py);
    }
  }
  const pad = 4;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const vb = `${minX.toFixed(1)} ${minY.toFixed(1)} ${(Math.max(...xs) - minX + pad).toFixed(1)} ${(Math.max(...ys) - minY + pad).toFixed(1)}`;

  return (
    <svg viewBox={vb} className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden>
      {boxes.map((b, i) => renderBox(b, ink, i))}
    </svg>
  );
}
