import { clamp, median } from "../util";

/**
 * NTP-style clock synchronization (Section 4.1).
 *
 * Every client continuously estimates its offset from a shared server clock by
 * sampling a tiny `/api/time` endpoint. We keep only the lowest-RTT samples
 * (least jitter) and take the median offset. `serverNow()` is then the shared
 * reference frame used for all playback scheduling.
 */
export class ClockSync {
  private offsetMs = 0;
  private lastRttMs = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(offset: number) => void>();

  constructor(private endpoint = "/api/time") {}

  /** serverTime ≈ clientNow() + clockOffset */
  get clockOffset(): number {
    return this.offsetMs;
  }
  get rtt(): number {
    return this.lastRttMs;
  }
  serverNow(): number {
    return Date.now() + this.offsetMs;
  }

  onUpdate(cb: (offset: number) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  async start(): Promise<void> {
    await this.sync(8);
    this.timer = setInterval(() => {
      void this.sync(4);
    }, 10_000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.listeners.clear();
  }

  /** Take `n` samples spaced ~150ms apart, then update the offset estimate. */
  async sync(n: number): Promise<void> {
    const samples: { rtt: number; offset: number }[] = [];
    for (let i = 0; i < n; i++) {
      const s = await this.sample();
      if (s) samples.push(s);
      if (i < n - 1) await delay(150);
    }
    if (samples.length === 0) return;

    samples.sort((a, b) => a.rtt - b.rtt);
    const keep = Math.max(1, Math.ceil(samples.length * 0.25)); // lowest 25% RTT
    const best = samples.slice(0, keep);
    this.offsetMs = median(best.map((s) => s.offset));
    this.lastRttMs = median(best.map((s) => s.rtt));
    for (const cb of this.listeners) cb(this.offsetMs);
  }

  private async sample(): Promise<{ rtt: number; offset: number } | null> {
    try {
      const t0 = Date.now();
      const res = await fetch(`${this.endpoint}?t0=${t0}`, { cache: "no-store" });
      const t3 = Date.now();
      const { t1, t2 } = (await res.json()) as { t1: number; t2: number };
      const rtt = clamp(t3 - t0 - (t2 - t1), 0, 60_000);
      const offset = (t1 - t0 + (t2 - t3)) / 2;
      return { rtt, offset };
    } catch {
      return null;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
