"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/types";
import { DEMO_TRACKS } from "@/lib/tracks";
import { registerLocalFile } from "@/lib/audio/localFiles";
import { cx } from "@/lib/util";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-ink/60 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass w-full max-w-lg rounded-t-card sm:rounded-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Add music</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-white/6 p-1 text-sm">
          {(["demo", "youtube", "local"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                "flex-1 rounded-full py-1.5 capitalize transition",
                tab === t ? "bg-white/14 text-text-primary" : "text-text-muted",
              )}
            >
              {t === "demo" ? "Featured" : t}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto no-scrollbar">
          {tab === "demo" && <DemoList canPlayNow={canPlayNow} onSelect={onSelect} />}
          {tab === "youtube" && <YouTubeTab canPlayNow={canPlayNow} onSelect={onSelect} />}
          {tab === "local" && <LocalTab canPlayNow={canPlayNow} onSelect={onSelect} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({
  title,
  subtitle,
  art,
  canPlayNow,
  onSelect,
}: {
  title: string;
  subtitle: string;
  art?: React.ReactNode;
  canPlayNow: boolean;
  onSelect: (mode: Mode) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/6">
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10">{art}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-text-muted">{subtitle}</div>
      </div>
      <button
        onClick={() => onSelect("queue")}
        data-testid="picker-queue"
        className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium hover:bg-white/14"
      >
        Queue
      </button>
      {canPlayNow && (
        <button
          onClick={() => onSelect("play")}
          data-testid="picker-play"
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink"
          style={{ background: "rgb(var(--accent))" }}
        >
          Play
        </button>
      )}
    </div>
  );
}

function DemoList({ canPlayNow, onSelect }: { canPlayNow: boolean; onSelect: (t: Track, m: Mode) => void }) {
  return (
    <div className="space-y-1">
      {DEMO_TRACKS.map((t) => (
        <Row
          key={t.uri}
          title={t.title}
          subtitle={t.artist ?? "Demo"}
          art={<span className="text-lg">🎵</span>}
          canPlayNow={canPlayNow}
          onSelect={(m) => onSelect(t, m)}
        />
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
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Paste a YouTube link or search…"
          aria-label="Paste a YouTube link or search for a track"
          className="flex-1 rounded-full bg-white/8 px-4 py-2 text-sm outline-none placeholder:text-text-muted focus:bg-white/12"
        />
        <button onClick={run} className="rounded-full px-4 py-2 text-sm font-semibold text-ink" style={{ background: "rgb(var(--accent))" }}>
          {loading ? "…" : "Go"}
        </button>
      </div>
      {disabled && (
        <p className="text-xs text-text-muted">
          In-app search is off (no YOUTUBE_API_KEY). You can still paste any YouTube link above — that always works.
        </p>
      )}
      <div className="space-y-1">
        {results.map((r) => (
          <Row
            key={r.youtubeId}
            title={r.title}
            subtitle={r.artist}
            art={
              r.artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.artworkUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>▶️</span>
              )
            }
            canPlayNow={canPlayNow}
            onSelect={(m) =>
              onSelect(
                { uri: `yt:${r.youtubeId}`, source: "youtube", title: r.title, artist: r.artist, youtubeId: r.youtubeId, artworkUrl: r.artworkUrl ?? undefined },
                m,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function LocalTab({ canPlayNow, onSelect }: { canPlayNow: boolean; onSelect: (t: Track, m: Mode) => void }) {
  return (
    <div className="space-y-3 py-2">
      <label className="block">
        <div className="glass cursor-pointer rounded-card p-6 text-center hover:bg-white/10">
          <div className="text-3xl">📁</div>
          <div className="mt-2 text-sm font-medium">Choose an audio file</div>
          <div className="mt-1 text-xs text-text-muted">Plays from this device only</div>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(registerLocalFile(file), canPlayNow ? "play" : "queue");
            }}
          />
        </div>
      </label>
      <p className="text-xs text-text-muted">
        Local files live on your device. For everyone to hear it in sync, each listener needs the same file — otherwise
        they stay in the room muted. For cross-device sync, Featured tracks and YouTube links are the easy path.
      </p>
    </div>
  );
}
