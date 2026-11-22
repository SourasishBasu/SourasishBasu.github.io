/**
 * The Gunpla bench viewer: the Dynames model on a turntable. The canvas is
 * transparent, so the bench's cutting mat (CSS) shows behind it, with the
 * turntable's shadow drawn onto it. It turns slowly; drag sideways to turn it
 * yourself (vertical drags still scroll the page on touch screens), and mouse
 * drags up and down tilt the view a little. GN particles drift from the drive.
 *
 * Zoom has no buttons: pinch (trackpad or touch), Ctrl/⌘ + wheel, or a plain
 * wheel once you've grabbed the model (until the pointer leaves it); a double
 * click or double tap zooms to the part under it, and again to zoom back out.
 * Zooming in rises toward the head unless you picked a spot.
 *
 * The Dynames is built in code; the Virtue and Freedom are glTF models, loaded
 * the first time they're picked and scaled to the Dynames' height.
 *
 * Runs only while active (on screen and selected). With reduced motion it
 * doesn't spin or emit; it draws a still frame and moves only when you move it.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildDynames, PALETTE } from './dynames';

export type ModelId = 'dynames' | 'virtue' | 'freedom';

export interface BenchViewer {
  setActive(on: boolean): void;
  /** Put a kit on the turntable, loading it first if need be. Resolves once it's showing. */
  show(id: ModelId): Promise<void>;
  dispose(): void;
}

/** Kits from Sketchfab (CC BY, credited on the page), slimmed for the web: see THIRD_PARTY_NOTICES.md. */
const GLB: Record<Exclude<ModelId, 'dynames'>, { url: string; yaw: number }> = {
  virtue: { url: '/models/virtue.glb', yaw: 0 },
  freedom: { url: '/models/freedom.glb', yaw: 0 },
};

interface OnBench {
  root: any;
  height: number;
  radius: number;
  /** GN Drive tip, for particles (the Dynames only). */
  emitter?: any;
  glow?: any;
  dispose(): void;
}

