import * as THREE from "three";

/** A facade's window grid, so windows can be switched on and off at night. */
export type WindowGrid = {
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  cells: { x: number; y: number; w: number; h: number; on: boolean }[];
  lit: string;
};

const CAR_COLORS = ["#d64545", "#2f6fdb", "#e8e4dc", "#2b2d33", "#c9a227"];
const N_CARS = 5;
const N_BEACONS = 4;

/** Soft round glow texture (white centre to transparent), tinted per use. */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.45)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Ambient life for the night city: red aviation lights blinking on the tallest roofs, cars with
 * headlights looping around the scene, and windows switching on and off. Only runs at night.
 */
export class NightLife {
  group = new THREE.Group();
  private glow = glowTexture();
  private beacons: { core: THREE.Mesh; halo: THREE.Sprite; phase: number }[] = [];
  private cars: { root: THREE.Group; pool: THREE.Mesh; offset: number }[] = [];
  private path: THREE.CatmullRomCurve3 | null = null;
  private pathLen = 1;
  private bornAt = 0;
  private nextFlick = 0;
  private night = 0;
  private own: { geos: THREE.BufferGeometry[]; mats: THREE.Material[] } = { geos: [], mats: [] };
  private beaconGeo: THREE.SphereGeometry;
  private beaconMat: THREE.MeshBasicMaterial;
  private haloMat: THREE.SpriteMaterial;

