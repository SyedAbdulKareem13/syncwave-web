"use client";
import { Panel } from "./Panel";
import type { RoomApi } from "@/lib/useRoom";
import { trackArtCss, vinylLabel, trackTag } from "@/lib/comic";
import { clamp, formatMs } from "@/lib/util";

const WAVE = [34, 52, 40, 68, 46, 74, 38, 60, 82, 48, 58, 90, 44, 64, 36, 72, 50, 86, 42, 56, 70, 38, 62, 94, 46, 54, 78, 40, 66, 48, 80, 52, 60, 42, 74, 88, 46, 58, 36, 68, 50, 76, 44, 62, 84, 40, 54, 70, 48, 64, 38, 58];

const iconBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "grid",
  placeItems: "center",
  background: "#1f1830",
  border: "2.5px solid #000",
  color: "#F4F1FF",
  ...extra,
});

export function NowPlaying({ room, onAddClick }: { room: RoomApi; onAddClick: () => void }) {
  const t = room.track;
  const isHost = room.isHost;
  const dur = room.durationMs;
  const pct = dur > 0 ? clamp((room.positionMs / dur) * 100, 0, 100) : 0;
  const volPct = Math.round(room.volume * 100);
  const drift = isHost ? "STEERING" : room.skewMs == null ? "SYNCING" : `${Math.round(room.skewMs)}ms`;

  const seekTo = (clientX: number, el: HTMLElement) => {
    if (!isHost || dur <= 0) return;
    const r = el.getBoundingClientRect();
    const p = clamp((clientX - r.left) / r.width, 0, 1);
    room.seek(p * dur);
  };

  return (
    <Panel label="NOW PLAYING" labelBg="#FF2A6D" labelColor="#08070F" shadow="#FF2A6D" rotate={-1.5} padding="24px">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", marginTop: 10 }}>
        {/* ART + VINYL */}
        <div style={{ position: "relative", width: 200, height: 200, flex: "0 0 auto" }}>
          <div style={{ position: "absolute", inset: 0, border: "3px solid #000", boxShadow: "5px 5px 0 #000", overflow: "hidden" }}>
            {t?.artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.artworkUrl} alt={t.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: trackArtCss(t) }} />
            )}
            <div style={{ position: "absolute", inset: 0, opacity: 0.25, backgroundImage: "radial-gradient(#08070F 1.2px,transparent 1.5px)", backgroundSize: "7px 7px" }} />
            <div style={{ position: "absolute", left: 10, top: 10, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#08070F", background: "#FFE600", padding: "2px 6px", border: "1.5px solid #000" }}>{trackTag(t)}</div>
          </div>
          <div style={{ position: "absolute", right: -44, top: "50%", transform: "translateY(-50%)", width: 150, height: 150, borderRadius: "50%", background: "repeating-radial-gradient(#0c0a14 0 3px,#181225 3px 5px)", border: "3px solid #000", boxShadow: "4px 4px 0 rgba(0,0,0,.5)", zIndex: -1, animation: "spin12 3.2s steps(16) infinite", animationPlayState: room.isPlaying ? "running" : "paused" }}>
            <div style={{ position: "absolute", inset: 0, margin: "auto", width: 46, height: 46, borderRadius: "50%", background: vinylLabel(t), border: "2px solid #000", display: "grid", placeItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#08070F" }} />
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 data-testid="track-title" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(24px,3.2vw,38px)", lineHeight: 1, color: "#fff", textShadow: "2.5px 0 #FF2A6D,-2.5px 0 #1FE0FF" }}>
            {t ? t.title : isHost ? "DROP A TRACK" : "NOTHING PLAYING"}
          </h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#9A93B5", marginTop: 10 }}>
            {t?.artist ?? (isHost ? "Pick something to spin up the room" : "Waiting for the host…")}
          </div>
          {room.unresolved && t?.source === "local" && (
            <label className="cbtn-sm" style={{ display: "inline-flex", marginTop: 12, alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#08070F", background: "#FFE600", border: "2.5px solid #000", padding: "8px 11px" }}>
              PICK YOUR COPY OF “{t.fileName}” →
              <input type="file" accept="audio/*" className="hidden" data-testid="resolve-local" onChange={(e) => { const f = e.target.files?.[0]; if (f) room.resolveLocalFile(f); }} />
            </label>
          )}
          {/* live equalizer */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 42, marginTop: 18 }}>
            {Array.from({ length: 26 }).map((_, i) => {
              const d = (0.55 + (i % 5) * 0.13).toFixed(2);
              const delay = (i * 0.06).toFixed(2);
              return (
                <span key={i} style={{ flex: 1, minWidth: 0, height: "100%", transformOrigin: "bottom", borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg,#1FE0FF,#FF2A6D)", animation: `eqBar ${d}s ease-in-out ${delay}s infinite`, opacity: room.isPlaying ? 1 : 0.35, animationPlayState: room.isPlaying ? "running" : "paused" }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* START CTA when nothing is playing (host) */}
      {!t && isHost && (
        <button onClick={onAddClick} data-testid="start-music" className="cbtn" style={{ "--cs": "5px", "--csh": "8px", display: "inline-flex", alignItems: "center", gap: 10, marginTop: 22, fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", background: "linear-gradient(180deg,#FF4D8D,#FF2A6D)", padding: "14px 20px", border: "3px solid #000", letterSpacing: ".3px" } as React.CSSProperties}>
          DROP A TRACK
        </button>
      )}

      {/* WAVEFORM SCRUBBER (always present for a stable, accessible playhead) */}
      <div style={{ marginTop: 24 }}>
          <div
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(room.positionMs)}
            aria-disabled={!isHost}
            tabIndex={isHost ? 0 : -1}
            onClick={(e) => seekTo(e.clientX, e.currentTarget)}
            onKeyDown={(e) => {
              if (!isHost) return;
              if (e.key === "ArrowRight") room.seek(Math.min(dur, room.positionMs + 5000));
              if (e.key === "ArrowLeft") room.seek(Math.max(0, room.positionMs - 5000));
            }}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 2, height: 74, cursor: isHost ? "pointer" : "default" }}
          >
            {WAVE.map((h, i) => {
              const on = (i + 0.5) / WAVE.length <= pct / 100;
              return <span key={i} style={{ flex: 1, minWidth: 0, alignSelf: "center", height: `${h}%`, borderRadius: 2, background: on ? "linear-gradient(180deg,#1FE0FF,#FF2A6D)" : "#2a2440", boxShadow: on ? "0 0 7px rgba(255,42,109,.45)" : "none" }} />;
            })}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct.toFixed(2)}%`, width: 3, background: "#fff", boxShadow: "0 0 8px #fff", pointerEvents: "none" }}>
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2.5px solid #000", boxShadow: "0 0 0 2px #FF2A6D" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>
            <span data-testid="position-current" style={{ color: "#1FE0FF" }}>{formatMs(room.positionMs)}</span>
            <span style={{ color: "#6a6483" }}>{dur > 0 ? formatMs(dur) : "--:--"}</span>
          </div>
      </div>

      {/* TRANSPORT */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={room.prev} disabled={!isHost || !t} title="Previous" className="cbtn-sm" style={iconBtn({ width: 50, height: 50 })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6v12H4.4V6zM20 6.5v11L9.5 12z" /></svg>
        </button>
        <div style={{ position: "relative" }}>
          {room.isPlaying && (
            <>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #FF2A6D", animation: "pulseRing 1.2s steps(8) infinite", pointerEvents: "none" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #1FE0FF", animation: "pulseRing 1.2s steps(8) .6s infinite", pointerEvents: "none" }} />
            </>
          )}
          <button onClick={room.togglePlay} disabled={!isHost || !t} data-testid="toggle-play" aria-label={room.isPlaying ? "Pause" : "Play"} className="cbtn" style={{ "--cs": "5px", "--csh": "8px", position: "relative", display: "grid", placeItems: "center", width: 74, height: 74, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#FF4D8D,#FF2A6D 60%,#d11a55)", border: "3px solid #000", color: "#fff" } as React.CSSProperties}>
            {room.isPlaying ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.4" height="14" rx="1" /><rect x="13.6" y="5" width="4.4" height="14" rx="1" /></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 4 }}><path d="M7 5.5v13l12-6.5z" /></svg>
            )}
          </button>
        </div>
        <button onClick={room.next} disabled={!isHost || !t} title="Next" className="cbtn-sm" style={iconBtn({ width: 50, height: 50 })}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6.5v11L14.5 12zM17 6h2.6v12H17z" /></svg>
        </button>
      </div>

      {!isHost && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#08070F", background: "#FFE600", border: "2px solid #000", padding: "4px 9px", transform: "rotate(-1deg)" }}>🕷️ HOST IS STEERING</span>
        </div>
      )}

      {/* VOLUME + SYNC READOUT */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginTop: 22, paddingTop: 16, borderTop: "2px dashed #2c2440" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9A93B5"><path d="M4 9v6h4l5 5V4L8 9H4z" /></svg>
          <div
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volPct}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") room.setVolume(room.volume + 0.05);
              if (e.key === "ArrowLeft") room.setVolume(room.volume - 0.05);
            }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              room.setVolume(clamp((e.clientX - r.left) / r.width, 0, 1));
            }}
            style={{ position: "relative", width: 120, height: 10, background: "#08070F", border: "2px solid #2c2440", cursor: "pointer" }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${volPct}%`, background: "linear-gradient(90deg,#1FE0FF,#FF2A6D)" }} />
            <span style={{ position: "absolute", top: "50%", left: `${volPct}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "2.5px solid #000" }} />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#9A93B5", width: 34 }}>{volPct}%</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: "#6a6483" }}>
          SYNC ENGINE · {room.mode === "supabase" ? "LIVE" : "LOCAL"} · DRIFT <span style={{ color: "#C6FF00" }}>{drift}</span>
        </div>
      </div>
    </Panel>
  );
}
