"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/gsap";
import type { SceneKey } from "./data";

/*
 * Performance notes
 * - Every facade kind has ONE shared texture + material; per-building variation lives in the UVs.
 * - Box facades are drawn in 2 draw calls (sides + roof) instead of 6.
 * - Repeated parts (balconies, coin stacks) are merged; trees are a single InstancedMesh pair.
 * - Shadows are only re-rendered while buildings animate, and the canvas only redraws when
 *   something actually changes (camera, transition or a spinning prop).
 * - Pixel ratio is capped and lowered automatically on slow GPUs.
 */

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shared = <T extends { userData: Record<string, unknown> }>(o: T) => {
  o.userData.shared = true;
  return o;
};

type TexKind = "glass" | "concrete" | "residential" | "storefront" | "corrugated" | "house";

type Facade = {
  map: THREE.CanvasTexture;
  em: THREE.CanvasTexture | null;
  tileW: number;
  tileH: number;
  cols: number;
  rows: number;
  emissive: string;
  intensity: number;
  rough: number;
  metal: number;
};

function gridTex(o: { frame: string; glass: string[]; lit: string; litChance: number; cols: number; rows: number; seed: number; gx: number; gy: number }) {
  const S = 256;
  const c = document.createElement("canvas");
  const e = document.createElement("canvas");
  c.width = c.height = e.width = e.height = S;
  const cx = c.getContext("2d")!;
  const ex = e.getContext("2d")!;
  cx.fillStyle = o.frame;
  cx.fillRect(0, 0, S, S);
  ex.fillStyle = "#000";
  ex.fillRect(0, 0, S, S);
  const r = rng(o.seed);
  const cw = S / o.cols;
  const rh = S / o.rows;
  let anyLit = false;
  for (let y = 0; y < o.rows; y++)
    for (let x = 0; x < o.cols; x++) {
      const lit = r() < o.litChance;
      const px = x * cw + (o.gx * cw) / 2;
      const py = y * rh + (o.gy * rh) / 2;
      const w = cw * (1 - o.gx);
      const h = rh * (1 - o.gy);
      cx.fillStyle = lit ? o.lit : o.glass[Math.floor(r() * o.glass.length)];
      cx.fillRect(px, py, w, h);
      if (lit) {
        anyLit = true;
        ex.fillStyle = o.lit;
        ex.fillRect(px, py, w, h);
      } else {
        cx.fillStyle = "rgba(255,255,255,0.10)";
        cx.fillRect(px, py, w * 0.35, h);
      }
    }
  const map = new THREE.CanvasTexture(c);
  const em = anyLit ? new THREE.CanvasTexture(e) : null;
  for (const t of [map, em]) {
    if (!t) continue;
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
  }
  return { map, em };
}

function makeFacades(): Record<TexKind, Facade> {
  const f = (
    tex: Parameters<typeof gridTex>[0],
    rest: Omit<Facade, "map" | "em" | "cols" | "rows" | "tileW" | "tileH"> & { cellW: number; cellH: number },
  ): Facade => ({
    ...gridTex(tex),
    cols: tex.cols,
    rows: tex.rows,
    tileW: tex.cols * rest.cellW,
    tileH: tex.rows * rest.cellH,
    emissive: rest.emissive,
    intensity: rest.intensity,
    rough: rest.rough,
    metal: rest.metal,
  });
  return {
    glass: f({ frame: "#c4cad3", glass: ["#566b82", "#61768c", "#4d6178"], lit: "#ffd59a", litChance: 0.24, cols: 8, rows: 8, seed: 3, gx: 0.12, gy: 0.2 }, { cellW: 0.55, cellH: 0.5, emissive: "#ffc477", intensity: 0.95, rough: 0.3, metal: 0.45 }),
    concrete: f({ frame: "#e6e3dd", glass: ["#7a8590", "#86909a"], lit: "#ffd7a1", litChance: 0.2, cols: 8, rows: 8, seed: 7, gx: 0.42, gy: 0.42 }, { cellW: 0.7, cellH: 0.55, emissive: "#ffc98a", intensity: 0.9, rough: 0.85, metal: 0 }),
    residential: f({ frame: "#eee8de", glass: ["#85919d", "#7b8793"], lit: "#ffcf8f", litChance: 0.32, cols: 6, rows: 8, seed: 11, gx: 0.5, gy: 0.45 }, { cellW: 0.6, cellH: 0.5, emissive: "#ffbf73", intensity: 0.9, rough: 0.85, metal: 0 }),
    storefront: f({ frame: "#e9e6e0", glass: ["#6f8090"], lit: "#ffe2b5", litChance: 0.85, cols: 4, rows: 1, seed: 5, gx: 0.1, gy: 0.3 }, { cellW: 1.4, cellH: 1.7, emissive: "#ffd39a", intensity: 1.1, rough: 0.5, metal: 0.1 }),
    corrugated: f({ frame: "#b9bfc8", glass: ["#a7aeb8"], lit: "#fff", litChance: 0, cols: 32, rows: 1, seed: 1, gx: 0.5, gy: 0 }, { cellW: 0.13, cellH: 4, emissive: "#000", intensity: 0, rough: 0.55, metal: 0.35 }),
    house: f({ frame: "#ffffff", glass: ["#7d8a97"], lit: "#ffd29a", litChance: 0.45, cols: 4, rows: 2, seed: 9, gx: 0.55, gy: 0.5 }, { cellW: 0.55, cellH: 0.75, emissive: "#ffc27c", intensity: 0.9, rough: 0.9, metal: 0 }),
  };
}

