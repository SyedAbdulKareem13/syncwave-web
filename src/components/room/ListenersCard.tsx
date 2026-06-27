"use client";
import { Panel } from "./Panel";
import type { Member } from "@/lib/types";
import { comicColor, initial } from "@/lib/comic";

export function ListenersCard({ members, hostId, meId }: { members: Member[]; hostId: string; meId: string }) {
  const sorted = [...members].sort((a, b) => (a.userId === hostId ? -1 : b.userId === hostId ? 1 : 0));
  return (
    <Panel label="IN THE ROOM" labelBg="#C6FF00" shadow="#C6FF00" rotate={1.5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 8 }}>
        {sorted.length === 0 && <span style={{ color: "#9A93B5", fontSize: 13, padding: "10px 0" }}>Nobody here yet…</span>}
        {sorted.map((m) => {
          const col = comicColor(m.userId);
          const host = m.userId === hostId;
          const you = m.userId === meId;
          return (
            <div key={m.userId} data-testid="member" style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 36, height: 36, flex: "0 0 auto", borderRadius: "50%", border: "2.5px solid #000", background: col.c, color: col.tc, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 16, animation: "beatThump .92s steps(6) infinite" }}>
                {m.avatar || initial(m.name)}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#F4F1FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{you ? "You" : m.name}</span>
              {host && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: "#08070F", background: "#FFE600", padding: "2px 6px", border: "1.5px solid #000" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" /></svg>HOST
                </span>
              )}
              {you && !host && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: "#1FE0FF", border: "1.5px solid #1FE0FF", padding: "2px 6px" }}>YOU</span>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