  constructor(private windows: WindowGrid[]) {
    this.group.visible = false;
    this.beaconGeo = this.keep(new THREE.SphereGeometry(0.14, 10, 8));
    this.beaconMat = this.keepM(new THREE.MeshBasicMaterial({ color: "#ff2d2d", transparent: true, opacity: 0 }));
    this.haloMat = this.keepM(
      new THREE.SpriteMaterial({ map: this.glow, color: "#ff3b30", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.buildCars();
  }

  private keep<T extends THREE.BufferGeometry>(g: T) {
    this.own.geos.push(g);
    return g;
  }
  private keepM<T extends THREE.Material>(m: T) {
    this.own.mats.push(m);
    return m;
  }

  private buildCars() {
    const body = this.keep(new THREE.BoxGeometry(0.9, 0.26, 0.42).translate(0, 0.17, 0));
    const cabin = this.keep(new THREE.BoxGeometry(0.46, 0.2, 0.38).translate(-0.05, 0.38, 0));
    const lamp = this.keep(new THREE.BoxGeometry(0.04, 0.06, 0.09));
    const pool = this.keep(new THREE.PlaneGeometry(2.2, 1.4).rotateX(-Math.PI / 2).translate(1.5, 0.03, 0));
    const head = this.keepM(new THREE.MeshBasicMaterial({ color: "#fff3c8" }));
    const tail = this.keepM(new THREE.MeshBasicMaterial({ color: "#ff3b30" }));
    const poolMat = this.keepM(
      new THREE.MeshBasicMaterial({ map: this.glow, color: "#ffe2a8", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    for (let i = 0; i < N_CARS; i++) {
      const paint = this.keepM(new THREE.MeshStandardMaterial({ color: CAR_COLORS[i % CAR_COLORS.length], roughness: 0.45, metalness: 0.3 }));
      const root = new THREE.Group();
      root.add(new THREE.Mesh(body, paint), new THREE.Mesh(cabin, paint));
      for (const s of [-1, 1]) {
        const h = new THREE.Mesh(lamp, head);
        h.position.set(0.46, 0.2, s * 0.14);
        const t = new THREE.Mesh(lamp, tail);
        t.position.set(-0.46, 0.2, s * 0.14);
        root.add(h, t);
      }
      const p = new THREE.Mesh(pool, poolMat);
      root.add(p);
      this.group.add(root);
      this.cars.push({ root, pool: p, offset: i / N_CARS });
    }
  }

  /**
   * Call when a new scene is built (before its rise animation shrinks it): beacons go on the tallest
   * roofs, and the car loop is fitted around the scene's footprint.
   */
  rebuild(sceneRoot: THREE.Object3D, box: THREE.Box3, now: number) {
    this.bornAt = now;
    // beacons: tallest meshes' top centres (ground-level clutter ignored)
    for (const b of this.beacons) this.group.remove(b.core, b.halo);
    this.beacons = [];
    const tops: THREE.Vector3[] = [];
    const bb = new THREE.Box3();
    sceneRoot.updateMatrixWorld(true);
    sceneRoot.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return;
      bb.setFromObject(m);
      if (bb.max.y < 5) return;
      tops.push(new THREE.Vector3((bb.min.x + bb.max.x) / 2, bb.max.y + 0.22, (bb.min.z + bb.max.z) / 2));
    });
    tops
      .sort((a, b) => b.y - a.y)
      .filter((p, i, arr) => arr.findIndex((q) => q.distanceTo(p) < 1.2) === i) // one per roof
      .slice(0, N_BEACONS)
      .forEach((p, i) => {
        const core = new THREE.Mesh(this.beaconGeo, this.beaconMat.clone());
        const halo = new THREE.Sprite(this.haloMat.clone());
        core.position.copy(p);
        halo.position.copy(p);
        halo.scale.setScalar(1.3);
        this.group.add(core, halo);
        this.beacons.push({ core, halo, phase: i * 0.37 });
      });

    // car loop: a rounded rectangle just outside the scene footprint
    const pad = 2.1;
    const x0 = box.min.x - pad, x1 = box.max.x + pad, z0 = box.min.z - pad, z1 = box.max.z + pad;
    const c = 1.4;
    const pts = [
      [x0 + c, z0], [x1 - c, z0], [x1, z0 + c], [x1, z1 - c], [x1 - c, z1], [x0 + c, z1], [x0, z1 - c], [x0, z0 + c],
    ].map(([x, z]) => new THREE.Vector3(x, 0.02, z));
    this.path = new THREE.CatmullRomCurve3(pts, true, "centripetal");
    this.pathLen = this.path.getLength();
  }

  /** 0 = day, 1 = night; everything fades with it. */
  setNight(v: number) {
    this.night = v;
    this.group.visible = v > 0.02;
  }

  get active() {
    return this.night > 0.02;
  }

  /** Per-frame update; `t` in seconds. */
  update(t: number, now: number) {
    if (!this.active) return;
    const appear = Math.min(1, Math.max(0, (now - this.bornAt - 1600) / 900)); // after the buildings rise
    const k = this.night * appear;

    // blinking aviation lights: a short bright flash every 1.6s, slightly out of step with each other
    for (const b of this.beacons) {
      const ph = ((t / 1.6 + b.phase) % 1 + 1) % 1;
      const flash = ph < 0.12 ? 1 - ph / 0.12 : 0;
      (b.core.material as THREE.MeshBasicMaterial).opacity = k * (0.35 + 0.65 * flash);
      (b.halo.material as THREE.SpriteMaterial).opacity = k * flash * 0.9;
      b.halo.scale.setScalar(1.1 + flash * 1.6);
    }

    // cars looping around the scene (speed in world units / second)
    if (this.path) {
      const speed = 2.2;
      const u0 = (t * speed) / this.pathLen;
      const tan = new THREE.Vector3();
      for (const c of this.cars) {
        const u = (((u0 + c.offset) % 1) + 1) % 1;
        this.path.getPointAt(u, c.root.position);
        this.path.getTangentAt(u, tan);
        c.root.rotation.y = Math.atan2(-tan.z, tan.x);
        c.root.scale.setScalar(appear);
        (c.pool.material as THREE.MeshBasicMaterial).opacity = k * 0.85;
      }
    }

    // windows switching on/off: one random window roughly every second
    if (now > this.nextFlick && this.windows.length) {
      this.nextFlick = now + 600 + Math.random() * 900;
      const w = this.windows[Math.floor(Math.random() * this.windows.length)];
      const cell = w.cells[Math.floor(Math.random() * w.cells.length)];
      cell.on = !cell.on;
      w.ctx.fillStyle = cell.on ? w.lit : "#000";
      w.ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
      w.tex.needsUpdate = true;
    }
  }

  dispose() {
    this.beacons.forEach((b) => {
      (b.core.material as THREE.Material).dispose();
      (b.halo.material as THREE.Material).dispose();
    });
    this.own.geos.forEach((g) => g.dispose());
    this.own.mats.forEach((m) => m.dispose());
    this.glow.dispose();
  }
}
