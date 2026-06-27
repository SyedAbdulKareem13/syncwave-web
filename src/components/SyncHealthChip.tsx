"use client";
import type { SyncQuality } from "@/lib/types";
import { cx } from "@/lib/util";

const COLORS: Record<SyncQuality, string> = {
  ok: "#4ADE80",
  warn: "#FBBF24",
  bad: "#F87171",
  unknown: "#9A9AAE",
};

/**
 * The sync-health chip (Section 9.3) — reflects REAL measured skew. Green when
 * tight, amber as it degrades. For the host it reads "Steering" since the host
 * is the time reference.
 */
export function SyncHealthChip({
  skewMs,
  quality,
  isHost,
  mode,
}: {
  skewMs: number | null;
  quality: SyncQuality;
  isHost: boolean;
  mode: "supabase" | "local";
}) {
  const color = isHost ? "#4ADE80" : COLORS[quality];
  const label = isHost
    ? "Steering"
    : skewMs == null
      ? "Syncing…"
      : `Synced · ${Math.round(skewMs)}ms`;

  return (
    <div data-testid="sync-chip" className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
      <span
        className={cx("h-2.5 w-2.5 rounded-full", !isHost && quality !== "ok" && "animate-live-pulse")}
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
      <span className="tabular font-medium text-text-primary">{label}</span>
      <span className="text-xs text-text-muted">{mode === "supabase" ? "live" : "local"}</span>
    </div>
  );
}