function makeMats() {
  const m = (p: THREE.MeshStandardMaterialParameters) => shared(new THREE.MeshStandardMaterial(p));
  return {
    roof: m({ color: "#c9ccd1", roughness: 0.9 }),
    roofUnit: m({ color: "#aeb3ba", roughness: 0.7, metalness: 0.2 }),
    white: m({ color: "#f4f2ee", roughness: 0.8 }),
    dark: m({ color: "#3a3f46", roughness: 0.7 }),
    crane: m({ color: "#e9a23b", roughness: 0.6, metalness: 0.2 }),
    trunk: m({ color: "#8a6b4f", roughness: 1 }),
    leaf: m({ color: "#ffffff", roughness: 1, flatShading: true }),
    gold: m({ color: "#e2b04a", roughness: 0.28, metalness: 0.9 }),
    glassClear: shared(new THREE.MeshPhysicalMaterial({ color: "#b6cfe0", roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.55 })),
    water: m({ color: "#7cc6da", roughness: 0.15, metalness: 0.1 }),
    deck: m({ color: "#e7dfd1", roughness: 1 }),
    terracotta: m({ color: "#b8624a", roughness: 0.9 }),
    slate: m({ color: "#5c6470", roughness: 0.85 }),
  };
}
type Mats = ReturnType<typeof makeMats>;

/** Cache of materials that are created lazily but shared across scenes. */
class MatCache {
  private map = new Map<string, THREE.Material>();
  constructor(private facades: Record<TexKind, Facade>) {}
  facade(kind: TexKind, color = "#ffffff") {
    const key = `f:${kind}:${color}`;
    let m = this.map.get(key);
    if (!m) {
      const t = this.facades[kind];
      m = shared(
        new THREE.MeshStandardMaterial({
          map: t.map,
          color,
          emissiveMap: t.em,
          emissive: t.em ? new THREE.Color(t.emissive) : new THREE.Color("#000"),
          emissiveIntensity: t.intensity,
          roughness: t.rough,
          metalness: t.metal,
        }),
      );
      this.map.set(key, m);
    }
    return m;
  }
  paint(color: string, rough = 0.6, metal = 0.2) {
    const key = `p:${color}:${rough}:${metal}`;
    let m = this.map.get(key);
    if (!m) {
      m = shared(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
      this.map.set(key, m);
    }
    return m;
  }
  dispose() {
    this.map.forEach((m) => m.dispose());
  }
}

const GEO = {
  coin: shared(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 32)),
  leaf: shared(new THREE.IcosahedronGeometry(1, 0)),
  trunk: shared(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 6).translate(0, 0.3, 0)),
};

const boxGeo = (w: number, h: number, d: number, x = 0, y = 0, z = 0) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z);

/* ------------------------------------------------------------------ */
/* builder                                                             */
/* ------------------------------------------------------------------ */

type Anim = "rise" | "pop" | "instanced";
type Spinner = (t: number) => void;

