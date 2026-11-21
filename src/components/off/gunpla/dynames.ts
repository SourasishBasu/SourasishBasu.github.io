/**
 * GN-002 Gundam Dynames, MG 1/100, built from primitives in code: a stylised,
 * approximate model after online photos of the kit (front, three-quarter and
 * full-shield views). It isn't a scan or a copy of anyone's mesh.
 *
 * Units are roughly centimetres at kit scale (about 18 tall), Y up, facing +Z.
 * The suit's own left is +X. Each left/right pair is built once, for the left,
 * and reflected (scale.x = -1) for the right; three.js flips the winding for
 * reflected meshes, so they light correctly.
 */
import * as THREE from 'three';

type V3 = [number, number, number];
type V2 = [number, number];
/** x0, x1, z0, z1 */
type Rect = [number, number, number, number];

export const PALETTE = {
  white: '#E6E6E0',
  green: '#1C5233',
  frame: '#5D6267',
  dark: '#383C41',
  yellow: '#E8B522',
  red: '#C42E2A',
  navy: '#2B3250',
  glow: '#79FFA6',
};

export interface DynamesModel {
  /** Feet on y = 0, centred on x and z. */
  root: any;
  /** Tip of the GN Drive cone, where particles come from. */
  emitter: any;
  /** The glowing parts' material, so the viewer can pulse it. */
  glow: any;
  meshCount: number;
  /** Height and half-width (x and z) of the suit and its kit, for framing the camera. */
  size: { height: number; radius: number };
  dispose(): void;
}

