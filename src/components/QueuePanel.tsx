"use client";
import type { QueueItem } from "@/lib/types";

export function QueuePanel({
  queue,
  isHost,
  onRemove,
  onReorder,
  onAddClick,
}: {
  queue: QueueItem[];
  isHost: boolean;
  onRemove: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddClick: () => void;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...queue];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onReorder(next.map((q) => q.id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-text-muted">{queue.length} up next</span>
        <button
          onClick={onAddClick}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink"
          style={{ background: "rgb(var(--accent))" }}
        >
          + Add music
        </button>
      </div>
      {queue.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center text-sm text-text-muted">
          <div>
            <div className="text-2xl">🎶</div>
            <p className="mt-2">Queue is empty. Add a track to keep the vibe going.</p>
          </div>
        </div>
      ) : (
        <ul className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {queue.map((q, i) => (
            <li key={q.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/6">
              <span className="w-5 text-center text-xs text-text-muted tabular">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{q.track.title}</div>
                <div className="truncate text-xs text-text-muted">
                  {q.track.artist ?? q.track.source} · added by {q.addedByName}
                </div>
              </div>
              {isHost && (
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} className="px-1 text-text-muted hover:text-text-primary" aria-label="Move up">
                    ↑
                  </button>
                  <button onClick={() => move(i, 1)} className="px-1 text-text-muted hover:text-text-primary" aria-label="Move down">
                    ↓
                  </button>
                </div>
              )}
              <button onClick={() => onRemove(q.id)} className="px-1 text-text-muted hover:text-sync-bad" aria-label="Remove">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