const MAX_ZOOM = 5;

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountViewer(canvas: HTMLCanvasElement, { reducedMotion }: { reducedMotion: boolean }): BenchViewer {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(o: T) => (owned.push(o), o);

  const scene = new THREE.Scene();
  const pmrem = own(new THREE.PMREMGenerator(renderer));
  scene.environment = own(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
  scene.environmentIntensity = 0.28;

  // A warm key from the front left (the desk lamp), a cool rim from behind, a soft fill, and green bounce off the mat.
  scene.add(new THREE.HemisphereLight('#F3F0E6', '#2D6B4C', 0.65));
  const key = new THREE.DirectionalLight('#FFF4DE', 2.7);
  key.position.set(-9, 24, 15);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -11, right: 11, top: 13, bottom: -13, near: 5, far: 70 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 3;
  key.target.position.set(0, 8, 0);
  const rim = new THREE.DirectionalLight('#CFE3FF', 1.5);
  rim.position.set(10, 12, -12);
  const fill = new THREE.DirectionalLight('#FFFFFF', 0.45);
  fill.position.set(12, 4, 10);
  scene.add(key, key.target, rim, fill);

  const dynames = buildDynames();
  const models = new Map<ModelId, OnBench>();
  models.set('dynames', {
    root: dynames.root,
    height: dynames.size.height,
    radius: dynames.size.radius,
    emitter: dynames.emitter,
    glow: dynames.glow,
    dispose: () => dynames.dispose(),
  });
  let cur = models.get('dynames')!;
  const turntable = new THREE.Group();
  turntable.add(cur.root);
  scene.add(turntable);

  // Turntable: a dark disc with tick marks round its rim, like the artboard's. Built at radius 1 and
  // scaled to whichever kit is on it.
  let discR = Math.max(5.6, cur.radius + 0.5);
  const ticks = own(
    canvasTexture(1024, (g, s) => {
      g.fillStyle = '#1C1F1E';
      g.fillRect(0, 0, s, s);
      g.translate(s / 2, s / 2);
      g.strokeStyle = '#2E3432';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(0, 0, s * 0.47, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = '#8A918D';
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        const r0 = s * (i % 10 === 0 ? 0.405 : 0.43);
        g.lineWidth = i % 10 === 0 ? 4 : 2.5;
        g.beginPath();
        g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        g.lineTo(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46);
        g.stroke();
      }
    }),
  );
  ticks.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const discSide = own(new THREE.MeshStandardMaterial({ color: '#16191A', roughness: 0.7 }));
  const discTop = own(new THREE.MeshStandardMaterial({ map: ticks, roughness: 0.75 }));
  const disc = new THREE.Mesh(own(new THREE.CylinderGeometry(1, 1.03, 0.5, 96)), [discSide, discTop, discSide]);
  disc.scale.set(discR, 1, discR);
  disc.position.y = -0.25;
  disc.receiveShadow = true;
  turntable.add(disc);

  // On the mat: a soft contact shadow under the disc, and a catcher for the suit's cast shadow.
  const blob = own(
    canvasTexture(256, (g, s) => {
      const grad = g.createRadialGradient(s / 2, s / 2, s * 0.18, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(0,0,0,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }),
  );
  const shadowBlob = new THREE.Mesh(
    own(new THREE.PlaneGeometry(3, 3)),
    own(new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false })),
  );
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = -0.52;
  shadowBlob.scale.set(discR, discR, 1);
  const catcher = new THREE.Mesh(own(new THREE.PlaneGeometry(60, 60)), own(new THREE.ShadowMaterial({ opacity: 0.28 })));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.5;
  catcher.receiveShadow = true;
  scene.add(shadowBlob, catcher);

  // GN particles: green motes drifting back and down from the drive, fading out.
  const N = 90;
  const pPos = new Float32Array(N * 3);
  const pCol = new Float32Array(N * 3);
  const pVel = new Float32Array(N * 3);
  const pLife = new Float32Array(N);
  const pMax = new Float32Array(N).fill(1);
  const pGeo = own(new THREE.BufferGeometry());
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const dot = own(
    canvasTexture(64, (g, s) => {
      const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }),
  );
  const particles = new THREE.Points(
    pGeo,
    own(
      new THREE.PointsMaterial({
        size: 0.32,
        map: dot,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  particles.frustumCulled = false;
  scene.add(particles);
  const glowColor = new THREE.Color(PALETTE.glow);
  const at = new THREE.Vector3();
  const back = new THREE.Vector3();
  let spawn = 0;
  const stepParticles = (dt: number) => {
    // Only the Dynames emits; switching away lets the motes in the air fade out.
    if (cur.emitter) {
      cur.emitter.getWorldPosition(at);
      cur.emitter.getWorldDirection(back).negate();
      spawn += dt * 24;
    } else spawn = 0;
    for (let i = 0; i < N; i++) {
      const j = i * 3;
      if (pLife[i] <= 0) {
        if (spawn < 1) {
          pCol[j] = pCol[j + 1] = pCol[j + 2] = 0;
          continue;
        }
        spawn -= 1;
        const sp = 0.5 + Math.random() * 0.6;
        pPos[j] = at.x + (Math.random() - 0.5) * 0.3;
        pPos[j + 1] = at.y + (Math.random() - 0.5) * 0.3;
        pPos[j + 2] = at.z + (Math.random() - 0.5) * 0.3;
        pVel[j] = back.x * sp + (Math.random() - 0.5) * 0.5;
        pVel[j + 1] = -0.2 - Math.random() * 0.35;
        pVel[j + 2] = back.z * sp + (Math.random() - 0.5) * 0.5;
        pLife[i] = pMax[i] = 2.2 + Math.random() * 1.8;
      }
      pLife[i] -= dt;
      const drag = 1 - 0.35 * dt;
      pVel[j] *= drag;
      pVel[j + 1] = pVel[j + 1] * drag - 0.1 * dt;
      pVel[j + 2] *= drag;
      pPos[j] += pVel[j] * dt;
      pPos[j + 1] += pVel[j + 1] * dt;
      pPos[j + 2] += pVel[j + 2] * dt;
      const f = Math.max(0, pLife[i] / pMax[i]);
      const k = Math.sin(f * Math.PI) * 0.9;
      pCol[j] = glowColor.r * k;
      pCol[j + 1] = glowColor.g * k;
      pCol[j + 2] = glowColor.b * k;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  };

  // Camera: frames the suit and the disc, whatever the bench's shape.
  const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 200);
  const target = new THREE.Vector3(0, cur.height * 0.44, 0);
  let tilt = 0.12;
  let dist = 50;
  // Zoom: 1 frames everything; closer in, the view rises toward `focusY` (the head unless a spot was picked).
  let baseY = target.y;
  let headY = cur.height * 0.9;
  let zoom = 1;
  let zoomTo = 1;
  let focusY = headY;
  const place = () => {
    const k = Math.min(1, ((zoom - 1) / (MAX_ZOOM - 1)) * 1.4);
    target.y = baseY + (focusY - baseY) * k;
    const d = dist / zoom;
    camera.position.set(0, target.y + Math.sin(tilt) * d, Math.cos(tilt) * d);
    camera.lookAt(target);
  };
  const frame = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const byHeight = (cur.height + 1.6) / 2 / half;
    const byWidth = (discR * 2 + 1.5) / 2 / (half * camera.aspect);
    dist = Math.max(byHeight, byWidth) * 1.2;
    camera.updateProjectionMatrix();
    place();
  };

  const render = () => renderer.render(scene, camera);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    frame();
    if (!raf) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Spin, drag, pinch and zoom.
  const autoSpin = reducedMotion ? 0 : 0.24;
  let angle = -0.55;
  let vel = autoSpin;
  let drag: { id: number; x: number; y: number; t: number } | null = null;
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { spread: number; zoom: number } | null = null;
  /** After a press on the model, a plain wheel zooms until the pointer leaves it. */
  let engaged = false;
  let lastTap = { t: 0, x: 0, y: 0 };
  let downAt = { t: 0, x: 0, y: 0 };
  /** Dev only: hold a set pose for checks. */
  let frozen = false;
  const clampZoom = (z: number) => THREE.MathUtils.clamp(z, 1, MAX_ZOOM);
  const spread = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  };
  const ray = new THREE.Raycaster();
  /** Zoom in on the part under a point (or the head), or back out if already zoomed. */
  const toggleZoom = (clientX: number, clientY: number) => {
    if (zoomTo > 1.4) {
      zoomTo = 1;
    } else {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObject(cur.root, true).find((h: any) => h.object.isMesh);
      focusY = hit ? THREE.MathUtils.clamp(hit.point.y, 2, cur.height - 1) : headY;
      zoomTo = 2.6;
    }
    wake();
  };
  const onDown = (e: PointerEvent) => {
    engaged = true;
    downAt = { t: e.timeStamp, x: e.clientX, y: e.clientY };
    if (e.pointerType === 'touch') touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size >= 2) {
      // A second finger: pinch instead of turning.
      pinch = { spread: spread(), zoom: zoomTo };
      if (zoomTo <= 1.001) focusY = headY;
      drag = null;
      return;
    }
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // synthetic or already-released pointer
    }
    canvas.dataset.dragging = '';
    vel = 0;
    wake();
  };
  const onMove = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size >= 2) {
      zoomTo = zoom = clampZoom((pinch.zoom * spread()) / pinch.spread);
      place();
      wake();
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dt = Math.max(8, e.timeStamp - drag.t) / 1000;
    const turn = (e.clientX - drag.x) * 0.012;
    angle += turn;
    vel = vel * 0.5 + (turn / dt) * 0.5;
    if (e.pointerType === 'mouse') {
      tilt = THREE.MathUtils.clamp(tilt + (e.clientY - drag.y) * 0.004, -0.02, 0.45);
      place();
    }
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = e.timeStamp;
    wake();
  };
  const onUp = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
    // A quick second tap near the first zooms (mouse users get dblclick).
    if (e.type === 'pointerup' && e.pointerType === 'touch' && e.timeStamp - downAt.t < 250 && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 10) {
      if (e.timeStamp - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
        toggleZoom(e.clientX, e.clientY);
        lastTap = { t: 0, x: 0, y: 0 };
      } else lastTap = { t: e.timeStamp, x: e.clientX, y: e.clientY };
    }
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    delete canvas.dataset.dragging;
    vel = THREE.MathUtils.clamp(vel, -6, 6);
    wake();
  };
  const onWheel = (e: WheelEvent) => {
    // Pinch on a trackpad arrives as a wheel with ctrlKey. A plain wheel only zooms once the model's been grabbed,
    // and lets the page scroll when there's no further to zoom that way.
    if (!(e.ctrlKey || e.metaKey || engaged)) return;
    const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const next = clampZoom(zoomTo * Math.exp(-step * (e.ctrlKey ? 0.01 : 0.0022)));
    if (next === zoomTo) return;
    e.preventDefault();
    if (zoomTo <= 1.001) focusY = headY;
    zoomTo = next;
    wake();
  };
  const onDouble = (e: MouseEvent) => toggleZoom(e.clientX, e.clientY);
  const onLeave = () => {
    engaged = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDouble);

  let raf = 0;
  let active = false;
  let last = 0;
  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
    last = now;
    if (!drag && !frozen) {
      vel += (autoSpin - vel) * Math.min(1, dt * 1.6);
      angle += vel * dt;
    }
    turntable.rotation.y = angle;
    if (Math.abs(zoomTo - zoom) > 0.0005) {
      zoom += (zoomTo - zoom) * Math.min(1, dt * (reducedMotion ? 30 : 7));
      place();
    }
    if (!reducedMotion) {
      stepParticles(dt);
      if (cur.glow) cur.glow.emissiveIntensity = 1.8 + 0.4 * Math.sin(now / 650);
    }
    render();
    const moving = !reducedMotion || drag || Math.abs(vel - autoSpin) > 0.002 || Math.abs(zoomTo - zoom) > 0.0005;
    if (active && moving) raf = requestAnimationFrame(tick);
  };
  function wake() {
    if (active && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  resize();

  if (import.meta.env.DEV) {
    (window as unknown as { __bench: unknown }).__bench = {
      pose(a: number, t = tilt, z = 1, fy = headY) {
        frozen = true;
        angle = a;
        tilt = t;
        zoom = zoomTo = clampZoom(z);
        focusY = fy;
        place();
        turntable.rotation.y = angle;
        render();
      },
      release() {
        frozen = false;
      },
      meshes: dynames.meshCount,
      /** The kit on the turntable and three.js, for inspecting materials. */
      inspect: () => ({ root: cur.root, THREE, render }),
    };
  }

  // Loading and switching kits.
  const loader = new GLTFLoader();
  const pending = new Map<ModelId, Promise<OnBench>>();
  const load = (id: ModelId): Promise<OnBench> => {
    const have = models.get(id);
    if (have) return Promise.resolve(have);
    if (!pending.has(id)) {
      const cfg = GLB[id as Exclude<ModelId, 'dynames'>];
      pending.set(
        id,
        loader.loadAsync(cfg.url).then((gltf: any) => {
          // Stand it on the floor, centred, at the Dynames' height, facing the camera.
          const inner = gltf.scene;
          const box = new THREE.Box3().setFromObject(inner);
          const size = box.getSize(new THREE.Vector3());
          const k = dynames.size.height / size.y;
          inner.scale.multiplyScalar(k);
          inner.updateMatrixWorld(true);
          box.setFromObject(inner);
          const c = box.getCenter(new THREE.Vector3());
          inner.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
          const root = new THREE.Group();
          root.add(inner);
          root.rotation.y = cfg.yaw;
          root.updateMatrixWorld(true);
          inner.traverse((o: any) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          const all = new THREE.Box3().setFromObject(root);
          const m: OnBench = {
            root,
            height: all.max.y - all.min.y,
            radius: Math.max(-all.min.x, all.max.x, -all.min.z, all.max.z),
            dispose() {
              inner.traverse((o: any) => {
                if (!o.isMesh) return;
                o.geometry.dispose();
                for (const mat of [o.material].flat()) {
                  for (const v of Object.values(mat)) if ((v as any)?.isTexture) (v as any).dispose();
                  mat.dispose();
                }
              });
            },
          };
          models.set(id, m);
          return m;
        }),
      );
    }
    return pending.get(id)!;
  };
  let wanted: ModelId = 'dynames';

  return {
    show(id) {
      wanted = id;
      return load(id).then((m) => {
        if (wanted !== id || m === cur) return;
        turntable.remove(cur.root);
        cur = m;
        turntable.add(cur.root);
        discR = Math.max(5.6, cur.radius + 0.5);
        disc.scale.set(discR, 1, discR);
        shadowBlob.scale.set(discR, discR, 1);
        baseY = cur.height * 0.44;
        headY = cur.height * 0.9;
        focusY = headY;
        zoom = zoomTo = 1;
        frame();
        if (!raf) render();
      });
    },
    setActive(on) {
      active = on;
      if (on) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDouble);
      for (const o of owned) o.dispose();
      for (const m of models.values()) m.dispose();
      renderer.dispose();
    },
  };
}
