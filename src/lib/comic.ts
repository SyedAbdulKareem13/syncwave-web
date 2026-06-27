import type { Track } from "./types";
import { accentFromUri, hashString } from "./util";

// Earth-1610 accent palette used for avatars, room stripes, etc.
export const COMIC_PALETTE: Array<{ c: string; tc: string }> = [
  { c: "#FF2A6D", tc: "#ffffff" },
  { c: "#1FE0FF", tc: "#08070F" },
  { c: "#FFE600", tc: "#08070F" },
  { c: "#FF3B3B", tc: "#ffffff" },
  { c: "#C6FF00", tc: "#08070F" },
  { c: "#7B2FF7", tc: "#ffffff" },
  { c: "#19E3FF", tc: "#08070F" },
];

export function comicColor(seed: string): { c: string; tc: string } {
  return COMIC_PALETTE[Math.abs(hashString(seed)) % COMIC_PALETTE.length];
}

export function initial(name: string): string {
  return (name.trim().charAt(0) || "?").toUpperCase();
}

function rgb(c: [number, number, number]): string {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Comic CSS gradient art for a track (used when there's no artwork image). */
export function trackArtCss(track: Track | null): string {
  if (!track) return "radial-gradient(circle at 32% 28%,#FF4D8D,#FF2A6D 52%,#3A0CA3)";
  const a = track.accent ?? accentFromUri(track.uri);
  const b = track.accent2 ?? accentFromUri(track.uri + "·2");
  return `radial-gradient(circle at 32% 28%,${rgb(a)},${rgb(b)} 55%,#3A0CA3)`;
}

/** Vinyl-label colour for a track. */
export function vinylLabel(track: Track | null): string {
  if (track?.accent) return rgb(track.accent);
  return "#FFE600";
}

/** A short genre-style tag derived from the source. */
export function trackTag(track: Track | null): string {
  if (!track) return "—";
  if (track.source === "demo") return "FEATURED";
  if (track.source === "youtube") return "YOUTUBE";
  if (track.source === "local") return "LOCAL FILE";
  return "TRACK";
}
