import type { Track } from "./types";
import { accentFromUri, ensureReadableAccent } from "./util";

export type AccentPair = { accent: [number, number, number]; accent2: [number, number, number] };

/**
 * Resolve the dynamic accent pair for a track (Section 9.1 — "living gradient
 * sampled from the current album art"). Strategy, in order:
 *   1. Pre-baked accents on the track (demo catalog) — always good-looking.
 *   2. Canvas sampling of the artwork, if it loads CORS-clean.
 *   3. Deterministic hash of the uri, so theming is stable & never ugly.
 */
export async function resolveAccents(track: Track | null): Promise<AccentPair> {
  const raw = await resolveAccentsRaw(track);
  // Floor luminance so dark-ink text on accent backgrounds always passes AA.
  return { accent: ensureReadableAccent(raw.accent), accent2: ensureReadableAccent(raw.accent2) };
}

async function resolveAccentsRaw(track: Track | null): Promise<AccentPair> {
  if (!track) return { accent: [124, 92, 255], accent2: [40, 200, 220] };
  if (track.accent && track.accent2) return { accent: track.accent, accent2: track.accent2 };

  if (track.artworkUrl && typeof document !== "undefined") {
    try {
      const pair = await sampleImage(track.artworkUrl);
      if (pair) return pair;
    } catch {
      /* fall through to hash */
    }
  }
  const a = accentFromUri(track.uri);
  const b = accentFromUri(track.uri + "·2");
  return { accent: a, accent2: b };
}

function sampleImage(url: string): Promise<AccentPair | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = 24;
        const h = 24;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h); // throws if tainted
        const buckets = new Map<string, { r: number; g: number; b: number; n: number; sat: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const cur = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, sat: 0 };
          cur.r += r;
          cur.g += g;
          cur.b += b;
          cur.n += 1;
          cur.sat += sat;
          buckets.set(key, cur);
        }
        const ranked = [...buckets.values()]
          .map((c) => ({ r: c.r / c.n, g: c.g / c.n, b: c.b / c.n, score: c.n * (0.4 + (c.sat / c.n) * 0.6) }))
          .sort((a, b) => b.score - a.score);
        if (ranked.length === 0) return resolve(null);
        const top = ranked[0];
        const second = ranked[1] ?? ranked[0];
        resolve({
          accent: [Math.round(top.r), Math.round(top.g), Math.round(top.b)],
          accent2: [Math.round(second.r), Math.round(second.g), Math.round(second.b)],
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