const LEAF_COLORS = [new THREE.Color("#86a06c"), new THREE.Color("#6f8f5d")];
const backOut = gsap.parseEase("back.out(2.2)");

class Builder {
  group = new THREE.Group();
  spinners: Spinner[] = [];
  private trees: { x: number; z: number; s: number; rot: number; delay: number; c: number }[] = [];
  r: () => number;

  constructor(
    public facades: Record<TexKind, Facade>,
    public mats: Mats,
    public cache: MatCache,
    seed: number,
  ) {
    this.r = rng(seed);
  }

  add<T extends THREE.Object3D>(o: T, anim: Anim = "rise") {
    o.userData.anim = anim;
    this.group.add(o);
    return o;
  }

  /** Facade box, origin at its base, 2 draw calls (walls + roof/floor). */
  block(kind: TexKind, w: number, h: number, d: number, opt: { color?: string; roof?: THREE.Material } = {}) {
    const t = this.facades[kind];
    const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const ox = Math.floor(this.r() * t.cols) / t.cols;
    const oy = Math.floor(this.r() * t.rows) / t.rows;
    // BoxGeometry faces: +x, -x, +y, -y, +z, -z (4 verts / 6 indices each)
    for (const f of [0, 1, 4, 5]) {
      const len = f < 2 ? d : w;
      for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        uv.setXY(i, uv.getX(i) * (len / t.tileW) + ox, uv.getY(i) * (h / t.tileH) + oy);
      }
    }
    const src = geo.index!.array;
    const idx = new Uint16Array(36);
    [0, 1, 4, 5, 2, 3].forEach((f, k) => idx.set(src.slice(f * 6, f * 6 + 6), k * 6));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.clearGroups();
    geo.addGroup(0, 24, 0);
    geo.addGroup(24, 12, 1);
    const mesh = new THREE.Mesh(geo, [this.cache.facade(kind, opt.color), opt.roof ?? this.mats.roof]);
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  }

  box(kind: TexKind, w: number, h: number, d: number, x: number, z: number, opt: { color?: string; roof?: THREE.Material } = {}) {
    const m = this.block(kind, w, h, d, opt);
    m.position.set(x, 0, z);
    if (h > 6) m.add(this.mesh(boxGeo(w * 0.42, 0.55, d * 0.42, 0, h, 0), this.mats.roofUnit));
    return this.add(m);
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, shadow = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  }

  solid(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    return this.mesh(boxGeo(w, h, d, x, y, z), mat);
  }

  /** Merge many small geometries that share one material into a single mesh. */
  merged(parts: THREE.BufferGeometry[], mat: THREE.Material, shadow = true) {
    const g = mergeGeometries(parts)!;
    parts.forEach((p) => p.userData.shared || p.dispose());
    return this.mesh(g, mat, shadow);
  }

  gable(w: number, rise: number, depth: number, mat: THREE.Material) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, rise);
    s.closePath();
    return this.mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2), mat);
  }

  tree(x: number, z: number, s = 1) {
    this.trees.push({ x, z, s: s * (0.8 + this.r() * 0.5), rot: this.r() * Math.PI, delay: 0, c: this.r() > 0.5 ? 1 : 0 });
  }

  car(x: number, z: number, rotY: number, color: string) {
    const mat = this.cache.paint(color, 0.4, 0.3);
    const m = this.merged([boxGeo(0.95, 0.28, 0.45), boxGeo(0.5, 0.2, 0.4, -0.05, 0.28, 0)], mat);
    m.position.set(x, 0.02, z);
    m.rotation.y = rotY;
    return this.add(m, "pop");
  }

  /** Build all trees as two instanced meshes driven by one progress value. */
  finish() {
    const n = this.trees.length;
    if (!n) return;
    const sorted = [...this.trees].sort((a, b) => a.x - b.x);
    sorted.forEach((t, i) => (t.delay = (i / n) * 0.9 + this.r() * 0.15));
    const trunk = new THREE.InstancedMesh(GEO.trunk, this.mats.trunk, n);
    const leaf = new THREE.InstancedMesh(GEO.leaf, this.mats.leaf, n);
    trunk.castShadow = leaf.castShadow = true;
    trunk.frustumCulled = leaf.frustumCulled = false;
    sorted.forEach((t, i) => leaf.setColorAt(i, LEAF_COLORS[t.c]));
    const holder = new THREE.Group();
    holder.add(trunk, leaf);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const leafLocal = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.95, 0), new THREE.Quaternion(), new THREE.Vector3(0.55, 0.7, 0.55));
    const lm = new THREE.Matrix4();
    holder.userData.setProgress = (p: number) => {
      sorted.forEach((t, i) => {
        const local = Math.min(1, Math.max(0, (p * 1.5 - t.delay) / 0.55));
        const e = Math.max(0.001, backOut(local)) * t.s;
        q.setFromAxisAngle(up, t.rot);
        m.compose(pos.set(t.x, 0, t.z), q, scl.set(e, e, e));
        trunk.setMatrixAt(i, m);
        lm.multiplyMatrices(m, leafLocal);
        leaf.setMatrixAt(i, lm);
      });
      trunk.instanceMatrix.needsUpdate = true;
      leaf.instanceMatrix.needsUpdate = true;
    };
    holder.userData.setProgress(0);
    this.add(holder, "instanced");
  }
}

