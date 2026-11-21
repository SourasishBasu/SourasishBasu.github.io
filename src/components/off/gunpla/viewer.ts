/**
 * The Gunpla bench viewer: the Dynames model on a turntable. The canvas is
 * transparent, so the bench's cutting mat (CSS) shows behind it, with the
 * turntable's shadow drawn onto it. It turns slowly; drag sideways to turn it
 * yourself (vertical drags still scroll the page on touch screens), and mouse
 * drags up and down tilt the view a little. GN particles drift from the drive.
 *
 * Runs only while active (on screen and selected). With reduced motion it
 * doesn't spin or emit; it draws a still frame and moves only when dragged.
 * setDither(true) adds an ordered-dither pass (4×4 Bayer, a few levels per channel).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildDynames, PALETTE } from './dynames';

export interface BenchViewer {
  setActive(on: boolean): void;
  setDither(on: boolean): void;
  dispose(): void;
}

const DitherShader = {
  uniforms: { tDiffuse: { value: null }, cell: { value: 2 }, levels: { value: 5 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float cell;
    uniform float levels;
    varying vec2 vUv;
    const float BAYER[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = mod(floor(gl_FragCoord.xy / cell), 4.0);
      float t = (BAYER[int(q.x + q.y * 4.0)] + 0.5) / 16.0;
      vec3 rgb = floor(c.rgb * (levels - 1.0) + t) / (levels - 1.0);
      float a = step(t, c.a);
      gl_FragColor = vec4(rgb * a, a);
    }`,
};

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

  const model = buildDynames();
  owned.push(model);
  const turntable = new THREE.Group();
  turntable.add(model.root);
  scene.add(turntable);

  // Turntable: a dark disc with tick marks round its rim, like the artboard's.
  const discR = Math.max(5.6, model.size.radius + 0.5);
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
  const disc = new THREE.Mesh(own(new THREE.CylinderGeometry(discR, discR + 0.15, 0.5, 96)), [discSide, discTop, discSide]);
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
    own(new THREE.PlaneGeometry(discR * 3, discR * 3)),
    own(new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false })),
  );
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = -0.52;
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
    model.emitter.getWorldPosition(at);
    model.emitter.getWorldDirection(back).negate();
    spawn += dt * 24;
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
  const target = new THREE.Vector3(0, model.size.height * 0.44, 0);
  let tilt = 0.12;
  let dist = 50;
  const place = () => {
    camera.position.set(0, target.y + Math.sin(tilt) * dist, Math.cos(tilt) * dist);
    camera.lookAt(target);
  };
  const frame = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const byHeight = (model.size.height + 1.6) / 2 / half;
    const byWidth = (discR * 2 + 1.5) / 2 / (half * camera.aspect);
    dist = Math.max(byHeight, byWidth) * 1.2;
    camera.updateProjectionMatrix();
    place();
  };

  let composer: any = null;
  let dither = false;
  const render = () => (dither && composer ? composer.render() : renderer.render(scene, camera));

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    frame();
    if (!raf) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Spin and drag.
  const autoSpin = reducedMotion ? 0 : 0.24;
  let angle = -0.55;
  let vel = autoSpin;
  let drag: { id: number; x: number; y: number; t: number } | null = null;
  /** Dev only: hold a set pose for checks. */
  let frozen = false;
  const onDown = (e: PointerEvent) => {
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
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    delete canvas.dataset.dragging;
    vel = THREE.MathUtils.clamp(vel, -6, 6);
    wake();
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

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
    if (!reducedMotion) {
      stepParticles(dt);
      model.glow.emissiveIntensity = 1.8 + 0.4 * Math.sin(now / 650);
    }
    render();
    const moving = !reducedMotion || drag || Math.abs(vel - autoSpin) > 0.002;
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
      pose(a: number, t = tilt) {
        frozen = true;
        angle = a;
        tilt = t;
        place();
        turntable.rotation.y = angle;
        render();
      },
      release() {
        frozen = false;
      },
      meshes: model.meshCount,
    };
  }

  return {
    setActive(on) {
      active = on;
      if (on) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setDither(on) {
      dither = on;
      if (on && !composer) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new OutputPass());
        const pass = new ShaderPass(DitherShader);
        pass.uniforms.cell.value = renderer.getPixelRatio();
        composer.addPass(pass);
        composer.setSize(canvas.clientWidth, canvas.clientHeight);
      }
      if (!raf) render();
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      composer?.dispose();
      for (const o of owned) o.dispose();
      renderer.dispose();
    },
  };
}
