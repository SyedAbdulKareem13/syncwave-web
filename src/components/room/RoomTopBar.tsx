"use client";
import { useState } from "react";
import type { RoomApi } from "@/lib/useRoom";
import { comicColor, initial } from "@/lib/comic";

export function RoomTopBar({ room, roomId, onLeave }: { room: RoomApi; roomId: string; onLeave: () => void }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const drift = room.isHost ? "STEERING" : room.skewMs == null ? "SYNCING" : `${Math.round(room.skewMs)}ms`;
  const stack = room.members.slice(0, 4);

  const copy = async (what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(what === "code" ? roomId : `${window.location.origin}/room/${roomId}`);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, padding: "14px 24px", background: "linear-gradient(180deg,rgba(8,7,15,.92),rgba(8,7,15,.5))", backdropFilter: "blur(10px)", borderBottom: "2px solid #221836" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <button onClick={onLeave} className="cbtn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontSize: 12, color: "#F4F1FF", background: "#1f1830", border: "2.5px solid #000", padding: "9px 12px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>LEAVE
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", lineHeight: 1, textShadow: "1.5px 0 #FF2A6D,-1.5px 0 #1FE0FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{room.roomName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 5 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", color: "#1FE0FF", background: "#08070F", border: "1.5px solid #2c2440", padding: "2px 8px" }}>{roomId}</span>
            <button onClick={() => copy("code")} data-testid="room-code" title="Copy code" style={{ display: "grid", placeItems: "center", width: 26, height: 26, background: "#1f1830", border: "1.5px solid #2c2440", color: copied === "code" ? "#1FE0FF" : "#9A93B5", cursor: "pointer" }}>
              {copied === "code" ? "✓" : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div data-testid="sync-chip" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#08070F", background: "#C6FF00", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000", padding: "7px 11px" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#08070F", animation: "beatThump .92s steps(6) infinite" }} />
          ON THE BEAT · {room.mode === "supabase" ? "LIVE" : "LOCAL"} · DRIFT {drift}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {stack.map((m, i) => {
            const col = comicColor(m.userId);
            return (
              <span key={m.userId} style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #08070F", marginLeft: i === 0 ? 0 : -9, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 13, background: col.c, color: col.tc }}>
                {m.avatar || initial(m.name)}
              </span>
            );
          })}
          <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#9A93B5" }}>{room.members.length}</span>
        </div>
        <button onClick={() => copy("link")} className="cbtn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontSize: 12, color: "#08070F", background: "#1FE0FF", border: "2.5px solid #000", padding: "9px 13px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>{copied === "link" ? "COPIED!" : "INVITE"}
        </button>
      </div>
    </header>
  );
}