/* ------------------------------------------------------------------ */
/* scenes                                                              */
/* ------------------------------------------------------------------ */

const PALETTE = ["#d0613a", "#2d5d8a", "#d9a441", "#3f7a5a", "#8b8f96", "#c95b7a"];

function office(b: Builder) {
  const towers: [number, number, number, number, number, TexKind][] = [
    [0, -1, 4, 15, 4, "glass"],
    [-5.2, 0.6, 3.4, 10.5, 3.4, "glass"],
    [5, 0, 3.2, 12.5, 3.2, "glass"],
    [-9.6, -2.4, 3.2, 7, 4, "concrete"],
    [9.6, -2.2, 3.8, 8.5, 3.2, "glass"],
    [2.8, -6.2, 4, 9, 2.8, "concrete"],
    [-3.8, -6.6, 3, 12, 3, "glass"],
    [-0.5, 5, 9, 2.2, 3, "concrete"],
    [-12.8, 3.5, 3, 4.2, 3, "concrete"],
  ];
  towers.forEach(([x, z, w, h, d, k]) => b.box(k, w, h, d, x, z));

  // crane: the rotating jib does not cast shadows, so the shadow map can stay static
  const crane = new THREE.Group();
  crane.add(b.solid(0.35, 16, 0.35, b.mats.crane));
  const pivot = new THREE.Group();
  pivot.position.y = 16;
  const jib = b.merged([boxGeo(10, 0.3, 0.35, 3, 0, 0), boxGeo(0.04, 3, 0.04, 6.5, -3, 0)], b.mats.crane, false);
  const weights = b.merged([boxGeo(1.4, 0.7, 0.7, -1.8, -0.35, 0)], b.mats.slate, false);
  const cab = b.merged([boxGeo(0.8, 0.7, 0.7, 0.2, -0.75, 0)], b.mats.white, false);
  pivot.add(jib, weights, cab);
  crane.add(pivot);
  crane.position.set(11.8, 0, 4);
  b.add(crane);
  b.spinners.push((t) => (pivot.rotation.y = 2.4 + Math.sin(t * 0.25) * 0.7));

  for (let x = -12; x <= 9; x += 2.3) b.tree(x + b.r() * 0.6, 8.2 + b.r() * 0.6, 1);
  for (let z = -6; z <= 6; z += 2.4) b.tree(-15 + b.r() * 0.5, z, 0.9);
}

