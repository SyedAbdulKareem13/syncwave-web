import type { Track } from "../types";

/**
 * Uniform interface over the different ways a client can render its OWN copy of
 * a track (Section 8). The sync engine drives this; it never touches audio
 * bytes directly. `supportsRateNudge` tells the engine whether it can do the
 * inaudible playbackRate drift correction (HTML5 audio) or must fall back to
 * micro-seeks (YouTube's playback rates are too coarse).
 */
export interface PlaybackAdapter {
  readonly kind: "html5" | "youtube";
  readonly supportsRateNudge: boolean;
  /** Load + buffer the track, seek to 0, leave paused. Resolves when playable. */
  load(track: Track): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seekTo(ms: number): void;
  getPositionMs(): number;
  getDurationMs(): number;
  setRate(rate: number): void;
  isReady(): boolean;
  isPlaying(): boolean;
  onEnded(cb: () => void): void;
  destroy(): void;
}

/** Thrown when a local-file track can't be resolved on this device. */
export class UnresolvedTrackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnresolvedTrackError";
  }
}
