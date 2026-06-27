"use client";
import { useEffect, useRef, useState } from "react";
import { clamp, formatMs } from "@/lib/util";

/**
 * The shared, locked playhead (Section 9.3). One timeline that visually says
 * "everyone is on the same instant." The host can scrub; listeners see it
 * locked. While the host drags we hold a local value so it doesn't fight the
 * incoming position stream.
 */
export function Timeline({
  positionMs,
  durationMs,
  canScrub,
  onSeek,
}: {
  positionMs: number;
  durationMs: number;
  canScrub: boolean;
  onSeek: (ms: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const max = Math.max(1, durationMs);
  const value = dragging ? dragValue : clamp(positionMs, 0, max);
  const pct = (value / max) * 100;
  const liveRef = useRef(positionMs);
  liveRef.current = positionMs;

  useEffect(() => {
    if (!dragging) return;
    const up = () => {
      setDragging(false);
      onSeek(dragValue);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragging, dragValue, onSeek]);

  return (
    <div className="w-full">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{ width: `${pct}%`, background: "rgb(var(--accent))", boxShadow: "0 0 12px rgb(var(--accent) / 0.7)" }}
        />
        <input
          type="range"
          className="timeline relative"
          min={0}
          max={max}
          value={value}
          disabled={!canScrub}
          onChange={(e) => {
            setDragValue(Number(e.target.value));
            setDragging(true);
          }}
          aria-label="Playback position"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs tabular text-text-muted">
        <span>{formatMs(value)}</span>
        <span>{durationMs ? formatMs(durationMs) : "--:--"}</span>
      </div>
    </div>
  );
}
