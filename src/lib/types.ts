// ── Shared vocabulary for SyncWave (Model A: control-plane sync only) ──────────
// Audio is always rendered client-side. None of these types ever carry audio bytes.

export type AudioSource = "demo" | "youtube" | "local";

/** A playable item. `uri` is the canonical, cross-device-stable identity. */
export interface Track {
  uri: string; // "demo:1" | "yt:VIDEOID" | "local:<filename>"
  source: AudioSource;
  title: string;
  artist?: string;
  artworkUrl?: string;
  durationMs?: number;

  /** Direct URL the client loads itself (demo / remote mp3). Never proxied by us. */
  streamUrl?: string;
  /** YouTube video id — each client streams from YouTube directly. */
  youtubeId?: string;
  /** Local file name — must be resolved against the user's own picked file. */
  fileName?: string;

  /** Optional pre-baked accent pair so demo tracks always theme nicely. */
  accent?: [number, number, number];
  accent2?: [number, number, number];
}

export type Role = "host" | "listener";

export interface Member {
  userId: string;
  name: string;
  avatar: string; // emoji
  role: Role;
  clockOffset: number; // ms — serverNow ≈ clientNow + clockOffset
  joinedAt: number;
}

/** Authoritative playback snapshot, expressed in shared server time. */
export interface PlaybackState {
  track: Track | null;
  positionMs: number; // playhead position sampled at `atServerTs`
  isPlaying: boolean;
  atServerTs: number; // server time the sample was taken
  rate: number;
  hostId: string;
}

export interface QueueItem {
  id: string;
  track: Track;
  addedBy: string;
  addedByName: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  text: string;
  ts: number;
}

export interface ReactionEvent {
  id: string;
  userId: string;
  emoji: string;
  ts: number;
}

/** What the host advertises to the lobby for public-room discovery. */
export interface LobbyRoom {
  roomId: string;
  name: string;
  hostName: string;
  listeners: number;
  trackTitle: string | null;
  trackArtist: string | null;
  artworkUrl: string | null;
  accent: [number, number, number] | null;
  isPlaying: boolean;
}

export type SyncQuality = "ok" | "warn" | "bad" | "unknown";
