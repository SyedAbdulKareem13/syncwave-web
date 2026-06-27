"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClockSync } from "./sync/clock";
import { SyncEngine } from "./sync/syncEngine";
import { createTransport, type PresenceMeta, type Transport } from "./transport";
import { UnresolvedTrackError, unlockAudio } from "./audio";
import { registerLocalFileAs } from "./audio/localFiles";
import { DEMO_TRACKS } from "./tracks";
import { loadRoomMeta } from "./roomMeta";
import type { ChatMessage, LobbyRoom, Member, PlaybackState, QueueItem, ReactionEvent, Role, SyncQuality, Track } from "./types";
import type { Identity } from "./useIdentity";
import { uid } from "./util";

const START_MARGIN_MS = 700; // cushion for coordinated start (Section 4.2)
const HEARTBEAT_MS = 4000; // host → listeners drift heartbeat (Section 4.3)

export interface RoomApi {
  ready: boolean;
  mode: "supabase" | "local";
  isHost: boolean;
  hostId: string;
  roomName: string;
  members: Member[];

  track: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;

  skewMs: number | null;
  syncQuality: SyncQuality;
  clockOffset: number;

  audioReady: boolean;
  unresolved: boolean;

  queue: QueueItem[];
  chat: ChatMessage[];
  reactions: ReactionEvent[];

  unlock: () => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (ms: number) => void;
  next: () => void;
  prev: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (orderedIds: string[]) => void;
  resolveLocalFile: (file: File) => void;
  sendReaction: (emoji: string) => void;
  sendChat: (text: string) => void;
  transferHost: (userId: string) => void;
}