/** A six-sided block between two horizontal rectangles: y0 bottom, y1 top. Tapers and slopes come from the two rectangles differing. */
function blockGeometry(y0: number, y1: number, b: Rect, t: Rect) {
  const p: V3[] = [
    [b[0], y0, b[2]],
    [b[1], y0, b[2]],
    [b[1], y0, b[3]],
    [b[0], y0, b[3]],
    [t[0], y1, t[2]],
    [t[1], y1, t[2]],
    [t[1], y1, t[3]],
    [t[0], y1, t[3]],
  ];
  // Quads wound counter-clockwise seen from outside: bottom, top, front, back, right, left.
  const faces = [
    [0, 1, 2, 3],
    [4, 7, 6, 5],
    [3, 2, 6, 7],
    [1, 0, 4, 5],
    [2, 1, 5, 6],
    [0, 3, 7, 4],
  ];
  const pos: number[] = [];
  for (const [a, b2, c, d] of faces) for (const i of [a, b2, c, a, c, d]) pos.push(...p[i]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** A flat outline (x, y) extruded along z by `depth`, centred on z = 0, with a small chamfer that stays inside the outline. */
function plateGeometry(pts: V2[], depth: number, bevel: number) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 1,
    curveSegments: 4,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

export function buildDynames(): DynamesModel {
  const owned: { dispose(): void }[] = [];
  const material = (color: string, roughness: number, extra: Record<string, unknown> = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
    owned.push(m);
    return m;
  };
  const W = material(PALETTE.white, 0.45);
  const G = material(PALETTE.green, 0.48);
  const F = material(PALETTE.frame, 0.55, { metalness: 0.15 });
  const D = material(PALETTE.dark, 0.5, { metalness: 0.1 });
  const Y = material(PALETTE.yellow, 0.34);
  const R = material(PALETTE.red, 0.36);
  const N = material(PALETTE.navy, 0.45);
  const GL = material('#0E3B20', 0.3, { emissive: PALETTE.glow, emissiveIntensity: 2 });
  const lines = new THREE.LineBasicMaterial({ color: '#14181A', transparent: true, opacity: 0.42 });
  owned.push(lines);

  let meshCount = 0;
  const add = (parent: any, geo: any, mat: any, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], edges = true) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    owned.push(geo);
    if (edges) {
      // Panel lines: the hard edges of every part, drawn thin and dark like a panel-lined kit.
      const e = new THREE.EdgesGeometry(geo, 28);
      owned.push(e);
      mesh.add(new THREE.LineSegments(e, lines));
    }
    parent.add(mesh);
    meshCount++;
    return mesh;
  };
  const group = (parent: any, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.set(...rot);
    parent.add(g);
    return g;
  };
  const block = (parent: any, mat: any, y0: number, y1: number, b: Rect, t: Rect = b, pos?: V3, rot?: V3) =>
    add(parent, blockGeometry(y0, y1, b, t), mat, pos, rot);
  /** A plate whose outline is given in its parent's x/y; it pivots about the outline's centre. */
  const plate = (parent: any, pts: V2[], depth: number, mat: any, z = 0, rot: V3 = [0, 0, 0], bevel = 0.03) => {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const geo = plateGeometry(pts.map(([x, y]) => [x - cx, y - cy] as V2), depth, bevel);
    return add(parent, geo, mat, [cx, cy, z], rot, mat !== GL);
  };
  const cyl = (parent: any, r: number, len: number, mat: any, pos: V3, axis: 'x' | 'y' | 'z' = 'y', seg = 20, r2 = r) => {
    const rot: V3 = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
    return add(parent, new THREE.CylinderGeometry(r, r2, len, seg), mat, pos, rot, mat !== GL);
  };
  const ball = (parent: any, r: number, mat: any, pos: V3 = [0, 0, 0]) => add(parent, new THREE.SphereGeometry(r, 16, 12), mat, pos, [0, 0, 0], false);
  /** Build the left-hand part, then a reflected copy for the right. */
  const pair = (parent: any, pos: V3, build: (g: any, side: 1 | -1) => void) => {
    for (const side of [1, -1] as const) {
      const g = group(parent, [pos[0] * side, pos[1], pos[2]]);
      if (side < 0) g.scale.x = -1;
      build(g, side);
    }
  };

  const root = new THREE.Group();
  root.name = 'gundam-dynames';
  const body = group(root);
  let rightHand: any;

  // ── Waist, skirts and legs. Hip joints sit at y ≈ 9.15. ──
  const pelvis = group(body, [0, 9.3, 0]);
  block(pelvis, W, -0.75, 0.75, [-0.42, 0.42, -0.35, 0.55], [-0.8, 0.8, -0.6, 0.75]); // crotch block
  block(pelvis, F, 0.55, 1.4, [-1.25, 1.25, -0.75, 0.75]); // waist frame
  pair(pelvis, [0, 0, 0], (s) => {
    const front = plate(s, [[0.12, 1.15], [1.2, 1.15], [1.3, 0.25], [1.05, -1.0], [0.45, -1.05], [0.12, -0.55]], 0.16, G, 0.9, [-0.16, 0, 0]);
    block(front, F, -0.95, -0.55, [-0.05, 0.3, 0.1, 0.15]); // thruster vent
    block(s, G, -0.95, 1.1, [1.32, 1.58, -0.75, 0.72], [1.24, 1.46, -0.7, 0.66]); // side skirt
    block(s, F, -0.65, 0.65, [1.5, 1.9, -0.5, 0.48]); // GN beam pistol holster
    block(s, D, 0.65, 1.0, [1.62, 1.84, -0.46, -0.12]); // pistol grip
    plate(s, [[0, 1.1], [1.1, 1.1], [1.05, -0.6], [0, -0.85]], 0.16, G, -0.88, [0.16, 0, 0]); // rear skirt

    const hip = group(s, [1.05, -0.15, 0], [0, 0, 0.1]);
    ball(hip, 0.42, F);
    block(hip, W, -3.2, -0.35, [-0.68, 0.68, -0.66, 0.7], [-0.74, 0.74, -0.72, 0.74]); // thigh
    block(hip, F, -2.9, -0.6, [-0.8, -0.67, -0.4, 0.4]); // inner frame
    const knee = group(hip, [0, -3.45, 0]);
    cyl(knee, 0.42, 1.05, F, [0, 0, 0], 'x');
    block(knee, G, -0.85, 0.75, [-0.5, 0.5, 0.5, 0.97], [-0.38, 0.38, 0.45, 0.8]); // knee armour
    block(knee, W, -4.25, -0.25, [-0.88, 0.88, -0.9, 0.98], [-0.66, 0.66, -0.66, 0.66]); // shin
    block(knee, W, -3.4, -0.9, [-0.34, 0.34, 0.86, 1.08], [-0.27, 0.27, 0.64, 0.8]); // shin ridge
    block(knee, N, -3.5, -1.4, [0.72, 0.86, -0.35, 0.35]); // outer recess
    block(knee, N, -3.5, -1.4, [-0.86, -0.72, -0.35, 0.35]); // inner recess
    block(knee, F, -3.9, -2.6, [-0.42, 0.42, -1.0, -0.8]); // calf vent
    const ankle = group(knee, [0, -4.5, 0], [0, 0, -0.1]);
    ball(ankle, 0.36, F);
    block(ankle, G, -1.05, -0.25, [-0.68, 0.68, -1.1, 1.6], [-0.54, 0.54, -0.88, 0.68]); // foot
    block(ankle, D, -1.25, -1.05, [-0.7, 0.7, -1.15, 1.65]); // sole
    block(ankle, G, -0.6, 0.35, [-0.48, 0.48, 0.25, 0.85], [-0.4, 0.4, 0.2, 0.6]); // ankle guard
    block(ankle, F, -1.05, -0.4, [-0.42, 0.42, -1.25, -0.8], [-0.38, 0.38, -1.0, -0.8]); // heel
  });

  // ── Torso: abdomen, chest, the GN Drive's ring around the chest, and the drive on the back. ──
  const torso = group(body, [0, 10.6, 0]);
  block(torso, D, -0.2, 1.8, [-0.85, 0.85, -0.65, 0.65], [-0.95, 0.95, -0.7, 0.7]); // abdomen
  block(torso, F, 0.35, 0.55, [-0.9, 0.9, -0.6, 0.73]);
  block(torso, F, 0.85, 1.05, [-0.93, 0.93, -0.6, 0.75]);
  plate(torso, [[-0.36, 1.95], [0.36, 1.95], [0.4, 0.65], [0, 0.1], [-0.4, 0.65]], 0.2, R, 0.84); // red abdomen plate
  block(torso, G, 1.6, 4.6, [-1.25, 1.25, -0.85, 1.0], [-1.75, 1.75, -1.05, 1.15]); // chest
  const centre = plate(torso, [[-0.62, 4.5], [0.62, 4.5], [0.66, 3.0], [0, 1.75], [-0.66, 3.0]], 0.22, G, 1.2, [0.05, 0, 0]);
  cyl(centre, 0.17, 0.04, W, [0, 0.75, 0.15], 'z', 24); // Celestial Being mark
  block(torso, G, 1.9, 4.4, [-1.3, 1.3, -1.25, -0.8], [-1.5, 1.5, -1.3, -0.9]); // back
  cyl(torso, 1.85, 1.2, F, [0, 3.2, -0.25], 'z', 40); // drive ring
  cyl(torso, 0.33, 0.8, F, [0, 4.95, 0.05]); // neck
  pair(torso, [0, 0, 0], (s) => {
    block(s, Y, 2.7, 3.6, [0.72, 1.42, 0.95, 1.2]); // chest vent
    for (let k = 0; k < 3; k++) block(s, D, 2.82, 3.48, [0.83 + k * 0.21, 0.91 + k * 0.21, 1.19, 1.23]);
    block(s, W, 4.3, 4.95, [0.45, 1.45, -0.55, 0.95], [0.5, 1.25, -0.4, 0.7]); // collar
  });
  const drive = group(torso, [0, 3.1, -1.3]);
  cyl(drive, 0.95, 0.5, F, [0, 0, -0.25], 'z', 32);
  add(drive, new THREE.TorusGeometry(0.72, 0.07, 8, 40), GL, [0, 0, -0.52], [0, 0, 0], false);
  cyl(drive, 0.7, 1.15, D, [0, 0, -1.07], 'z', 28, 0.02); // cone, tip pointing back
  ball(drive, 0.12, GL, [0, 0, -1.66]);
  const emitter = new THREE.Object3D();
  emitter.position.set(0, 0, -1.75);
  drive.add(emitter);

  // ── Head: helmet, face and visor, green cheek guards, the wide yellow V-fin and the two smaller antennas. ──
  const head = group(torso, [0, 5.12, 0.1]);
  head.scale.setScalar(1.15);
  block(head, W, 0.15, 1.25, [-0.55, 0.55, -0.6, 0.62], [-0.48, 0.48, -0.55, 0.45]); // helmet
  block(head, W, 1.2, 1.5, [-0.42, 0.42, -0.5, 0.4], [-0.3, 0.3, -0.4, 0.2]); // crown
  block(head, W, 0, 0.62, [-0.3, 0.3, 0.2, 0.66], [-0.4, 0.4, 0.25, 0.7]); // face
  block(head, R, -0.1, 0.16, [-0.13, 0.13, 0.5, 0.72]); // chin
  block(head, D, 0.6, 0.86, [-0.42, 0.42, 0.5, 0.72]); // visor band
  block(head, W, 0.84, 1.14, [-0.32, 0.32, 0.45, 0.7], [-0.28, 0.28, 0.45, 0.62]); // forehead
  plate(head, [[-0.1, 0.92], [0.1, 0.92], [0.07, 1.2], [-0.07, 1.2]], 0.06, R, 0.8); // crest
  pair(head, [0, 0, 0], (s) => {
    plate(s, [[0.06, 0.65], [0.38, 0.69], [0.36, 0.8], [0.1, 0.78]], 0.03, GL, 0.735, [0, 0, 0], 0); // eye
    block(s, G, 0.05, 0.9, [0.45, 0.68, -0.3, 0.5], [0.5, 0.66, -0.35, 0.35]); // cheek guard
    plate(s, [[0, 0.96], [0.32, 0.96], [1.75, 1.95], [1.62, 2.06], [0.28, 1.36], [0, 1.3]], 0.08, Y, 0.76, [-0.15, 0, 0], 0.02); // V-fin
    plate(s, [[0.55, 0.25], [0.68, 0.25], [1.05, 0.98], [0.97, 1.03]], 0.06, Y, 0.35, [0, 0, 0], 0.015); // side antenna
  });

  // ── Shoulders, arms and the GN Full Shields. The right arm reaches forward for the rifle. ──
  pair(torso, [2.0, 4.0, 0], (s, side) => {
    ball(s, 0.5, F);
    block(s, G, -1.1, 1.25, [0, 1.95, -1.15, 1.15], [0.1, 1.6, -0.95, 0.95]); // shoulder armour
    block(s, F, -0.7, 0.3, [0.5, 1.4, 1.0, 1.12]); // front panel
    block(s, F, 1.2, 1.6, [0.45, 1.35, -0.7, 0.3]); // shield mount
    block(s, F, 1.3, 1.55, [1.3, 2.95, -0.42, 0.02]); // mount arm

    const arm = group(s, [0.75, -0.35, 0], side > 0 ? [0.05, 0, 0.12] : [-0.12, 0, 0.2]);
    block(arm, W, -2.1, -0.3, [-0.48, 0.48, -0.5, 0.5], [-0.5, 0.5, -0.52, 0.52]); // upper arm
    block(arm, F, -1.9, -0.5, [-0.57, -0.46, -0.3, 0.3]);
    const elbow = group(arm, [0, -2.3, 0], [side > 0 ? -0.25 : -0.5, 0, 0]);
    cyl(elbow, 0.38, 0.9, F, [0, 0, 0], 'x');
    block(elbow, W, -2.45, -0.2, [-0.68, 0.68, -0.68, 0.7], [-0.56, 0.56, -0.56, 0.58]); // forearm
    block(elbow, D, -2.5, -2.25, [-0.7, 0.7, -0.7, 0.72]); // wrist cuff
    block(elbow, F, -1.8, -0.8, [0.6, 0.72, -0.3, 0.3]); // outer vent
    const hand = group(elbow, [0, -2.6, 0]);
    block(hand, D, -0.75, 0, [-0.28, 0.28, -0.36, 0.38], [-0.3, 0.3, -0.38, 0.4]); // palm
    block(hand, D, -1.0, -0.6, [-0.26, 0.26, -0.2, 0.42]); // fingers
    block(hand, D, -0.7, -0.2, [-0.38, -0.26, 0, 0.3]); // thumb
    if (side < 0) rightHand = hand;

    // The shield hangs off the mount arm, its face turned out and a little forward, flaring at the bottom.
    // Outlines are drawn with x pointing forward; the face group turns them so +z is the outer face.
    const shield = group(s, [3.15, 1.45, -0.2], [0, 0, 0.08]);
    const face = group(shield, [0, 0, 0], [0, Math.PI / 2 - 0.62, 0]);
    // Folded, the shield is about 3.3 wide; outlines are drawn 2.6 wide and stretched.
    const fwd = (pts: V2[]) => pts.map(([x, y]) => [-x * 1.25, y] as V2);
    plate(face, fwd([[-1.0, 2.2], [0.3, 2.5], [1.2, 1.6], [1.35, -2.5], [1.6, -3.2], [1.5, -7.5], [0.6, -10.4], [-0.4, -10.0], [-1.1, -6.0], [-1.3, -2.0], [-1.25, 0.8]]), 0.3, G, 0, [0, 0, 0], 0.04);
    plate(face, fwd([[-0.8, 1.9], [0.3, 2.15], [1.0, 1.4], [1.1, -2.8], [-1.05, -2.4], [-1.05, 0.7]]), 0.1, G, 0.24);
    plate(face, fwd([[-1.05, -2.85], [1.15, -3.25], [1.25, -7.4], [0.5, -9.8], [-0.3, -9.5], [-0.9, -6.0]]), 0.1, G, 0.24);
    const stripe = (path: V2[], w: number) => {
      // A thin white decal stripe along a path: offset each point to both sides of its segment.
      const left: V2[] = [];
      const right: V2[] = [];
      path.forEach((p, i) => {
        const a = path[Math.max(0, i - 1)];
        const b = path[Math.min(path.length - 1, i + 1)];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = (-(b[1] - a[1]) / len) * w;
        const ny = ((b[0] - a[0]) / len) * w;
        left.push([p[0] + nx, p[1] + ny]);
        right.push([p[0] - nx, p[1] - ny]);
      });
      plate(face, fwd([...left, ...right.reverse()]), 0.02, W, 0.335, [0, 0, 0], 0);
    };
    stripe([[0.85, 1.5], [0.85, -0.9], [0.4, -1.7], [0.4, -4.6], [0.9, -5.4], [0.9, -7.6]], 0.06);
    stripe([[-0.65, 0.4], [-0.65, -3.1], [-0.95, -3.7], [-0.95, -6.3]], 0.06);
    for (const [x, y] of [[1.0, -0.4], [-0.9, -2.6], [1.15, -6.0], [-0.55, -8.4]] as V2[]) {
      block(face, F, y - 0.08, y + 0.08, [-x * 1.25 - 0.26, -x * 1.25 + 0.26, 0.26, 0.36]); // clamps
    }
    block(face, F, -8, 1.5, [-0.3, 0.3, -0.34, -0.16]); // inner frame
    block(face, F, -0.4, 0.4, [-0.35, 0.35, -0.6, -0.12]); // hinge
  });

  // Feet on the floor, from the legs alone (the rifle reaches below the knees).
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(body);
  body.position.y = -box.min.y;
  const height = box.max.y - box.min.y;

  // ── GN Sniper Rifle, gripped in the right hand, muzzle down and out like the kit's sample photos. ──
  root.updateMatrixWorld(true);
  const rifle = group(root);
  block(rifle, D, 0.1, 0.85, [-0.25, 0.25, -1.3, 2.0]); // receiver
  block(rifle, F, 0.85, 0.98, [-0.15, 0.15, -0.6, 1.8]); // rail
  block(rifle, F, 0.95, 1.08, [-0.1, 0.1, 0, 0.2]); // scope mounts
  block(rifle, F, 0.95, 1.08, [-0.1, 0.1, 0.9, 1.1]);
  cyl(rifle, 0.2, 1.9, D, [0, 1.25, 0.55], 'z'); // scope
  cyl(rifle, 0.25, 0.3, D, [0, 1.25, 1.45], 'z');
  cyl(rifle, 0.19, 0.02, GL, [0, 1.25, 1.61], 'z'); // lens
  block(rifle, D, -0.15, 0.8, [-0.2, 0.2, -3.0, -1.3], [-0.2, 0.2, -2.7, -1.3]); // stock
  block(rifle, F, -0.2, 0.85, [-0.22, 0.22, -3.1, -2.95]); // butt plate
  cyl(rifle, 0.24, 1.8, D, [0, 0.48, 2.9], 'z'); // barrel shroud
  cyl(rifle, 0.12, 3.0, F, [0, 0.48, 5.3], 'z'); // barrel
  cyl(rifle, 0.2, 0.45, D, [0, 0.48, 6.95], 'z'); // muzzle
  block(rifle, D, -0.75, 0.15, [-0.15, 0.15, -0.25, 0.15], [-0.17, 0.17, -0.1, 0.3]); // grip
  block(rifle, F, -0.45, 0.1, [-0.18, 0.18, 0.6, 1.2]); // cartridge
  rifle.rotation.set(1.02, -0.73, 0, 'YXZ');
  rifle.updateMatrixWorld(true);
  const palm = rightHand.localToWorld(new THREE.Vector3(0, -0.5, 0.05));
  const grip = new THREE.Vector3(0, -0.35, 0).applyEuler(rifle.rotation);
  rifle.position.copy(palm).sub(grip);

  root.updateMatrixWorld(true);
  const all = new THREE.Box3().setFromObject(root);
  const radius = Math.max(-all.min.x, all.max.x, -all.min.z, all.max.z);

  return {
    root,
    emitter,
    glow: GL,
    meshCount,
    size: { height, radius },
    dispose() {
      for (const o of owned) o.dispose();
    },
  };
}
