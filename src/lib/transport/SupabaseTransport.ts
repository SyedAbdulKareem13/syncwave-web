import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "../supabase/client";
import { BaseTransport, EVENT_NAMES, type PresenceMeta, type TransportEventName, type TransportEventMap } from "./Transport";

// Cross-device transport: Supabase Realtime channel per room. Broadcast carries
// the control-plane protocol; Presence tracks members (including their clock
// offset). `broadcast.self = false` so a sender never receives its own message
// — the room applies its own actions optimistically, peers learn via broadcast.
export class SupabaseTransport extends BaseTransport {
  readonly mode = "supabase" as const;
  private channel: RealtimeChannel | null = null;
  private readonly channelName: string;
  private readonly presenceKey: string;
  private joined = false;

  constructor(channelName: string, presenceKey: string) {
    super();
    this.channelName = `syncwave:${channelName}`;
    this.presenceKey = presenceKey;
  }

  async join(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured");

    const channel = supabase.channel(this.channelName, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: this.presenceKey },
      },
    });
    this.channel = channel;

    // Register a handler per known event before subscribing.
    for (const name of EVENT_NAMES) {
      channel.on("broadcast", { event: name }, ({ payload }) => this.dispatch(name, payload));
    }

    channel.on("presence", { event: "sync" }, () => this.emitPresence());
    channel.on("presence", { event: "join" }, () => this.emitPresence());
    channel.on("presence", { event: "leave" }, () => this.emitPresence());

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Realtime subscribe timed out")), 10_000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          this.joined = true;
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error(`Realtime channel error: ${status}`));
        }
      });
    });
  }

  async leave(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.untrack();
      } catch {
        /* ignore */
      }
      await getSupabase()?.removeChannel(this.channel);
    }
    this.channel = null;
    this.joined = false;
  }

  emit<K extends TransportEventName>(event: K, payload: TransportEventMap[K]): void {
    if (!this.channel || !this.joined) return;
    void this.channel.send({ type: "broadcast", event, payload });
  }

  async trackPresence(meta: PresenceMeta): Promise<void> {
    if (!this.channel || !this.joined) return; // not connected yet / already left
    await this.channel.track(meta);
  }

  async updatePresence(meta: PresenceMeta): Promise<void> {
    // Called periodically (e.g. on clock updates); may fire after leave().
    if (!this.channel || !this.joined) return;
    await this.channel.track(meta);
  }

  private emitPresence(): void {
    if (!this.channel) return;
    const state = this.channel.presenceState() as Record<string, PresenceMeta[]>;
    const members: PresenceMeta[] = [];
    for (const key of Object.keys(state)) {
      for (const m of state[key]) members.push(m);
    }
    this.dispatchPresence(members);
  }
}
