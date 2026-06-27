import type { Track } from "../types";
import { type PlaybackAdapter, UnresolvedTrackError } from "./PlaybackAdapter";
import { getLocalUrl } from "./localFiles";

/**
 * HTML5 <audio> adapter — used for the built-in demo catalog and for local
 * files. Crucially, `playbackRate` is continuous here, so the engine can nudge
 * it to 0.96–1.04× for a second to absorb drift with no audible glitch.
 */
export class Html5AudioAdapter implements PlaybackAdapter {
  readonly kind = "html5" as const;
  readonly supportsRateNudge = true;

  private el: HTMLAudioElement;
  private ready = false;
  private endedCb: (() => void) | null = null;
  private durationMs = 0;

  constructor() {
    this.el = new Audio();
    this.el.preload = "auto";
    // NOTE: deliberately NOT setting crossOrigin. Cross-origin audio (the demo
    // catalog, arbitrary mp3s) often lacks CORS headers; requesting it in CORS
    // mode would block the media load entirely. We don't need Web Audio
    // analysis here (the Resonance Ring is driven by the synced position), so
    // plain no-cors media playback is exactly right.
    // Keep pitch natural while rate-nudging.
    setPreservesPitch(this.el, true);
    this.el.addEventListener("ended", () => this.endedCb?.());
    this.el.addEventListener("durationchange", () => {
      if (isFinite(this.el.duration)) this.durationMs = this.el.duration * 1000;
    });
  }

  load(track: Track): Promise<void> {
    let src: string | undefined;
    if (track.source === "local") {
      src = track.fileName ? getLocalUrl(track.fileName) : undefined;
      if (!src) {
        return Promise.reject(new UnresolvedTrackError(track.fileName ?? "local file"));
      }
    } else {
      src = track.streamUrl;
    }
    if (!src) return Promise.reject(new UnresolvedTrackError(track.uri));

    this.ready = false;
    this.el.src = src;
    this.el.load();

    return new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        this.ready = true;
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load ${track.uri}`));
      };
      const cleanup = () => {
        this.el.removeEventListener("canplay", onReady);
        this.el.removeEventListener("loadeddata", onReady);
        this.el.removeEventListener("error", onError);
        clearTimeout(timer);
      };
      // Resolve once the element is seekable/playable; don't block forever on
      // slow networks. canplay (readyState>=3) or loadeddata (>=2) both mean
      // seekTo will land correctly.
      this.el.addEventListener("canplay", onReady, { once: true });
      this.el.addEventListener("loadeddata", onReady, { once: true });
      this.el.addEventListener("error", onError, { once: true });
      const timer = setTimeout(onReady, 8000); // last-resort; buffering continues
    });
  }

  async play(): Promise<void> {
    await this.el.play();
  }
  pause(): void {
    this.el.pause();
  }
  seekTo(ms: number): void {
    try {
      this.el.currentTime = Math.max(0, ms / 1000);
    } catch {
      /* element not ready to seek yet */
    }
  }
  getPositionMs(): number {
    return this.el.currentTime * 1000;
  }
  getDurationMs(): number {
    return this.durationMs || (isFinite(this.el.duration) ? this.el.duration * 1000 : 0);
  }
  setRate(rate: number): void {
    this.el.playbackRate = rate;
    setPreservesPitch(this.el, true);
  }
  setVolume(volume: number): void {
    this.el.volume = Math.max(0, Math.min(1, volume));
  }
  isReady(): boolean {
    return this.ready;
  }
  isPlaying(): boolean {
    return !this.el.paused && !this.el.ended;
  }
  onEnded(cb: () => void): void {
    this.endedCb = cb;
  }
  destroy(): void {
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
    this.endedCb = null;
  }
}

function setPreservesPitch(el: HTMLAudioElement, value: boolean): void {
  const anyEl = el as unknown as Record<string, boolean>;
  if ("preservesPitch" in anyEl) anyEl.preservesPitch = value;
  if ("mozPreservesPitch" in anyEl) anyEl.mozPreservesPitch = value;
  if ("webkitPreservesPitch" in anyEl) anyEl.webkitPreservesPitch = value;
}
