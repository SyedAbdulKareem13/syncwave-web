"use client";
import { Panel } from "./Panel";
import type { QueueItem, Track } from "@/lib/types";
import { trackArtCss } from "@/lib/comic";
import { formatMs } from "@/lib/util";

export function QueueCard({
  queue,
  isHost,
  onPlay,
  onRemove,
  onAddClick,
}: {
  queue: QueueItem[];
  isHost: boolean;
  onPlay: (track: Track) => void;
  onRemove: (id: string) => void;
  onAddClick: () => void;
}) {
  return (
    <Panel label="UP NEXT" labelBg="#1FE0FF" shadow="#1FE0FF">
      <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, maxHeight: 300, overflowY: "auto" }}>
        {queue.length === 0 && <span style={{ color: "#9A93B5", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Queue&apos;s empty — add a track.</span>}
        {queue.map((q) => (
          <div key={q.id} className="qrow" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px" }}>
            <button onClick={() => isHost && onPlay(q.track)} disabled={!isHost} title={isHost ? "Play now" : ""} style={{ position: "relative", width: 38, height: 38, flex: "0 0 auto", border: "2px solid #000", overflow: "hidden", cursor: isHost ? "pointer" : "default", padding: 0, background: "transparent" }}>
              {q.track.artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.track.artworkUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ position: "absolute", inset: 0, background: trackArtCss(q.track) }} />
              )}
            </button>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#F4F1FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.track.title}</span>
              <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.track.artist ?? `added by ${q.addedByName}`}</span>
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6a6483", flex: "0 0 auto" }}>{q.track.durationMs ? formatMs(q.track.durationMs) : "--:--"}</span>
            <button onClick={() => onRemove(q.id)} title="Remove" aria-label="Remove from queue" style={{ flex: "0 0 auto", background: "transparent", border: 0, color: "#6a6483", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={onAddClick} className="dashbtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 12, fontFamily: "var(--font-display)", fontSize: 13, color: "#1FE0FF", background: "transparent", border: "2.5px dashed #1FE0FF", padding: 11, cursor: "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>ADD MUSIC
      </button>
    </Panel>
  );
}
