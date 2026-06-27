"use client";
import type { LobbyRoom } from "@/lib/types";
import { comicColor } from "@/lib/comic";

export function RoomCard({ room, onJoin }: { room: LobbyRoom; onJoin: () => void }) {
  const accent = room.accent ? `rgb(${room.accent.join(",")})` : comicColor(room.roomId).c;
  const tag = room.trackArtist ? room.trackArtist.toUpperCase().slice(0, 12) : "LIVE";

  return (
    <div className="roomcard" style={{ position: "relative", padding: "18px 18px 16px", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: accent }} />
      <div style={{ position: "absolute", right: -10, top: -10, width: 70, height: 70, opacity: 0.5, backgroundImage: `radial-gradient(${accent} 1.3px,transparent 1.6px)`, backgroundSize: "7px 7px" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, position: "relative" }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.name}</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#9A93B5", marginTop: 4 }}>@{room.hostName}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: "0 0 auto", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#08070F", background: accent, padding: "4px 8px", border: "2px solid #000" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.4" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0z" /><circle cx="17" cy="9" r="2.6" /><path d="M15 20a5 5 0 0 1 6.5-4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          {room.listeners}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, background: "#08070F", border: "1.5px solid #2c2440", padding: "8px 10px", position: "relative" }}>
        <span style={{ display: "inline-flex", width: 24, height: 24, flex: "0 0 auto", alignItems: "center", justifyContent: "center", background: accent, borderRadius: "50%", color: "#08070F" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.5v13l11-6.5z" /></svg>
        </span>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16, flex: "0 0 auto" }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} style={{ width: 3, height: "100%", background: accent, transformOrigin: "bottom", animation: `eqBar .7s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#d8d3e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.trackTitle ?? "Idle"}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: accent, border: `1.5px solid ${accent}`, padding: "3px 7px" }}>{tag}</span>
        <button
          onClick={onJoin}
          className="cbtn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontSize: 13, color: "#fff", background: "#1f1830", border: "2.5px solid #000", padding: "9px 14px" }}
        >
          JOIN
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
