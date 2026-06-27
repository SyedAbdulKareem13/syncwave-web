import { BaseTransport, type PresenceMeta, type TransportEventName, type TransportEventMap } from "./Transport";

// Zero-config transport for LOCAL MODE: synchronizes tabs of the SAME browser
// via the BroadcastChannel API. No server, no account. Open two tabs of a room
// and the sync engine works exactly as it does cross-device — perfect for a
// first look and for verifying the engine in a preview.
//
// BroadcastChannel does not echo a message back to its sender, which matches
// Supabase's `broadcast.self = false`, so room logic behaves identically.

interface Beacon {
  meta: PresenceMeta;
  lastSeen: number;
}

const PRESENCE_BEACON_MS = 2000;
const PRESENCE_STALE_MS = 6500;

export class BroadcastChannelTransport extends BaseTransport {
  readonly mode = "local" as const;
  private chan: BroadcastChannel | null = null;
  private readonly name: string;
  private self: PresenceMeta | null = null;
  private peers = new Map<string, Beacon>();
  private beaconTimer: ReturnType<typeof setInterval> | null = null;
  private clockBase = Date.now();

  constructor(channelName: string) {
    super();
    this.name = `syncwave:${channelName}`;
  }

  private now(): number {
    // Date.now is fine here; all peers share one machine in local mode.
    return Date.now();
  }

  async join(): Promise<void> {
    this.chan = new BroadcastChannel(this.name);
    this.chan.onmessage = (ev: MessageEvent) => this.onMessage(ev.data);
    // Ask anyone already present to re-announce themselves.
    this.post({ kind: "hello" });
  }

  async leave(): Promise<void> {
    if (this.self) this.post({ kind: "bye", userId: this.self.userId });
    if (this.beaconTimer) clearInterval(this.beaconTimer);
    this.beaconTimer = null;
    this.chan?.close();
    this.chan = null;
    this.peers.clear();
  }

  emit<K extends TransportEventName>(event: K, payload: TransportEventMap[K]): void {
    this.post({ kind: "event", event, payload });
  }

  async trackPresence(meta: PresenceMeta): Promise<void> {
    this.self = meta;
    this.announce();
    if (!this.beaconTimer) {
      this.beaconTimer = setInterval(() => {
        this.announce();
        this.prune();
      }, PRESENCE_BEACON_MS);
    }
    this.emitPresence();
  }

  async updatePresence(meta: PresenceMeta): Promise<void> {
    this.self = meta;
    this.announce();
    this.emitPresence();
  }

  // ── internals ───────────────────────────────────────────────────────────
  private announce(): void {
    if (this.self) this.post({ kind: "presence", meta: this.self });
  }

  private onMessage(msg: BcMessage): void {
    switch (msg.kind) {
      case "hello":
        this.announce();
        break;
      case "presence":
        this.peers.set(msg.meta.userId, { meta: msg.meta, lastSeen: this.now() });
        this.prune();
        this.emitPresence();
        break;
      case "bye":
        this.peers.delete(msg.userId);
        this.emitPresence();
        break;
      case "event":
        this.dispatch(msg.event, msg.payload);
        break;
    }
  }

  private prune(): void {
    const cutoff = this.now() - PRESENCE_STALE_MS;
    let changed = false;
    for (const [id, b] of this.peers) {
      if (b.lastSeen < cutoff) {
        this.peers.delete(id);
        changed = true;
      }
    }
    if (changed) this.emitPresence();
  }

  private emitPresence(): void {
    const members: PresenceMeta[] = [];
    if (this.self) members.push(this.self);
    for (const b of this.peers.values()) {
      if (!this.self || b.meta.userId !== this.self.userId) members.push(b.meta);
    }
    this.dispatchPresence(members);
  }

  private post(msg: BcMessage): void {
    this.chan?.postMessage(msg);
  }
}

type BcMessage =
  | { kind: "hello" }
  | { kind: "bye"; userId: string }
  | { kind: "presence"; meta: PresenceMeta }
  | { kind: "event"; event: string; payload: unknown };
