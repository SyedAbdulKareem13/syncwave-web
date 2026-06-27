"use client";
import { useState } from "react";
import type { Track } from "@/lib/types";
import { DEMO_TRACKS } from "@/lib/tracks";
import { registerLocalFile } from "@/lib/audio/localFiles";
import { trackArtCss } from "@/lib/comic";

type Mode = "play" | "queue";
interface SearchResult {
  youtubeId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
}

export function TrackPicker({
  canPlayNow,
  onSelect,
  onClose,
}: {
  canPlayNow: boolean;
  onSelect: (track: Track, mode: Mode) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"demo" | "youtube" | "local">("demo");

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="picker-title" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, display: "grid", placeItems: "center", background: "rgba(8,7,15,.72)", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#14101F", border: "3px solid #000", boxShadow: "10px 10px 0 #FF2A6D", padding: 22, maxHeight: "86vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 id="picker-title" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, color: "#fff" }} className="chroma">ADD MUSIC</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: 0, color: "#9A93B5", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#08070F", border: "2px solid #2c2440", padding: 4 }}>
          {(["demo", "youtube", "local"] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "8px 0", cursor: "pointer", border: "2px solid #000", background: tab === tb ? "#FF2A6D" : "#1f1830", color: tab === tb ? "#fff" : "#9A93B5" }}>
              {tb === "demo" ? "FEATURED" : tb}
            </button>
          ))}
        </div>

        <div className="no-scrollbar" style={{ overflowY: "auto" }}>
          {tab === "demo" && <DemoList canPlayNow={canPlayNow} onSelect={onSelect} />}
          {tab === "youtube" && <YouTubeTab canPlayNow={canPlayNow} onSelect={onSelect} />}
          {tab === "local" && <LocalTab canPlayNow={canPlayNow} onSelect={onSelect} />}
        </div>
      </div>
    </div>
  );
}

function Row({ title, subtitle, art, canPlayNow, onSelect }: { title: string; subtitle: string; art: React.ReactNode; canPlayNow: boolean; onSelect: (m: Mode) => void }) {
  return (
    <div className="qrow" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, flex: "0 0 auto", border: "2px solid #000", overflow: "hidden", position: "relative", display: "grid", placeItems: "center", background: "#1f1830" }}>{art}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F4F1FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
      </div>
      <button onClick={() => onSelect("queue")} data-testid="picker-queue" className="cbtn-sm" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#08070F", background: "#1FE0FF", border: "2px solid #000", padding: "6px 10px" }}>QUEUE</button>
      {canPlayNow && (
        <button onClick={() => onSelect("play")} data-testid="picker-play" className="cbtn-sm" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#fff", background: "#FF2A6D", border: "2px solid #000", padding: "6px 10px" }}>PLAY</button>
      )}
    </div>
  );
}

function DemoList({ canPlayNow, onSelect }: { canPlayNow: boolean; onSelect: (t: Track, m: Mode) => void }) {
  return (
    <div>
      {DEMO_TRACKS.map((t) => (
        <Row key={t.uri} title={t.title} subtitle={t.artist ?? "Demo"} art={<span style={{ position: "absolute", inset: 0, background: trackArtCss(t) }} />} canPlayNow={canPlayNow} onSelect={(m) => onSelect(t, m)} />
      ))}
    </div>
  );
}

function parseYouTube(input: string): string | null {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubeTab({ canPlayNow, onSelect }: { canPlayNow: boolean; onSelect: (t: Track, m: Mode) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const id = parseYouTube(q);
    if (id) {
      onSelect({ uri: `yt:${id}`, source: "youtube", title: "YouTube track", youtubeId: id, artworkUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` }, canPlayNow ? "play" : "queue");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: SearchResult[]; disabled?: boolean };
      setDisabled(Boolean(data.disabled));
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="Paste a YouTube link or search…" aria-label="Paste a YouTube link or search for a track" className="comic-input" style={{ fontSize: 13, padding: "9px 11px" }} />
        <button onClick={run} className="cbtn-sm" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "#08070F", background: "#1FE0FF", border: "2.5px solid #000", padding: "0 14px" }}>{loading ? "…" : "GO"}</button>
      </div>
      {disabled && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5", margin: "0 0 10px" }}>In-app search is off (no API key). Paste any YouTube link above — that always works.</p>}
      {results.map((r) => (
        <Row
          key={r.youtubeId}
          title={r.title}
          subtitle={r.artist}
          art={r.artworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.artworkUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : <span>▶️</span>}
          canPlayNow={canPlayNow}
          onSelect={(m) => onSelect({ uri: `yt:${r.youtubeId}`, source: "youtube", title: r.title, artist: r.artist, youtubeId: r.youtubeId, artworkUrl: r.artworkUrl ?? undefined }, m)}
        />
      ))}
    </div>
  );
}

function LocalTab({ canPlayNow, onSelect }: { canPlayNow: boolean; onSelect: (t: Track, m: Mode) => void }) {
  return (
    <div>
      <label style={{ display: "block", cursor: "pointer" }}>
        <div className="dashbtn" style={{ border: "2.5px dashed #1FE0FF", padding: 24, textAlign: "center", color: "#1FE0FF" }}>
          <div style={{ fontSize: 28 }}>📁</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 8 }}>CHOOSE AN AUDIO FILE</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5", marginTop: 4 }}>plays from this device only</div>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(registerLocalFile(f), canPlayNow ? "play" : "queue"); }} />
        </div>
      </label>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5", marginTop: 12, lineHeight: 1.5 }}>Local files live on your device. For everyone to hear it in sync, each listener picks the same file — otherwise they stay in the room muted. Featured tracks &amp; YouTube links are the easy cross-device path.</p>
    </div>
  );
}