function retail(b: Builder) {
  const mall = new THREE.Group();
  mall.add(b.block("storefront", 14, 1.7, 7));
  const upper = b.block("concrete", 14.4, 1.9, 7.4, { color: "#f6f2ec" });
  upper.position.y = 1.7;
  mall.add(upper);
  const atrium = b.mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.6, 32).translate(0, 4.4, 0), b.mats.glassClear, false);
  const dome = b.mesh(new THREE.SphereGeometry(2.1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 5.2, 0), b.mats.glassClear, false);
  mall.add(atrium, dome);
  for (let i = 0; i < 6; i++) mall.add(b.solid(1.8, 0.12, 0.8, b.cache.paint(PALETTE[i], 0.8, 0), -5.5 + i * 2.2, 1.65, 3.9));
  b.add(mall);

  b.box("concrete", 5, 6, 5, -10.8, -1.5, { color: "#f1ece4" });
  b.box("glass", 4.4, 8.5, 4, 10.6, -2);
  const shopColors = ["#f3e3d3", "#e5ecef", "#f2ead8", "#e9dfe8"];
  for (let i = 0; i < 7; i++) {
    const h = 2.2 + b.r() * 1.8;
    const sh = b.box("house", 2.1, h, 2.2, -8 + i * 2.4, -7.2, { color: shopColors[i % 4] });
    const roof = b.gable(2.3, 0.6, 2.3, b.mats.terracotta);
    roof.position.y = h;
    sh.add(roof);
  }

  // parking lot
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const x = c.getContext("2d")!;
  x.fillStyle = "#a7abb1";
  x.fillRect(0, 0, 512, 128);
  x.strokeStyle = "#f4f4f4";
  x.lineWidth = 3;
  for (let i = 0; i <= 512; i += 32) {
    x.beginPath();
    x.moveTo(i, 4);
    x.lineTo(i, 50);
    x.moveTo(i, 78);
    x.lineTo(i, 124);
    x.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(15, 4.4), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(0, 0.01, 6.4);
  lot.receiveShadow = true;
  b.add(lot, "pop");
  for (let i = 0; i < 16; i++) {
    if (b.r() < 0.35) continue;
    b.car(-6.6 + Math.floor(i / 2) * 1.88, i % 2 ? 7.6 : 5.2, Math.PI / 2, PALETTE[Math.floor(b.r() * PALETTE.length)]);
  }
  for (let x2 = -12; x2 <= 12; x2 += 3) b.tree(x2, 9.4, 1);
  for (let z = -4; z <= 6; z += 2.5) b.tree(14.2, z, 0.9);
}

function warehousing(b: Builder) {
  const shed = (x: number, z: number, w: number, h: number, d: number) => {
    const g = new THREE.Group();
    g.add(b.block("corrugated", w, h, d));
    const roof = b.gable(w + 0.2, 0.9, d + 0.2, b.mats.roof);
    roof.position.y = h;
    g.add(roof);
    const doors: THREE.BufferGeometry[] = [];
    const canopies: THREE.BufferGeometry[] = [];
    const n = Math.floor(w / 1.7);
    for (let i = 0; i < n; i++) {
      const dx = -w / 2 + 1 + i * ((w - 2) / Math.max(1, n - 1));
      doors.push(boxGeo(1.05, 1.5, 0.08, dx, 0, d / 2 + 0.04));
      canopies.push(boxGeo(1.3, 0.08, 0.7, dx, 1.75, d / 2 + 0.35));
    }
    g.add(b.merged(doors, b.mats.dark, false), b.merged(canopies, b.mats.white));
    g.position.set(x, 0, z);
    return b.add(g);
  };
  shed(-3, -2.2, 12, 3.6, 6);
  shed(8.6, -3.6, 8, 3.2, 5);
  shed(1.5, -9.2, 14, 3, 4);
  b.box("concrete", 3, 4.6, 3, -11.6, -1.2, { color: "#f2efe9" });
  b.box("corrugated", 2.4, 9.5, 2.4, 12.6, -9);

  ([[-7.2, "#d0613a"], [-4.2, "#2d5d8a"], [-1.2, "#3f7a5a"], [1.8, "#d9a441"]] as const).forEach(([tx, col]) => {
    const g = new THREE.Group();
    g.add(b.solid(1.05, 1.15, 3.2, b.mats.white, 0, 0.25, 0), b.solid(1.05, 0.95, 0.95, b.cache.paint(col, 0.5, 0), 0, 0.2, 2.2));
    g.position.set(tx, 0, 3.4);
    b.add(g, "pop");
  });

  for (let ix = 0; ix < 3; ix++)
    for (let iz = 0; iz < 2; iz++)
      for (let iy = 0; iy < 3; iy++) {
        if (iy === 2 && b.r() < 0.5) continue;
        b.add(b.solid(2.5, 1, 1, b.cache.paint(PALETTE[Math.floor(b.r() * 4)], 0.7, 0.2), 6.4 + ix * 2.6, iy * 1.02, 2.4 + iz * 1.1));
      }
  const pallets = Array.from({ length: 6 }, (_, i) => boxGeo(0.8, 0.35, 0.8, (i % 3) * 0.95, 0, Math.floor(i / 3) * 0.95));
  const p = b.merged(pallets, b.mats.trunk);
  p.position.set(9, 0, 5.6);
  b.add(p, "pop");
  for (let x = -14; x <= 12; x += 3.2) b.tree(x, 8.6, 0.9);
}

