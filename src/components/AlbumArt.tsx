"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Track } from "@/lib/types";

type RGB = [number, number, number];

/** Album art with a subtle parallax tilt; falls back to generated art. */
export function AlbumArt({ track, accent, accent2 }: { track: Track | null; accent: RGB; accent2: RGB }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 16 });

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="relative h-full w-full overflow-hidden rounded-[20px] shadow-2xl"
    >
      {track?.artworkUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
      ) : (
        <GeneratedArt accent={accent} accent2={accent2} title={track?.title ?? "SyncWave"} />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10" />
    </motion.div>
  );
}

function GeneratedArt({ accent, accent2, title }: { accent: RGB; accent2: RGB; title: string }) {
  const a = `rgb(${accent.join(",")})`;
  const b = `rgb(${accent2.join(",")})`;
  const initial = title.trim().charAt(0).toUpperCase() || "S";
  return (
    <div
      className="relative grid h-full w-full place-items-center"
      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-30">
        {[70, 52, 34].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="0.8" />
        ))}
      </svg>
      <span className="font-display text-[44%] font-bold text-white/90 drop-shadow">{initial}</span>
    </div>
  );
}
