import { ClockSync } from "./clock";
import type { Track, PlaybackState } from "../types";
import { adapterKind, createAdapter, type PlaybackAdapter } from "../audio";
import { clamp } from "../util";

export interface SyncEngineOptions {
  toleranceMs?: number; // within this skew, do nothing (Section 4.4 budget)
  nudgeMaxMs?: number; // up to this, correct via inaudible rate-nudge
  nudgeWindowMs?: number; // how long to hold the nudged rate
  onPosition?: (positionMs: number, durationMs: number, isPlaying: boolean) => void;
  onSkew?: (skewMs: number) => void;
  onEnded?: () => void;
}

type Timer = ReturnType<typeof setTimeout>;

const DEFAULTS = { toleranceMs: 25, nudgeMaxMs: 150, nudgeWindowMs: 1800 };

/**
 * The sync engine (Section 4). Two roles share one class:
 *  • HOST drives its local adapter (play/pause/seek) and reads its position to
 *    build the authoritative PlaybackState it broadcasts.
 *  • LISTENERS feed incoming `playback:start` / `playback:heartbeat` in here and
 *    the engine schedules a coordinated start, then continuously drift-corrects
 *    — inaudibly via rate-nudge when it can, with a hard seek when it must.
 */
export class SyncEngine {
  private adapters = new Map<"html5" | "youtube", PlaybackAdapter>();
  private active: PlaybackAdapter | null = null;
  private track: Track | null = null;

  private startTimer: Timer | null = null;
  private nudgeTimer: Timer | null = null;
  private ticker: Timer | null = null;

  private readonly opts: Required<Omit<SyncEngineOptions, "onPosition" | "onSkew" | "onEnded">> &
    Pick<SyncEngineOptions, "onPosition" | "onSkew" | "onEnded">;

  constructor(private clock: ClockSync, options: SyncEngineOptions = {}) {
    this.opts = { ...DEFAULTS, ...options };
  }

  get currentTrack(): Track | null {
    return this.track;
  }
  serverNow(): number {
    return this.clock.serverNow();
  }
  get clockOffset(): number {
    return this.clock.clockOffset;
  }

  startTicker(): void {
    if (this.ticker) return;
    this.ticker = setInterval(() => {
      if (!this.active) return;
      this.opts.onPosition?.(this.active.getPositionMs(), this.localDurationMs(), this.active.isPlaying());
    }, 200);
  }

  // ── adapters ──────────────────────────────────────────────────────────────
  private getAdapter(track: Track): PlaybackAdapter {
    const kind = adapterKind(track);
    let a = this.adapters.get(kind);
    if (!a) {
      a = createAdapter(kind);
      a.onEnded(() => this.opts.onEnded?.());
      this.adapters.set(kind, a);
    }
    return a;
  }

  private async setActive(track: Track): Promise<PlaybackAdapter> {
    const a = this.getAdapter(track);
    if (this.active && this.active !== a) this.active.pause();
    this.active = a;
    this.track = track;
    return a;
  }

  /** Load + buffer, seek to p0, leave paused. Resolves when playable. */
  async prepare(track: Track, p0: number): Promise<void> {
    const a = await this.setActive(track);
    await a.load(track);
    a.seekTo(p0);
    a.pause();
  }

  // ── listener side: coordinated start (Section 4.2) ──────────────────────────
  async scheduleStart(track: Track, positionMs: number, startAtServerTs: number): Promise<void> {
    if (!this.track || this.track.uri !== track.uri) {
      await this.prepare(track, positionMs);
    } else {
      this.active?.seekTo(positionMs);
    }
    const a = this.active;
    if (!a) return;

    this.clearStartTimer();
    const startAtLocal = startAtServerTs - this.clock.clockOffset;
    const delay = startAtLocal - Date.now();

    if (delay > 0) {
      this.startTimer = setTimeout(() => {
        void a.play();
      }, delay);
    } else {
      // We received this late (e.g. late joiner): jump in mid-stream, aligned.
      const lateBy = -delay;
      a.seekTo(positionMs + lateBy);
      void a.play();
    }
  }

  // ── listener side: drift correction (Section 4.3) ───────────────────────────
  async applyHeartbeat(state: PlaybackState): Promise<void> {
    if (!state.track) {
      this.stop();
      this.opts.onSkew?.(0);
      return;
    }

    // Track changed (or we never loaded it): catch up mid-stream.
    if (!this.track || this.track.uri !== state.track.uri) {
      const expected = state.isPlaying
        ? state.positionMs + (this.serverNow() - state.atServerTs)
        : state.positionMs;
      await this.prepare(state.track, Math.max(0, expected));
      if (state.isPlaying) void this.active?.play();
      return;
    }

    const a = this.active;
    if (!a) return;

    if (!state.isPlaying) {
      a.pause();
      a.seekTo(state.positionMs);
      this.clearNudge();
      this.opts.onSkew?.(0);
      return;
    }

    const expectedPos = state.positionMs + (this.serverNow() - state.atServerTs);
    if (!a.isPlaying()) {
      a.seekTo(expectedPos);
      void a.play();
    }

    const drift = a.getPositionMs() - expectedPos; // +ve ⇒ we're ahead
    const adrift = Math.abs(drift);
    this.opts.onSkew?.(adrift);

    if (adrift < this.opts.toleranceMs) {
      this.clearNudge();
      return;
    }
    if (adrift < this.opts.nudgeMaxMs && a.supportsRateNudge) {
      // Correct `drift` ms over the window with an inaudible rate change.
      const rate = clamp(1 - drift / this.opts.nudgeWindowMs, 0.94, 1.06);
      a.setRate(rate);
      this.clearNudge();
      this.nudgeTimer = setTimeout(() => a.setRate(1), this.opts.nudgeWindowMs);
    } else {
      a.seekTo(expectedPos);
      a.setRate(1);
    }
  }

  // ── host side: drive local playback + read authoritative position ───────────
  localPositionMs(): number {
    return this.active?.getPositionMs() ?? 0;
  }
  localDurationMs(): number {
    return this.active?.getDurationMs() || this.track?.durationMs || 0;
  }
  isLocallyPlaying(): boolean {
    return this.active?.isPlaying() ?? false;
  }
  async playLocal(): Promise<void> {
    this.clearStartTimer();
    await this.active?.play();
  }
  pauseLocal(): void {
    this.clearStartTimer();
    this.active?.pause();
  }
  seekLocal(ms: number): void {
    this.active?.seekTo(ms);
  }

  stop(): void {
    this.clearStartTimer();
    this.clearNudge();
    this.active?.pause();
  }

  destroy(): void {
    this.clearStartTimer();
    this.clearNudge();
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    for (const a of this.adapters.values()) a.destroy();
    this.adapters.clear();
    this.active = null;
  }

  private clearStartTimer(): void {
    if (this.startTimer) clearTimeout(this.startTimer);
    this.startTimer = null;
  }
  private clearNudge(): void {
    if (this.nudgeTimer) clearTimeout(this.nudgeTimer);
    this.nudgeTimer = null;
    if (this.active && this.active.supportsRateNudge) this.active.setRate(1);
  }
}
