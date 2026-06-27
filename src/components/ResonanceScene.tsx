"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type RGB = [number, number, number];

/**
 * WebGL "Resonance" backdrop — a living, audio-reactive 3D field rendered behind
 * the album art. Like the Resonance Ring, its energy envelope is derived from
 * the *synchronized playback position*, so the scene breathes identically on
 * every device in the room. Honors prefers-reduced-motion (renders one calm
 * frame, no animation loop). Pure three.js (no extra renderer deps) so it always
 * builds.
 */
export function ResonanceScene({
  positionMs,
  isPlaying,
  accent,
  accent2,
  className,
}: {
  positionMs: number;
  isPlaying: boolean;
  accent: RGB;
  accent2: RGB;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const live = useRef({ pos: positionMs, ts: nowMs(), playing: isPlaying });
  const colors = useRef({ a: toColor(accent), b: toColor(accent2) });

  useEffect(() => {
    live.current = { pos: positionMs, ts: nowMs(), playing: isPlaying };
  }, [positionMs, isPlaying]);
  useEffect(() => {
    colors.current = { a: toColor(accent), b: toColor(accent2) };
  }, [accent, accent2]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 7;

    // ── central pulsing wireframe icosahedron ──────────────────────────────
    const icoGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: colors.current.a.clone(),
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const icoGlow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 1),
      new THREE.MeshBasicMaterial({ color: colors.current.b.clone(), wireframe: true, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }),
    );
    scene.add(icoGlow);

    // ── particle nebula on a sphere shell ──────────────────────────────────
    const COUNT = 1400;
    const positions = new Float32Array(COUNT * 3);
    const baseRadius = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // even-ish sphere distribution
      const u = (i + 0.5) / COUNT;
      const phi = Math.acos(1 - 2 * u);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.6 + (i % 7) * 0.12;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      baseRadius[i] = r;
      seed[i] = (i % 13) / 13;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      map: softSprite(),
      color: colors.current.a.clone(),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    const tmp = new THREE.Color();
    let raf = 0;

    const render = () => {
      const st = live.current;
      const est = st.pos + (st.playing && !reduce ? nowMs() - st.ts : 0);
      const sec = est / 1000;
      const breathe = 0.5 + 0.5 * Math.sin((sec * Math.PI * 2) / 4);
      const beat = st.playing ? Math.pow(0.5 + 0.5 * Math.sin(sec * Math.PI * 2 * (100 / 60)), 3) : 0;
      const energy = reduce ? 0.3 : 0.28 + 0.4 * breathe + 0.3 * beat;

      const a = colors.current.a;
      const b = colors.current.b;

      // icosahedron: rotate + pulse, colour-lerp on the beat
      ico.rotation.x = sec * 0.18;
      ico.rotation.y = sec * 0.24;
      const s = 1 + energy * 0.28;
      ico.scale.setScalar(s);
      icoGlow.rotation.copy(ico.rotation);
      icoGlow.scale.setScalar(s * (1.02 + energy * 0.06));
      (ico.material as THREE.MeshBasicMaterial).color.copy(tmp.copy(a).lerp(b, beat * 0.6));
      (ico.material as THREE.MeshBasicMaterial).opacity = 0.4 + energy * 0.35;

      // particles: breathe radially + drift, colour follows accent
      const arr = pGeo.attributes.position.array as Float32Array;
      const pulse = 1 + energy * 0.16;
      for (let i = 0; i < COUNT; i++) {
        const r = baseRadius[i] * (pulse + 0.05 * Math.sin(sec * 1.5 + seed[i] * 6.28));
        const u = (i + 0.5) / COUNT;
        const phi = Math.acos(1 - 2 * u);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i + sec * 0.05;
        arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i * 3 + 2] = r * Math.cos(phi);
      }
      pGeo.attributes.position.needsUpdate = true;
      (points.material as THREE.PointsMaterial).color.copy(tmp.copy(a).lerp(b, 0.3 + beat * 0.3));
      (points.material as THREE.PointsMaterial).size = 0.05 + energy * 0.05;

      points.rotation.y = sec * 0.04;
      camera.position.x = Math.sin(sec * 0.1) * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) render();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      icoGeo.dispose();
      pGeo.dispose();
      icoMat.dispose();
      (icoGlow.material as THREE.Material).dispose();
      icoGlow.geometry.dispose();
      pMat.dispose();
      pMat.map?.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function toColor(rgb: RGB): THREE.Color {
  return new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
}

/** A soft radial sprite so particles glow instead of being hard squares. */
function softSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
