import type { Track } from "../types";
import type { PlaybackAdapter } from "./PlaybackAdapter";

// YouTube IFrame adapter. Each client streams the SAME video id directly from
// YouTube (never proxied), so it's a licensing-clean way to "play anything."
// Note: YouTube only exposes coarse playback rates, so rate-nudge is off here —
// the engine falls back to micro-seek drift correction for YouTube tracks.

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  cueVideoById(opts: { videoId: string; startSeconds?: number }): void;
  mute(): void;
  unMute(): void;
  setPlaybackRate(rate: number): void;
  getPlayerState(): number;
  destroy(): void;
}

let apiLoading: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoading) return apiLoading;
  apiLoading = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiLoading;
}

export class YouTubeAdapter implements PlaybackAdapter {
  readonly kind = "youtube" as const;
  readonly supportsRateNudge = false;

  private player: YTPlayer | null = null;
  private container: HTMLDivElement | null = null;
  private ready = false;
  private endedCb: (() => void) | null = null;
  private currentId: string | null = null;
  private cueResolve: (() => void) | null = null;

  private ensureContainer(): HTMLDivElement {
    if (this.container) return this.container;
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.left = "-9999px";
    host.style.top = "0";
    host.setAttribute("aria-hidden", "true");
    const inner = document.createElement("div");
    host.appendChild(inner);
    document.body.appendChild(host);
    this.container = inner;
    return inner;
  }

  async load(track: Track): Promise<void> {
    const videoId = track.youtubeId ?? track.uri.replace(/^yt:/, "");
    await loadApi();
    const inner = this.ensureContainer();
    this.ready = false;

    if (!this.player) {
      await new Promise<void>((resolve) => {
        this.player = new window.YT!.Player(inner, {
          width: "1",
          height: "1",
          videoId,
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
          events: {
            onReady: () => {
              this.ready = true;
              this.currentId = videoId;
              resolve();
            },
            onStateChange: (e: { data: number }) => {
              if (!window.YT) return;
              if (e.data === window.YT.PlayerState.ENDED) this.endedCb?.();
              // Resolve a pending cue once the new video is actually ready.
              if (
                (e.data === window.YT.PlayerState.CUED || e.data === window.YT.PlayerState.PLAYING) &&
                this.cueResolve
              ) {
                this.cueResolve();
              }
            },
          },
        });
      });
      return;
    }

    // Reuse the player for subsequent tracks, but DON'T report ready until the
    // new video is actually cued/buffered (CUED or PLAYING state), with a
    // timeout fallback so we never hang. This prevents seek/play firing on a
    // not-yet-loaded video (a real sync bug on track changes).
    if (this.currentId === videoId && this.ready) return; // already cued
    this.ready = false;
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.cueResolve = null;
        resolve();
      };
      this.cueResolve = finish;
      this.player!.cueVideoById({ videoId });
      this.currentId = videoId;
      setTimeout(finish, 4000);
    });
    this.ready = true;
  }

  async play(): Promise<void> {
    this.player?.unMute();
    this.player?.playVideo();
  }
  pause(): void {
    this.player?.pauseVideo();
  }
  seekTo(ms: number): void {
    this.player?.seekTo(Math.max(0, ms / 1000), true);
  }
  getPositionMs(): number {
    return (this.player?.getCurrentTime() ?? 0) * 1000;
  }
  getDurationMs(): number {
    return (this.player?.getDuration() ?? 0) * 1000;
  }
  setRate(_rate: number): void {
    // No-op: YouTube rates are too coarse for inaudible nudging.
  }
  isReady(): boolean {
    return this.ready;
  }
  isPlaying(): boolean {
    if (!this.player || !window.YT) return false;
    return this.player.getPlayerState() === window.YT.PlayerState.PLAYING;
  }
  onEnded(cb: () => void): void {
    this.endedCb = cb;
  }
  destroy(): void {
    try {
      this.player?.destroy();
    } catch {
      /* ignore */
    }
    this.player = null;
    if (this.container?.parentElement) this.container.parentElement.remove();
    this.container = null;
    this.endedCb = null;
  }
}