function residential(b: Builder) {
  const blocks: [number, number, number][] = [
    [-8, -3, 8],
    [-3.2, -5.4, 11],
    [2.2, -4, 9.5],
    [7.4, -5.6, 12.5],
    [-6.4, 3.6, 6],
    [9.6, 2.2, 7],
  ];
  blocks.forEach(([x, z, h], i) => {
    const w = 3.6;
    const d = 3.6;
    const m = b.box("residential", w, h, d, x, z, { color: i % 2 ? "#ffffff" : "#f6efe4" });
    const slabs: THREE.BufferGeometry[] = [];
    const rails: THREE.BufferGeometry[] = [];
    for (let y = 1; y < h - 0.4; y += 1) {
      slabs.push(boxGeo(w * 0.82, 0.07, 0.5, 0, y, d / 2 + 0.25));
      rails.push(boxGeo(w * 0.82, 0.28, 0.03, 0, y + 0.07, d / 2 + 0.49));
    }
    m.add(b.merged(slabs, b.mats.white), b.merged(rails, b.mats.glassClear, false));
  });
  const deck = b.solid(6.4, 0.06, 4.2, b.mats.deck, 1.6, 0, 3);
  deck.add(b.solid(4, 0.05, 2.2, b.mats.water, 0, 0.04, 0));
  b.add(deck, "pop");
  const club = b.box("house", 3.2, 1.5, 2, 1.6, 6.6, { color: "#f1e8db" });
  club.add(b.solid(3.6, 0.12, 2.4, b.mats.white, 0, 1.5, 0));
  for (let i = 0; i < 26; i++) b.tree(-14 + b.r() * 28, 6 + b.r() * 4, 1);
  for (let z = -8; z <= 4; z += 2.2) {
    b.tree(-12.5 + b.r(), z, 1.1);
    b.tree(13.2 + b.r(), z, 1.1);
  }
}

function mortgage(b: Builder) {
  const colors = ["#f3e3d3", "#e3ebf0", "#f2ead6", "#e9e0ea", "#e4efe2", "#f6efe6"];
  let i = 0;
  for (const z of [2.6, 6.4])
    for (const x of [-10.5, -7, -3.5, 0, 3.5, 7, 10.5]) {
      if ((x === 0 && z === 6.4) || b.r() < 0.12) continue;
      const g = new THREE.Group();
      g.add(b.block("house", 2.1, 1.5, 1.9, { color: colors[i++ % colors.length] }));
      const roof = b.gable(2.4, 0.95, 2.1, i % 3 ? b.mats.terracotta : b.mats.slate);
      roof.position.y = 1.5;
      roof.rotation.y = Math.PI / 2;
      roof.scale.set(0.9, 1, 1.1);
      g.add(roof, b.solid(0.25, 0.7, 0.25, b.mats.white, 0.5, 1.6, 0.4));
      g.position.set(x + (b.r() - 0.5) * 0.4, 0, z);
      g.rotation.y = (b.r() - 0.5) * 0.15;
      b.add(g);
      b.tree(x + 1.4, z + 0.9, 0.7);
    }

  // coin stacks: one merged mesh per stack
  [4, 7, 11, 16, 23].forEach((n, si) => {
    const coins = Array.from({ length: n }, (_, k) => {
      const g = GEO.coin.clone();
      g.userData = {};
      return g.translate((b.r() - 0.5) * 0.08, 0.1 + k * 0.21, (b.r() - 0.5) * 0.08);
    });
    const stack = b.merged(coins, b.mats.gold);
    stack.position.set(-8 + si * 4, 0, -4.2);
    b.add(stack);
  });

  // hero coin with rupee sign (no shadow so the shadow map stays static while it spins)
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const cx = cv.getContext("2d")!;
  const grad = cx.createRadialGradient(110, 100, 10, 128, 128, 128);
  grad.addColorStop(0, "#f7d987");
  grad.addColorStop(1, "#d39b32");
  cx.fillStyle = grad;
  cx.fillRect(0, 0, 256, 256);
  cx.strokeStyle = "rgba(120,80,20,0.35)";
  cx.lineWidth = 10;
  cx.beginPath();
  cx.arc(128, 128, 108, 0, Math.PI * 2);
  cx.stroke();
  cx.fillStyle = "#8a5d17";
  cx.font = "bold 150px Georgia, serif";
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText("₹", 128, 136);
  const face = new THREE.CanvasTexture(cv);
  face.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshStandardMaterial({ map: face, roughness: 0.35, metalness: 0.6 });
  const big = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.32, 48), [b.mats.gold, faceMat, faceMat]);
  big.rotation.x = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(big);
  holder.position.set(8, 8.6, -4.2);
  b.add(holder, "pop");
  b.spinners.push((t) => {
    holder.rotation.y = t * 0.8;
    holder.position.y = 8.6 + Math.sin(t * 1.4) * 0.35;
  });
  for (let x = -13; x <= 13; x += 2.6) b.tree(x, -8 + b.r(), 1.1);
}

