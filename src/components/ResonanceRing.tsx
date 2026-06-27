"use client";
import { useEffect, useRef } from "react";

type RGB = [number, number, number];

/**
 * THE signature element (Section 9.1). A concentric ring that breathes around
 * the album art. Critically, it's driven by the *synchronized playback
 * position* — not a local clock or a microphone — so the same frame renders on
 * every device in the room at the same instant. That shared breath IS the
 * visual proof of sync. Honors prefers-reduced-motion (steady calm glow).
 */
export function ResonanceRing({
  positionMs,
  isPlaying,
  accent,
  accent2,
  size = 320,
  children,
}: {
  positionMs: number;
  isPlaying: boolean;
  accent: RGB;
  accent2: RGB;
  size?: number;
  children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ pos: positionMs, ts: now(), playing: isPlaying });
  const accentRef = useRef({ accent, accent2 });

  // keep the latest synced position without restarting the animation loop
  useEffect(() => {
    live.current = { pos: positionMs, ts: now(), playing: isPlaying };
  }, [positionMs, isPlaying]);
  useEffect(() => {
    accentRef.current = { accent, accent2 };
  }, [accent, accent2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let raf = 0;
    const draw = () => {
      const t = now();
      const st = live.current;
      // Estimate the synced playhead between 200ms updates.
      const est = st.pos + (st.playing && !reduce ? t - st.ts : 0);
      const sec = est / 1000;

      // Layered, position-derived envelope: a slow breathe + a faux "beat".
      const breathe = 0.5 + 0.5 * Math.sin((sec * Math.PI * 2) / 4);
      const beat = st.playing ? Math.pow(0.5 + 0.5 * Math.sin(sec * Math.PI * 2 * (100 / 60)), 3) : 0;
      const env = reduce ? 0.32 : 0.3 + 0.42 * breathe + 0.28 * beat;

      const { accent: a, accent2: b } = accentRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.4;

      const rings = [
        { r: baseR + env * 14, w: 2.5, alpha: 0.9, c: a },
        { r: baseR + env * 26, w: 1.5, alpha: 0.5, c: b },
        { r: baseR + env * 42, w: 1, alpha: 0.22, c: a },
      ];
      for (const ring of rings) {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.c[0]}, ${ring.c[1]}, ${ring.c[2]}, ${ring.alpha})`;
        ctx.lineWidth = ring.w;
        ctx.shadowBlur = reduce ? 12 : 16 + env * 30;
        ctx.shadowColor = `rgba(${ring.c[0]}, ${ring.c[1]}, ${ring.c[2]}, 0.85)`;
        ctx.stroke();
      }
      ctx.restore();

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: size, height: size }}
        aria-hidden
      />
      <div style={{ position: "absolute", inset: size * 0.13 }}>{children}</div>
    </div>
  );
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
