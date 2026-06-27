import type { Track } from "../types";
import type { PlaybackAdapter } from "./PlaybackAdapter";
import { Html5AudioAdapter } from "./Html5AudioAdapter";
import { YouTubeAdapter } from "./YouTubeAdapter";

export { UnresolvedTrackError } from "./PlaybackAdapter";
export type { PlaybackAdapter } from "./PlaybackAdapter";

/** Which adapter kind a track needs. */
export function adapterKind(track: Track): "html5" | "youtube" {
  return track.source === "youtube" ? "youtube" : "html5";
}

export function createAdapter(kind: "html5" | "youtube"): PlaybackAdapter {
  return kind === "youtube" ? new YouTubeAdapter() : new Html5AudioAdapter();
}

// Browser autoplay policies block programmatic play() unless the page has had a
// user gesture. We "bless" audio on the join tap by playing a tiny silent clip;
// after that, the engine can start playback on a scheduled timer without a
// direct gesture. (Section 4.2's coordinated start fires from setTimeout.)
let unlocked = false;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export function isAudioUnlocked(): boolean {
  return unlocked;
}

export async function unlockAudio(): Promise<void> {
  if (unlocked || typeof window === "undefined") return;
  try {
    const a = new Audio(SILENT_WAV);
    a.volume = 0;
    await a.play();
    a.pause();
    unlocked = true;
  } catch {
    // Some browsers (Safari) still require a gesture per element; the room UI
    // re-prompts if a real play() is rejected.
  }
}