export function useRoom(roomId: string, me: Identity | null): RoomApi {
  // ── React-visible state (drives the UI) ───────────────────────────────────
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"supabase" | "local">("local");
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState("");
  const [roomName, setRoomName] = useState("Live session");
  const [members, setMembers] = useState<Member[]>([]);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [skewMs, setSkewMs] = useState<number | null>(null);
  const [clockOffset, setClockOffset] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [unresolved, setUnresolved] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);

  // ── refs (stable across renders, used inside event handlers) ───────────────
  const transportRef = useRef<Transport | null>(null);
  const lobbyRef = useRef<Transport | null>(null);
  const clockRef = useRef<ClockSync | null>(null);
  const engineRef = useRef<SyncEngine | null>(null);
  const stateRef = useRef<PlaybackState | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const membersRef = useRef<Member[]>([]);
  const isHostRef = useRef(false);
  const audioReadyRef = useRef(false);
  const pendingStateRef = useRef<PlaybackState | null>(null);
  const readySetRef = useRef<Set<string>>(new Set());
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const joinedAtRef = useRef<number>(0);
  const metaRef = useRef(loadRoomMeta(roomId));
  const promoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meId = me?.userId ?? "";

  // ── helpers ────────────────────────────────────────────────────────────────
  const buildPresence = useCallback(
    (role: Role): PresenceMeta => ({
      userId: meId,
      name: me?.name ?? "Listener",
      avatar: me?.avatar ?? "🎧",
      role,
      clockOffset: clockRef.current?.clockOffset ?? 0,
      joinedAt: joinedAtRef.current,
      roomName: role === "host" ? metaRef.current?.name ?? roomName : undefined,
    }),
    [meId, me?.name, me?.avatar, roomName],
  );

  const syncMirrors = useCallback((state: PlaybackState | null) => {
    if (!state) {
      setTrack(null);
      setIsPlaying(false);
      return;
    }
    setTrack(state.track);
    setIsPlaying(state.isPlaying);
    if (state.track?.durationMs) setDurationMs(state.track.durationMs);
    if (!audioReadyRef.current) setPositionMs(state.positionMs);
  }, []);

  const safeEngine = useCallback(async (fn: (e: SyncEngine) => Promise<void> | void) => {
    const e = engineRef.current;
    if (!e) return;
    try {
      await fn(e);
      setUnresolved(false);
    } catch (err) {
      if (err instanceof UnresolvedTrackError) setUnresolved(true);
      // other errors (e.g. autoplay) are surfaced via the audio gate
    }
  }, []);

  const applyState = useCallback(
    async (state: PlaybackState) => {
      stateRef.current = state;
      syncMirrors(state);
      if (!audioReadyRef.current) {
        pendingStateRef.current = state;
        return;
      }
      await safeEngine((e) => e.applyHeartbeat(state));
    },
    [safeEngine, syncMirrors],
  );

  const pushReaction = useCallback((r: ReactionEvent) => {
    setReactions((prev) => [...prev.slice(-15), r]);
    setTimeout(() => setReactions((prev) => prev.filter((x) => x.id !== r.id)), 3000);
  }, []);

  // ── host: build + broadcast authoritative state ────────────────────────────
  const sampleState = useCallback((): PlaybackState | null => {
    const e = engineRef.current;
    const cur = stateRef.current;
    if (!e || !cur) return null;
    return {
      track: cur.track,
      positionMs: e.localPositionMs(),
      isPlaying: e.isLocallyPlaying(),
      atServerTs: e.serverNow(),
      rate: 1,
      hostId: meId,
    };
  }, [meId]);

  const updateLobby = useCallback(() => {
    if (!lobbyRef.current || !isHostRef.current || !metaRef.current?.isPublic) return;
    const cur = stateRef.current;
    const lobby: LobbyRoom = {
      roomId,
      name: metaRef.current?.name ?? roomName,
      hostName: me?.name ?? "Host",
      listeners: membersRef.current.length,
      trackTitle: cur?.track?.title ?? null,
      trackArtist: cur?.track?.artist ?? null,
      artworkUrl: cur?.track?.artworkUrl ?? null,
      accent: cur?.track?.accent ?? null,
      isPlaying: cur?.isPlaying ?? false,
    };
    void lobbyRef.current.updatePresence({ ...buildPresence("host"), lobby });
  }, [roomId, roomName, me?.name, buildPresence]);

  const beat = useCallback(() => {
    if (!isHostRef.current) return;
    const s = sampleState();
    if (!s || !s.track) return;
    stateRef.current = s;
    transportRef.current?.emit("playback:heartbeat", { state: s });
    updateLobby();
  }, [sampleState, updateLobby]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return;
    heartbeatRef.current = setInterval(beat, HEARTBEAT_MS);
  }, [beat]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }, []);

  // ── host election (presence-derived, deterministic) ────────────────────────
  const electHost = useCallback((list: Member[]): string => {
    // Deterministic across all clients: prefer the lowest-joinedAt among explicit
    // hosts (so a manual host transfer sticks and a transient dual-host race
    // resolves identically everywhere); otherwise the longest-present member.
    const hosts = list.filter((m) => m.role === "host");
    const pool = hosts.length > 0 ? hosts : list;
    const sorted = [...pool].sort((a, b) => a.joinedAt - b.joinedAt || (a.userId < b.userId ? -1 : 1));
    return sorted[0]?.userId ?? "";
  }, []);

  const becomeHost = useCallback(async () => {
    if (isHostRef.current) return;
    isHostRef.current = true;
    setIsHost(true);
    readySetRef.current.clear();
    await transportRef.current?.updatePresence(buildPresence("host"));
    // Take ownership of whatever is currently playing and keep it alive.
    if (!stateRef.current) {
      stateRef.current = { track: null, positionMs: 0, isPlaying: false, atServerTs: clockRef.current?.serverNow() ?? Date.now(), rate: 1, hostId: meId };
    } else {
      stateRef.current = { ...stateRef.current, hostId: meId };
    }
    startHeartbeat();
    // Spin up the lobby beacon for public rooms.
    if (metaRef.current?.isPublic && !lobbyRef.current) {
      const lobby = createTransport("lobby", roomId);
      lobbyRef.current = lobby;
      try {
        await lobby.join();
        updateLobby();
      } catch {
        /* lobby is best-effort */
      }
    }
  }, [buildPresence, meId, roomId, startHeartbeat, updateLobby]);

  const demote = useCallback(async () => {
    if (!isHostRef.current) return;
    isHostRef.current = false;
    setIsHost(false);
    stopHeartbeat();
    await transportRef.current?.updatePresence(buildPresence("listener"));
    if (lobbyRef.current) {
      void lobbyRef.current.leave();
      lobbyRef.current = null;
    }
  }, [buildPresence, stopHeartbeat]);

  // ── lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return;
    let disposed = false;

    const clock = new ClockSync("/api/time");
    const engine = new SyncEngine(clock, {
      onPosition: (pos, dur, playing) => {
        if (audioReadyRef.current) {
          setPositionMs(pos);
          if (dur) setDurationMs(dur);
          setIsPlaying(playing);
        }
      },
      onSkew: (skew) => setSkewMs(skew),
      onEnded: () => {
        if (isHostRef.current) nextRef.current();
      },
    });
    const transport = createTransport(roomId, meId);

    clockRef.current = clock;
    engineRef.current = engine;
    transportRef.current = transport;
    setMode(transport.mode);

    // wire transport events
    const offs: Array<() => void> = [];

    offs.push(
      transport.on("playback:prepare", ({ track: t, p0 }) => {
        if (isHostRef.current) return;
        void safeEngine(async (e) => {
          await e.prepare(t, p0);
          transport.emit("playback:ready", { userId: meId });
        });
        setTrack(t);
      }),
    );

    offs.push(
      transport.on("playback:start", ({ track: t, positionMs: pos, startAtServerTs }) => {
        if (isHostRef.current) return;
        const state: PlaybackState = { track: t, positionMs: pos, isPlaying: true, atServerTs: startAtServerTs, rate: 1, hostId };
        stateRef.current = state;
        setTrack(t);
        setIsPlaying(true);
        if (!audioReadyRef.current) {
          pendingStateRef.current = state;
          return;
        }
        void safeEngine((e) => e.scheduleStart(t, pos, startAtServerTs));
      }),
    );

    offs.push(
      transport.on("playback:heartbeat", ({ state }) => {
        if (isHostRef.current) return;
        void applyState(state);
      }),
    );

    offs.push(
      transport.on("playback:state", ({ state }) => {
        if (isHostRef.current) return;
        void applyState(state);
      }),
    );

    offs.push(
      transport.on("playback:ready", ({ userId }) => {
        if (isHostRef.current) readySetRef.current.add(userId);
      }),
    );

    offs.push(
      transport.on("state:request", () => {
        if (!isHostRef.current) return;
        const s = sampleState();
        if (s) transport.emit("playback:state", { state: s });
      }),
    );

    offs.push(
      transport.on("queue:add", ({ track: t, addedBy, addedByName }) => {
        if (!isHostRef.current) return;
        const item: QueueItem = { id: uid(), track: t, addedBy, addedByName };
        queueRef.current = [...queueRef.current, item];
        setQueue(queueRef.current);
        transport.emit("queue:update", { items: queueRef.current });
      }),
    );

    offs.push(
      transport.on("queue:remove", ({ id }) => {
        if (!isHostRef.current) return;
        queueRef.current = queueRef.current.filter((q) => q.id !== id);
        setQueue(queueRef.current);
        transport.emit("queue:update", { items: queueRef.current });
      }),
    );

    offs.push(
      transport.on("queue:reorder", ({ orderedIds }) => {
        if (!isHostRef.current) return;
        const map = new Map(queueRef.current.map((q) => [q.id, q]));
        queueRef.current = orderedIds.map((id) => map.get(id)).filter((q): q is QueueItem => Boolean(q));
        setQueue(queueRef.current);
        transport.emit("queue:update", { items: queueRef.current });
      }),
    );

    offs.push(
      transport.on("queue:update", ({ items }) => {
        queueRef.current = items;
        setQueue(items);
      }),
    );

    offs.push(
      transport.on("reaction:broadcast", (r) => {
        pushReaction(r);
      }),
    );

    offs.push(
      transport.on("chat:broadcast", (m) => {
        setChat((prev) => [...prev.slice(-99), m]);
      }),
    );

    offs.push(
      transport.on("session:host_changed", ({ hostId: newHost }) => {
        setHostId(newHost);
        if (newHost === meId) void becomeHost();
        else if (isHostRef.current) void demote();
      }),
    );

    const offPresence = transport.onPresence((metas: PresenceMeta[]) => {
      const dedup = new Map<string, Member>();
      for (const m of metas) {
        dedup.set(m.userId, {
          userId: m.userId,
          name: m.name,
          avatar: m.avatar,
          role: m.role,
          clockOffset: m.clockOffset,
          joinedAt: m.joinedAt,
        });
        if (m.role === "host" && m.roomName) setRoomName(m.roomName);
      }
      const list = [...dedup.values()];
      membersRef.current = list;
      setMembers(list);

      const elected = electHost(list);
      setHostId(elected);
      const someoneElseHosts = list.some((m) => m.role === "host" && m.userId !== meId);
      if (elected === meId && !isHostRef.current && !someoneElseHosts) {
        // Defer self-promotion so a freshly-joined client can first discover an
        // existing host (presence is learned with a small lag). Re-check on fire.
        if (!promoteTimerRef.current) {
          promoteTimerRef.current = setTimeout(() => {
            promoteTimerRef.current = null;
            const cur = membersRef.current;
            const otherHost = cur.some((m) => m.role === "host" && m.userId !== meId);
            if (!otherHost && !isHostRef.current && electHost(cur) === meId) void becomeHost();
          }, 1200);
        }
      } else {
        if (promoteTimerRef.current) {
          clearTimeout(promoteTimerRef.current);
          promoteTimerRef.current = null;
        }
        if (elected !== meId && isHostRef.current && someoneElseHosts) void demote();
      }
      updateLobby();
    });
    offs.push(offPresence);

    // connect
    void (async () => {
      try {
        await clock.start();
        if (disposed) return;
        setClockOffset(clock.clockOffset);
        clock.onUpdate((o) => {
          setClockOffset(o);
          void transport.updatePresence(buildPresence(isHostRef.current ? "host" : "listener"));
        });
        joinedAtRef.current = clock.serverNow();
        await transport.join();
        if (disposed) return;
        engine.startTicker();
        await transport.trackPresence(buildPresence("listener"));
        setReady(true);
        // Ask whoever is hosting for the current snapshot (late-join path).
        transport.emit("state:request", { userId: meId });
      } catch (err) {
        console.error("[syncwave] failed to join room", err);
      }
    })();

    return () => {
      disposed = true;
      stopHeartbeat();
      if (promoteTimerRef.current) clearTimeout(promoteTimerRef.current);
      for (const off of offs) off();
      engine.destroy();
      clock.stop();
      void transport.leave();
      if (lobbyRef.current) void lobbyRef.current.leave();
      lobbyRef.current = null;
      transportRef.current = null;
      engineRef.current = null;
      clockRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, meId]);

  // ── actions (host-only playback control) ───────────────────────────────────
  const waitForReady = useCallback((timeoutMs: number): Promise<void> => {
    const listeners = membersRef.current.filter((m) => m.userId !== meId).length;
    const target = Math.ceil(listeners * 0.8);
    if (target <= 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const started = Date.now();
      const iv = setInterval(() => {
        if (readySetRef.current.size >= target || Date.now() - started > timeoutMs) {
          clearInterval(iv);
          resolve();
        }
      }, 80);
    });
  }, [meId]);

  const unlock = useCallback(async () => {
    await unlockAudio();
    audioReadyRef.current = true;
    setAudioReady(true);
    const pend = pendingStateRef.current;
    pendingStateRef.current = null;
    if (pend) {
      await safeEngine((e) => e.applyHeartbeat(pend));
    } else {
      transportRef.current?.emit("state:request", { userId: meId });
    }
  }, [meId, safeEngine]);

  const playTrack = useCallback(
    async (t: Track) => {
      if (!isHostRef.current) return;
      await unlock();
      const transport = transportRef.current;
      const clock = clockRef.current;
      if (!transport || !clock) return;

      readySetRef.current.clear();
      await safeEngine((e) => e.prepare(t, 0));
      transport.emit("playback:prepare", { track: t, p0: 0, by: meId });
      await waitForReady(1500);

      const startAt = clock.serverNow() + START_MARGIN_MS;
      const state: PlaybackState = { track: t, positionMs: 0, isPlaying: true, atServerTs: startAt, rate: 1, hostId: meId };
      stateRef.current = state;
      await safeEngine((e) => e.scheduleStart(t, 0, startAt));
      transport.emit("playback:start", { track: t, positionMs: 0, startAtServerTs: startAt, by: meId });
      syncMirrors(state);
      startHeartbeat();
      updateLobby();
    },
    [meId, safeEngine, syncMirrors, unlock, waitForReady, startHeartbeat, updateLobby],
  );

  const togglePlay = useCallback(async () => {
    if (!isHostRef.current) return;
    const e = engineRef.current;
    const transport = transportRef.current;
    const clock = clockRef.current;
    const cur = stateRef.current;
    if (!e || !transport || !clock || !cur?.track) return;

    if (cur.isPlaying) {
      e.pauseLocal();
      const state: PlaybackState = { ...cur, isPlaying: false, positionMs: e.localPositionMs(), atServerTs: clock.serverNow() };
      stateRef.current = state;
      transport.emit("playback:heartbeat", { state });
      syncMirrors(state);
    } else {
      const pos = e.localPositionMs();
      const startAt = clock.serverNow() + START_MARGIN_MS;
      const state: PlaybackState = { ...cur, isPlaying: true, positionMs: pos, atServerTs: startAt };
      stateRef.current = state;
      await safeEngine((eng) => eng.scheduleStart(cur.track as Track, pos, startAt));
      transport.emit("playback:start", { track: cur.track, positionMs: pos, startAtServerTs: startAt, by: meId });
      syncMirrors(state);
    }
    startHeartbeat(); // keep drift heartbeats running after resume (no-op if already running)
    updateLobby();
  }, [meId, safeEngine, syncMirrors, updateLobby, startHeartbeat]);

  const seek = useCallback(
    (ms: number) => {
      if (!isHostRef.current) return;
      const e = engineRef.current;
      const transport = transportRef.current;
      const clock = clockRef.current;
      const cur = stateRef.current;
      if (!e || !transport || !clock || !cur?.track) return;

      if (cur.isPlaying) {
        const startAt = clock.serverNow() + START_MARGIN_MS;
        const state: PlaybackState = { ...cur, positionMs: ms, atServerTs: startAt };
        stateRef.current = state;
        void safeEngine((eng) => eng.scheduleStart(cur.track as Track, ms, startAt));
        transport.emit("playback:start", { track: cur.track, positionMs: ms, startAtServerTs: startAt, by: meId });
        syncMirrors(state);
      } else {
        e.seekLocal(ms);
        const state: PlaybackState = { ...cur, positionMs: ms, atServerTs: clock.serverNow() };
        stateRef.current = state;
        transport.emit("playback:heartbeat", { state });
        setPositionMs(ms);
      }
    },
    [meId, safeEngine, syncMirrors],
  );

  const next = useCallback(() => {
    if (!isHostRef.current) return;
    let nextTrack: Track | undefined;
    if (queueRef.current.length > 0) {
      const [head, ...rest] = queueRef.current;
      nextTrack = head.track;
      queueRef.current = rest;
      setQueue(rest);
      transportRef.current?.emit("queue:update", { items: rest });
    } else {
      const cur = stateRef.current?.track;
      const idx = DEMO_TRACKS.findIndex((d) => d.uri === cur?.uri);
      nextTrack = DEMO_TRACKS[(idx + 1) % DEMO_TRACKS.length];
    }
    if (nextTrack) void playTrack(nextTrack);
  }, [playTrack]);

  const prev = useCallback(() => {
    if (!isHostRef.current) return;
    const cur = stateRef.current?.track;
    const idx = DEMO_TRACKS.findIndex((d) => d.uri === cur?.uri);
    const prevTrack = DEMO_TRACKS[(idx - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length];
    void playTrack(prevTrack);
  }, [playTrack]);

  // keep a stable ref to `next` for the engine's onEnded callback
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const addToQueue = useCallback(
    (t: Track) => {
      const transport = transportRef.current;
      if (!transport) return;
      if (isHostRef.current) {
        const item: QueueItem = { id: uid(), track: t, addedBy: meId, addedByName: me?.name ?? "Host" };
        queueRef.current = [...queueRef.current, item];
        setQueue(queueRef.current);
        transport.emit("queue:update", { items: queueRef.current });
      } else {
        transport.emit("queue:add", { track: t, addedBy: meId, addedByName: me?.name ?? "Listener" });
      }
    },
    [meId, me?.name],
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      const transport = transportRef.current;
      if (!transport) return;
      if (isHostRef.current) {
        queueRef.current = queueRef.current.filter((q) => q.id !== id);
        setQueue(queueRef.current);
        transport.emit("queue:update", { items: queueRef.current });
      } else {
        transport.emit("queue:remove", { id });
      }
    },
    [],
  );

  const reorderQueue = useCallback((orderedIds: string[]) => {
    const transport = transportRef.current;
    if (!transport) return;
    if (isHostRef.current) {
      const map = new Map(queueRef.current.map((q) => [q.id, q]));
      queueRef.current = orderedIds.map((id) => map.get(id)).filter((q): q is QueueItem => Boolean(q));
      setQueue(queueRef.current);
      transport.emit("queue:update", { items: queueRef.current });
    } else {
      transport.emit("queue:reorder", { orderedIds });
    }
  }, []);

  const resolveLocalFile = useCallback(
    async (file: File) => {
      const fileName = stateRef.current?.track?.fileName;
      if (!fileName) return;
      registerLocalFileAs(fileName, file); // map their copy to the host's track name
      setUnresolved(false);
      await unlockAudio();
      audioReadyRef.current = true;
      setAudioReady(true);
      const s = stateRef.current;
      if (s) await safeEngine((e) => e.applyHeartbeat(s)); // now resolves → plays in sync
    },
    [safeEngine],
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      const r: ReactionEvent = { id: uid(), userId: meId, emoji, ts: Date.now() };
      pushReaction(r);
      transportRef.current?.emit("reaction:broadcast", r);
    },
    [meId, pushReaction],
  );

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const m: ChatMessage = {
        id: uid(),
        userId: meId,
        name: me?.name ?? "Listener",
        avatar: me?.avatar ?? "🎧",
        text: trimmed,
        ts: clockRef.current?.serverNow() ?? Date.now(),
      };
      setChat((prev) => [...prev.slice(-99), m]);
      transportRef.current?.emit("chat:broadcast", m);
    },
    [meId, me?.name, me?.avatar],
  );

  const transferHost = useCallback(
    (userId: string) => {
      if (!isHostRef.current || userId === meId) return;
      setHostId(userId);
      transportRef.current?.emit("session:host_changed", { hostId: userId });
      void demote();
    },
    [meId, demote],
  );

  const syncQuality: SyncQuality = useMemo(() => {
    if (skewMs == null || !isPlaying) return isPlaying ? "unknown" : "ok";
    if (skewMs < 30) return "ok";
    if (skewMs < 80) return "warn";
    return "bad";
  }, [skewMs, isPlaying]);

  return {
    ready,
    mode,
    isHost,
    hostId,
    roomName,
    members,
    track,
    isPlaying,
    positionMs,
    durationMs,
    skewMs,
    syncQuality,
    clockOffset,
    audioReady,
    unresolved,
    queue,
    chat,
    reactions,
    unlock,
    playTrack,
    togglePlay,
    seek,
    next,
    prev,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    resolveLocalFile,
    sendReaction,
    sendChat,
    transferHost,
  };
}