const BUILDERS: Record<SceneKey, (b: Builder) => void> = { office, retail, warehousing, residential, mortgage };

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (!m.geometry.userData.shared) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mat) => {
      if (mat.userData.shared) return;
      (mat as THREE.MeshStandardMaterial).map?.dispose();
      mat.dispose();
    });
    if ((m as unknown as THREE.InstancedMesh).isInstancedMesh) (m as unknown as THREE.InstancedMesh).dispose();
  });
}

const MAX_DPR = 1.5;

export default function CityScene({ active, onReady }: { active: SceneKey; onReady?: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  useEffect(() => {
    ready.current = onReady;
  });
  const showRef = useRef<((k: SceneKey) => void) | null>(null);
  const shown = useRef(active);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let dpr = Math.min(window.devicePixelRatio, MAX_DPR);
    const renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(dpr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#f7f7f4", 80, 140);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 300);
    const target = new THREE.Vector3(0, 3.6, 0);

    scene.add(new THREE.HemisphereLight("#ffffff", "#d9d4ca", 0.9));
    const sun = new THREE.DirectionalLight("#fff3e2", 2.4);
    sun.position.set(18, 30, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, far: 90 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 3;
    scene.add(sun);

    // ground: soft radial pad + shadow catcher + faint grid
    const gc = document.createElement("canvas");
    gc.width = gc.height = 128;
    const gx = gc.getContext("2d")!;
    const rg = gx.createRadialGradient(64, 64, 10, 64, 64, 64);
    rg.addColorStop(0, "rgba(226,223,215,1)");
    rg.addColorStop(0.6, "rgba(233,231,225,0.6)");
    rg.addColorStop(1, "rgba(247,247,244,0)");
    gx.fillStyle = rg;
    gx.fillRect(0, 0, 128, 128);
    const padTex = new THREE.CanvasTexture(gc);
    padTex.colorSpace = THREE.SRGBColorSpace;
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(52, 34), new THREE.MeshBasicMaterial({ map: padTex, transparent: true, depthWrite: false }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = -0.01;
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.16 }));
    catcher.rotation.x = -Math.PI / 2;
    catcher.receiveShadow = true;
    const grid = new THREE.GridHelper(64, 32, "#0e0f10", "#0e0f10");
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.045;
    grid.position.y = 0.005;
    scene.add(pad, catcher, grid);

    const facades = makeFacades();
    const mats = makeMats();
    const cache = new MatCache(facades);

    type Live = { group: THREE.Group; spinners: Spinner[] };
    const live = new Set<Live>();
    let current: Live | null = null;
    let seed = 1;
    let busyUntil = 0; // performance.now() timestamp until which shadows/frames must update

    const show = (k: SceneKey) => {
      const reduce = prefersReducedMotion();
      const old = current;
      busyUntil = performance.now() + (reduce ? 100 : 2600);

      if (old) {
        old.group.children.forEach((c, i) => {
          const a = c.userData.anim as Anim;
          gsap.killTweensOf(c.scale);
          if (a === "instanced") {
            (c.userData.tween as gsap.core.Tween | undefined)?.kill();
            const p = { v: 1 };
            gsap.to(p, { v: 0, duration: reduce ? 0 : 0.4, ease: "power2.in", onUpdate: () => c.userData.setProgress(p.v) });
          } else
            gsap.to(c.scale, {
              ...(a === "pop" ? { x: 0.001, z: 0.001 } : {}),
              y: 0.001,
              duration: reduce ? 0 : 0.45,
              ease: "power3.in",
              delay: reduce ? 0 : (i % 12) * 0.012,
            });
        });
        gsap.delayedCall(reduce ? 0 : 0.75, () => {
          scene.remove(old.group);
          disposeTree(old.group);
          live.delete(old);
        });
      }

      const b = new Builder(facades, mats, cache, seed++ * 97);
      BUILDERS[k](b);
      b.finish();
      const entry: Live = { group: b.group, spinners: b.spinners };
      const items = b.group.children;
      scene.add(b.group);
      live.add(entry);
      current = entry;

      const start = reduce ? 0 : old ? 0.38 : 0.15;
      const order = items
        .filter((c) => c.userData.anim !== "instanced")
        .sort((a, c) => a.position.x + a.position.z * 0.3 - (c.position.x + c.position.z * 0.3));
      order.forEach((c, i) => {
        const pop = c.userData.anim === "pop";
        const s = c.scale.clone();
        if (pop) c.scale.setScalar(0.001);
        else c.scale.y = 0.001;
        gsap.to(c.scale, {
          ...(pop ? { x: s.x, y: s.y, z: s.z } : { y: s.y }),
          duration: reduce ? 0 : pop ? 0.9 : 1.5,
          ease: pop ? "back.out(2.2)" : "expo.out",
          delay: start + (reduce ? 0 : i * (0.9 / order.length) + (pop ? 0.25 : 0)),
        });
      });
      items
        .filter((c) => c.userData.anim === "instanced")
        .forEach((c) => {
          const p = { v: 0 };
          c.userData.tween = gsap.to(p, { v: 1, duration: reduce ? 0 : 1.6, ease: "none", delay: start + 0.3, onUpdate: () => c.userData.setProgress(p.v) });
        });
    };
    showRef.current = show;
    show(shown.current);

    // sizing
    let fit = 1;
    let dirty = true;
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      fit = Math.min(1.45, Math.max(1, 1.9 / camera.aspect));
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // pointer parallax (no idle motion: an idle scene costs no GPU time)
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    const base = new THREE.Vector3(31, 19, 37).multiplyScalar(1.0);
    const up = new THREE.Vector3(0, 1, 0);
    const camPos = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    let slowFrames = 0;
    let last = performance.now();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (!visible) return;

      const t = clock.getElapsedTime();
      const dx = mx - cx;
      const dy = my - cy;
      const moving = Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005;
      cx += dx * 0.05;
      cy += dy * 0.05;
      const busy = now < busyUntil;
      let spinning = false;
      live.forEach((l) => {
        if (l.spinners.length) spinning = true;
        l.spinners.forEach((fn) => fn(t));
      });
      if (!moving && !busy && !spinning && !dirty) return;
      dirty = false;

      camPos.copy(base).applyAxisAngle(up, cx * 0.14).multiplyScalar(fit);
      camPos.y -= cy * 2.2;
      camera.position.copy(camPos);
      camera.lookAt(target);
      if (busy) renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
      if (ready.current) {
        ready.current();
        ready.current = undefined;
      }

      // adaptive quality: drop resolution if the GPU keeps missing ~40fps
      if (dt > 25 && dt < 200) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        resize();
        slowFrames = 0;
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      live.forEach((l) => {
        l.group.children.forEach((c) => gsap.killTweensOf(c.scale));
        disposeTree(l.group);
      });
      Object.values(facades).forEach((t) => {
        t.map.dispose();
        t.em?.dispose();
      });
      Object.values(mats).forEach((m) => m.dispose());
      cache.dispose();
      padTex.dispose();
      envTex.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      showRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (shown.current === active) return;
    shown.current = active;
    showRef.current?.(active);
  }, [active]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
