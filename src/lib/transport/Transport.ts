import type { Track, PlaybackState, QueueItem, ChatMessage, ReactionEvent, Role, LobbyRoom } from "../types";

// The real-time protocol (Section 5), transport-agnostic. Both the Supabase and
// BroadcastChannel implementations speak exactly this vocabulary, so the room
// logic never knows or cares which one is underneath.
export interface TransportEventMap {
  "playback:prepare": { track: Track; p0: number; by: string };
  "playback:start": { track: Track; positionMs: number; startAtServerTs: number; by: string };
  "playback:heartbeat": { state: PlaybackState };
  "playback:state": { state: PlaybackState }; // full snapshot, on join
  "playback:ready": { userId: string };
  "playback:command": { type: "play" | "pause" | "seek" | "next" | "prev"; payload?: { positionMs?: number }; userId: string };
  "state:request": { userId: string };
  "queue:add": { track: Track; addedBy: string; addedByName: string };
  "queue:remove": { id: string };
  "queue:reorder": { orderedIds: string[] };
  "queue:update": { items: QueueItem[] };
  "reaction:broadcast": ReactionEvent;
  "chat:broadcast": ChatMessage;
  "session:host_changed": { hostId: string };
}

export type TransportEventName = keyof TransportEventMap;

export const EVENT_NAMES: TransportEventName[] = [
  "playback:prepare",
  "playback:start",
  "playback:heartbeat",
  "playback:state",
  "playback:ready",
  "playback:command",
  "state:request",
  "queue:add",
  "queue:remove",
  "queue:reorder",
  "queue:update",
  "reaction:broadcast",
  "chat:broadcast",
  "session:host_changed",
];

export interface PresenceMeta {
  userId: string;
  name: string;
  avatar: string;
  role: Role;
  clockOffset: number;
  joinedAt: number;
  /** Set by the host so joiners can show the room's name. */
  roomName?: string;
  /** Present only on the lobby channel, where hosts advertise their room. */
  lobby?: LobbyRoom;
}

export type TransportMode = "supabase" | "local";

export interface Transport {
  readonly mode: TransportMode;
  join(): Promise<void>;
  leave(): Promise<void>;
  emit<K extends TransportEventName>(event: K, payload: TransportEventMap[K]): void;
  on<K extends TransportEventName>(event: K, cb: (payload: TransportEventMap[K]) => void): () => void;
  trackPresence(meta: PresenceMeta): Promise<void>;
  updatePresence(meta: PresenceMeta): Promise<void>;
  onPresence(cb: (members: PresenceMeta[]) => void): () => void;
}

export abstract class BaseTransport implements Transport {
  abstract readonly mode: TransportMode;
  protected handlers = new Map<string, Set<(p: unknown) => void>>();
  protected presenceCbs = new Set<(m: PresenceMeta[]) => void>();

  on<K extends TransportEventName>(event: K, cb: (payload: TransportEventMap[K]) => void): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(cb as (p: unknown) => void);
    return () => set!.delete(cb as (p: unknown) => void);
  }

  onPresence(cb: (members: PresenceMeta[]) => void): () => void {
    this.presenceCbs.add(cb);
    return () => this.presenceCbs.delete(cb);
  }

  protected dispatch(event: string, payload: unknown): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const cb of set) cb(payload);
  }

  protected dispatchPresence(members: PresenceMeta[]): void {
    for (const cb of this.presenceCbs) cb(members);
  }

  abstract join(): Promise<void>;
  abstract leave(): Promise<void>;
  abstract emit<K extends TransportEventName>(event: K, payload: TransportEventMap[K]): void;
  abstract trackPresence(meta: PresenceMeta): Promise<void>;
  abstract updatePresence(meta: PresenceMeta): Promise<void>;
}
